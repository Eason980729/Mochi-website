import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { getPublicationStatus } from '../src/data/docs-publication.ts';
import { site } from '../src/data/site.ts';

// Integration fixtures live only in a disposable copy. Real documents/statuses are never edited.
const root = fileURLToPath(new URL('../', import.meta.url));
const sandbox = await mkdtemp(join(tmpdir(), 'mochi-publication-'));
const stamp = `MOCHI${randomUUID().replaceAll('-', '').toUpperCase()}`;
const marker = (label) => `${stamp}${label}`;
const astro = join(sandbox, 'node_modules/astro/bin/astro.mjs');
const policy = join(sandbox, 'src/data/docs-publication.ts');
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };
let dev;
const originalDocuments = [];

async function write(path, text) {
  const target = join(sandbox, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text);
}

function command(args, nodeEnv) {
  const child = spawn(process.execPath, [astro, ...args], {
    cwd: sandbox, env: { ...env, NODE_ENV: nodeEnv }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (data) => { output += data; });
  child.stderr.on('data', (data) => { output += data; });
  const done = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code, signal) => resolve({ code, signal, output }));
  });
  return { child, done, output: () => output };
}

async function build(nodeEnv = 'production') {
  const result = await command(['build'], nodeEnv).done;
  assert.equal(result.code, 0, result.output);
}

async function stop(server) {
  if (!server || server.child.exitCode !== null) return;
  server.child.kill('SIGTERM');
  const timer = setTimeout(() => server.child.kill('SIGKILL'), 3000);
  try { await server.done; } finally { clearTimeout(timer); }
}

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else result.push(path);
  }
  return result;
}

async function outputText() {
  let text = '';
  for (const path of await files(join(sandbox, 'dist'))) {
    const bytes = await readFile(path);
    text += bytes.toString('utf8');
    // Pagefind fragments/indexes use gzip. Scan decoded bytes as well as public raw files.
    const gzip = bytes.indexOf(Buffer.from([0x1f, 0x8b]));
    if (gzip >= 0 && gzip < 32) {
      try { text += gunzipSync(bytes.subarray(gzip)).toString('utf8'); } catch { /* Not gzip. */ }
    }
  }
  return text;
}

async function fragments() {
  const records = [];
  for (const path of await files(join(sandbox, 'dist/pagefind'))) {
    if (!path.endsWith('.pf_fragment')) continue;
    const bytes = await readFile(path);
    const gzip = bytes.indexOf(Buffer.from([0x1f, 0x8b]));
    const decoded = (gzip >= 0 ? gunzipSync(bytes.subarray(gzip)) : bytes).toString('utf8');
    const start = decoded.indexOf('{');
    records.push(JSON.parse(decoded.slice(start)));
  }
  return records;
}

async function assertPending(route, status) {
  const html = await readFile(join(sandbox, 'dist', route, 'index.html'), 'utf8');
  assert.ok(html.includes(`data-docs-publication="${status}"`), route);
  assert.ok(html.includes(status === 'review' ? '內容審核中' : '文件準備中'), route);
  const description = status === 'review'
    ? '這份文件尚未公開，請稍後再回來查看。'
    : '這份文件正在準備中，完成後將開放閱讀。';
  assert.ok(html.includes(`<p>${description}</p>`), `Wrong placeholder description: ${route}`);
  assert.match(html, /<h1\b[^>]*\bid="_top"[^>]*>[^<]+<\/h1>/);
  assert.ok(html.includes('<p class="docs-publication-links"><a href="/features">查看功能介紹</a><a href="/support">取得支援</a></p>'));
  assert.match(html, /<html\b[^>]*data-pagefind-ignore="all"/);
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.ok(!html.includes('data-pagefind-body'));
  assert.ok(html.includes('href="/features"') && html.includes('href="/support"'));
}

async function assertDevelopment(origin, trailingSlash = false) {
  const pages = new Map();
  for (const [route, canary] of originalDocuments) {
    const url = `${origin}/${route}${trailingSlash ? '/' : ''}`;
    const response = await fetch(url);
    const body = await response.text();
    assert.equal(response.status, 200, `${url}: ${body.slice(0, 300)}\n${dev.output().slice(-5000)}`);
    assert.ok(body.includes(canary), `Original Docs body missing: ${route}`);
    assert.ok(!body.includes('data-docs-publication='), `Production placeholder in dev: ${route}`);
    assert.ok(!body.includes('UnknownContentCollectionError'), `Astro error page: ${route}`);
    pages.set(route, body);
  }
  return pages;
}

// Validate the real approval list as well as the synthetic release/revocation fixtures.
async function assertApprovedDocuments(origin) {
  let built = false;
  const concurrent = await Promise.allSettled([
    build().finally(() => { built = true; }),
    (async () => {
      do {
        await assertDevelopment(origin);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!built);
    })(),
  ]);
  for (const result of concurrent) if (result.status === 'rejected') throw result.reason;
  const development = await assertDevelopment(origin);
  const output = await outputText();
  const search = await fragments();
  const sitemap = await readFile(join(sandbox, 'dist/sitemap-0.xml'), 'utf8');
  const sitemapPaths = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, url]) => new URL(url).pathname.replace(/\/$/, '')));
  const counts = { published: 0, review: 0, development: 0 };
  const headings = (html) => [...html.matchAll(/<h[1-6]\b[^>]*\bid="([^"]+)"/g)].map(([, id]) => id);
  const examples = (html) => [...html.matchAll(/<pre\b[^>]*>[\s\S]*?<\/pre>/g)]
    .map(([pre]) => pre.replace(/<[^>]*>/g, '').trim());
  for (const [route, canary] of originalDocuments) {
    const status = getPublicationStatus(route);
    counts[status]++;
    const html = await readFile(join(sandbox, 'dist', route, 'index.html'), 'utf8');
    const fragment = search.find((entry) => new URL(entry.url, site.url).pathname.replace(/\/$/, '') === `/${route}`);
    assert.ok(html.includes('aria-label="文件導覽"'), `Missing sidebar: ${route}`);
    if (status === 'published') {
      assert.ok(html.includes(canary), `Approved body absent: ${route}`);
      assert.ok(!html.includes('data-docs-publication='), `Approved page is a placeholder: ${route}`);
      assert.deepEqual(headings(html), headings(development.get(route)), `Lost heading anchors: ${route}`);
      assert.deepEqual(examples(html), examples(development.get(route)), `Lost code examples: ${route}`);
      assert.ok(fragment && JSON.stringify(fragment).includes(canary), `Approved body absent from Pagefind: ${route}`);
      assert.ok(sitemapPaths.has(`/${route}`), `Approved page absent from Sitemap: ${route}`);
    } else {
      await assertPending(route, status);
      assert.ok(!output.includes(canary), `Unapproved body leaked into static output: ${route}`);
      assert.ok(!fragment, `Unapproved page indexed: ${route}`);
      assert.ok(!sitemapPaths.has(`/${route}`), `Unapproved page in Sitemap: ${route}`);
    }
  }
  if (getPublicationStatus('docs') === 'published') {
    const homepage = await readFile(join(sandbox, 'src/content/docs/docs/index.mdx'), 'utf8');
    const links = [...homepage.matchAll(/\]\((\/docs[^)\s]*)\)/g)].map(([, href]) => href);
    assert.ok(links.includes('/docs/features') && links.includes('/docs/commands'), 'Docs homepage is missing its starting points.');
    for (const href of links) {
      const id = new URL(href, site.url).pathname;
      assert.equal(getPublicationStatus(id), 'published', `Docs homepage links to an unpublished document: ${href}`);
    }
    console.log('PASS Docs homepage: primary document links all point to approved pages.');
  }
  await assertNavigation();
  console.log(`PASS real approval list: ${counts.published} published / ${counts.review} review / ${counts.development} development; bodies, examples, anchors, Pagefind, Sitemap and navigation match policy while dev stays readable.`);
}

async function waitForBody(url, canary) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const response = await fetch(url);
    const body = await response.text();
    if (response.ok && body.includes(canary)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.fail(`Dev did not update: ${url}\n${dev.output().slice(-5000)}`);
}

async function assertNavigation() {
  const output = join(sandbox, 'dist');
  const paths = await files(output);
  const html = new Map(await Promise.all(paths.filter((path) => path.endsWith('.html')).map(async (path) => [path, await readFile(path, 'utf8')])));
  for (const [path, content] of html) {
    const base = new URL(path.slice(output.length), site.url);
    for (const [, href] of content.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const url = new URL(href.replaceAll('&amp;', '&'), base);
      if (url.origin !== base.origin) continue;
      let target = join(output, decodeURIComponent(url.pathname));
      if (!paths.includes(target)) target = join(target, 'index.html');
      assert.ok(paths.includes(target), `Missing navigation target: ${href}`);
      const destination = html.get(target);
      // The source document's section anchors return after that document is approved.
      if (url.hash && destination && !destination.includes('data-docs-publication=')) {
        assert.ok(destination.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor: ${href}`);
      }
    }
  }
}

try {
  for (const path of ['src', 'public', '.gitignore', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
    await cp(join(root, path), join(sandbox, path), { recursive: true });
  }
  // Astro's dev compiler resolves styles against the project root; a cross-root symlink
  // breaks that resolution. Copy installed dependencies without installing or sharing caches.
  await cp(join(root, 'node_modules'), join(sandbox, 'node_modules'), {
    recursive: true, mode: constants.COPYFILE_FICLONE,
    filter: (path) => !/\/node_modules\/(?:\.vite|\.astro)(?:\/|$)/.test(path),
  });
  const docsDirectory = join(sandbox, 'src/content/docs');
  for (const path of await files(docsDirectory)) {
    if (!/\.(md|mdx)$/.test(path)) continue;
    const route = path.slice(docsDirectory.length + 1).replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
    const canary = marker(`DOCUMENT${originalDocuments.length}`);
    originalDocuments.push([route, canary]);
    // Only the temporary copy receives markers, proving the original pages render real bodies.
    await writeFile(path, `${await readFile(path, 'utf8')}\n\n${canary}\n`);
  }
  const originalPolicy = await readFile(policy, 'utf8');
  const routes = {
    review: 'docs/release-check/review', development: 'docs/release-check/development',
    default: 'publication-default', markdown: 'docs/release-check/markdown',
    mdx: 'docs/release-check/mdx', revoked: 'docs/release-check/revoked',
  };
  const document = (title, body, extra = '') => `---\ntitle: ${title}\n${extra}---\n\n${body}\n`;
  await write('src/content/docs/docs/release-check/review.md', document('Review fixture',
    `${marker('REVIEWBODY')}\n\n\`\`\`txt\n${marker('CODE')}\n\`\`\``,
    `description: ${marker('METADATA')}\nhead:\n  - tag: meta\n    attrs:\n      name: private-test\n      content: ${marker('HEAD')}\n`));
  await write('src/content/docs/publication-default.md', document('Default fixture', marker('DEFAULTBODY')));
  await write('src/content/docs/docs/release-check/markdown.md', document('Published Markdown fixture', marker('PUBLICMD')));
  await write('src/content/docs/docs/release-check/mdx.mdx', document('Published MDX fixture',
    `export const message = '${marker('PUBLICMDX')}';\n\n<p>{message}</p>`));
  await write('src/assets/publication-private.txt', marker('RAWASSET'));
  await write('src/components/PublicationProbe.astro', `<p>Fixture component</p>\n<script>console.info('${marker('JAVASCRIPT')}');</script>\n<style>p::after { content: '${marker('CSSASSET')}'; }</style>`);
  const privateMdx = document('Private MDX fixture',
    `import Probe from '../../../../components/PublicationProbe.astro';\nimport secret from '../../../../assets/publication-private.txt?raw';\n\n<Probe />\n<pre>{secret}</pre>\n<p>${marker('MDXBODY')}</p>\n<div class="before:content-['${marker('TAILWIND')}']">Fixture</div>`);
  await write('src/content/docs/docs/release-check/development.mdx', privateMdx);
  await write('src/content/docs/docs/release-check/revoked.mdx', privateMdx.replaceAll(marker('MDXBODY'), marker('REVOKEDBODY')));
  for (const legal of ['terms', 'privacy']) {
    const path = `src/content/docs/docs/${legal}.md`;
    await write(path, `${await readFile(join(sandbox, path), 'utf8')}\n${marker(legal.toUpperCase())}\n`);
  }
  const setPolicy = async (published) => {
    const statuses = {
      [routes.review]: 'review', [routes.development]: 'development',
      [routes.markdown]: published ? 'published' : 'review',
      [routes.mdx]: published ? 'published' : 'review',
      [routes.revoked]: published ? 'published' : 'review',
    };
    // Keep this fixture repeatable after real pages are approved in the future.
    // This reset applies exclusively to the disposable copy, never the actual policy.
    const reset = `\nfor (const id of Object.keys(docsPublication)) docsPublication[id] = 'review';\ndocsPublication['docs/terms'] = 'development';\ndocsPublication['docs/privacy'] = 'development';\n`;
    await writeFile(policy, originalPolicy + reset + Object.entries(statuses).map(([id, state]) => `\ndocsPublication[${JSON.stringify(id)}] = ${JSON.stringify(state)};`).join(''));
  };

  const socket = createServer();
  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', resolve);
  });
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  dev = command(['dev', '--ignore-lock', '--host', '127.0.0.1', '--port', String(port)], 'development');
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 160; attempt++) {
    if (dev.child.exitCode !== null) throw new Error(dev.output());
    try { if ((await fetch(`${origin}/docs`)).ok) { ready = true; break; } } catch { /* Starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, dev.output().slice(-4000));
  for (const [route, canary] of [
    [routes.review, 'REVIEWBODY'], [routes.development, 'MDXBODY'],
    [routes.default, 'DEFAULTBODY'], ['docs/terms', 'TERMS'], ['docs/privacy', 'PRIVACY'],
  ]) {
    const response = await fetch(`${origin}/${route}`);
    assert.equal(response.status, 200, route);
    assert.ok((await response.text()).includes(marker(canary)), `Dev content missing: ${route}`);
  }
  await assertDevelopment(origin);
  await assertDevelopment(origin, true);
  console.log('PASS development: review/development/default/legal original bodies are visible.');

  await assertApprovedDocuments(origin);
  await setPolicy(true);
  await build();
  await assertDevelopment(origin);
  await assertDevelopment(origin, true);
  for (const [route, state] of [[routes.review, 'review'], [routes.development, 'development'], [routes.default, 'review'], ['docs/terms', 'development'], ['docs/privacy', 'development']]) await assertPending(route, state);
  const mixed = await outputText();
  for (const suffix of ['REVIEWBODY', 'CODE', 'METADATA', 'HEAD', 'DEFAULTBODY', 'TERMS', 'PRIVACY']) assert.ok(!mixed.includes(marker(suffix)), `Leaked ${suffix}`);
  for (const [, canary] of originalDocuments) assert.ok(!mixed.includes(canary), 'Original Docs body leaked.');
  const search = JSON.stringify(await fragments());
  for (const suffix of ['PUBLICMD', 'PUBLICMDX', 'REVOKEDBODY']) assert.ok(search.includes(marker(suffix)), `Published content absent from search: ${suffix}`);
  for (const route of [routes.review, routes.development, routes.default, 'docs/terms', 'docs/privacy']) assert.ok(!search.includes(`/${route}/`), `Pending page in search: ${route}`);
  const sitemap = await readFile(join(sandbox, 'dist/sitemap-0.xml'), 'utf8');
  assert.ok(sitemap.includes(`/${routes.markdown}<`) && sitemap.includes(`/${routes.mdx}<`));
  for (const route of [routes.review, routes.development, routes.default, 'docs/terms', 'docs/privacy']) assert.ok(!sitemap.includes(`/${route}<`), `Pending page in Sitemap: ${route}`);
  console.log('PASS mixed production: approved Markdown/MDX render and are indexed; pending bodies/metadata/code are absent; Sitemap excludes pending routes.');

  const hotPath = 'src/content/docs/docs/release-check/hot.mdx';
  await write(hotPath, document('Hot reload fixture', `<p>${marker('HOTMDX')}</p>`));
  await waitForBody(`${origin}/docs/release-check/hot`, marker('HOTMDX'));
  await write(hotPath, document('Hot reload fixture', `<p>${marker('HOTUPDATED')}</p>`));
  await waitForBody(`${origin}/docs/release-check/hot`, marker('HOTUPDATED'));
  console.log(`PASS live dev: all ${originalDocuments.length} original Docs render before/after build, both URL forms work, and new/edited MDX renders without restart.`);

  await setPolicy(false);
  await build();
  await assertDevelopment(origin);
  const locked = await outputText();
  for (const suffix of ['REVIEWBODY', 'CODE', 'METADATA', 'HEAD', 'DEFAULTBODY', 'TERMS', 'PRIVACY', 'MDXBODY', 'REVOKEDBODY', 'RAWASSET', 'JAVASCRIPT', 'CSSASSET', 'TAILWIND', 'PUBLICMD', 'PUBLICMDX', 'HOTMDX', 'HOTUPDATED']) {
    assert.ok(!locked.includes(marker(suffix)), `Body, asset, index or cache leak after revocation: ${suffix}`);
  }
  for (const route of Object.values(routes)) await assertPending(route, route === routes.development ? 'development' : 'review');
  const emptySearch = JSON.stringify(await fragments());
  assert.ok(!emptySearch.includes('/docs/') && !emptySearch.includes('/publication-default'), 'Pending page indexed when no Docs are published.');
  assert.ok(!(await readFile(join(sandbox, 'dist/sitemap-0.xml'), 'utf8')).includes('/docs/'));
  await assertNavigation();
  console.log('PASS revocation/zero approval: warm dev/build caches, MDX scripts/assets, Tailwind content, search and Sitemap disclose no fixture bodies.');

  await build('development');
  await assertDevelopment(origin);
  const overridden = await outputText();
  for (const suffix of ['REVIEWBODY', 'DEFAULTBODY', 'MDXBODY', 'PUBLICMD', 'PUBLICMDX']) assert.ok(!overridden.includes(marker(suffix)), `NODE_ENV override disclosed ${suffix}`);
  await assertPending(routes.default, 'review');
  assert.ok(!JSON.stringify(await fragments()).includes('/docs/'));
  await rm(join(sandbox, hotPath));
  // Deleting an MDX entry must also remove its lazy import, without breaking remaining pages.
  for (let attempt = 0; attempt < 100; attempt++) {
    if ((await fetch(`${origin}/docs/release-check/hot`)).status === 404) break;
    assert.ok(attempt < 99, 'Deleted MDX route remained available.');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await assertDevelopment(origin);
  console.log('PASS build safety/navigation: NODE_ENV=development does not publish drafts; internal links and public anchors remain valid.');
  console.log('All publication checks passed. Real documents/statuses were not changed.');
} finally {
  await stop(dev);
  await rm(sandbox, { recursive: true, force: true });
}
