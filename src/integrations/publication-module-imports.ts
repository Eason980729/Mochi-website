import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import type { Loader, LoaderContext } from 'astro/loaders';

function importsFile(root: URL, development: boolean): URL {
  return new URL(`.astro/mochi-docs/${development ? 'dev' : 'static'}-${process.pid}/imports.mjs`, root);
}

/**
 * Astro 7.4 shares .astro/content-modules.mjs between dev, sync, and build.
 * Keep each process's rendering imports separate, using the entries registered by glob().
 * The two virtual module IDs below follow Astro 7's deferred-render protocol; regression
 * checks exercise them with real Markdown/MDX instead of patching Astro's runtime or cache.
 */
export function publicationModuleImports(): AstroIntegration {
  return {
    name: 'mochi:publication-module-imports',
    hooks: {
      'astro:config:setup'({ command, config, updateConfig }) {
        updateConfig({
          // Accept both Docs URL forms in dev; production keeps its existing canonical policy.
          ...(command === 'dev' && config.trailingSlash === 'never' ? { trailingSlash: 'ignore' as const } : {}),
          vite: {
            resolve: {
              alias: [{
                find: 'astro:content-module-imports',
                replacement: fileURLToPath(importsFile(config.root, command === 'dev')),
              }],
            },
          },
        });
      },
    },
  };
}

/** Wrap the public DataStore API so additions/edits/deletions also update the dev import map. */
export function isolatePublicationImports(loader: Loader): Loader {
  return {
    ...loader,
    async load(context) {
      const file = importsFile(context.config.root, Boolean(context.watcher));
      mkdirSync(new URL('./', file), { recursive: true });
      let loading = true;
      let previous = '';
      function flush() {
        if (loading) return;
        const paths = context.store.values()
          .filter((entry) => entry.deferredRender && entry.filePath)
          .map((entry) => entry.filePath!)
          .sort();
        const entries = paths.map((path) => {
          const id = 'astro:content-layer-deferred-module';
          const params = new URLSearchParams(id);
          params.set('fileName', path);
          params.set('astroContentModuleFlag', 'true');
          return `[${JSON.stringify(path)}, () => import(${JSON.stringify(`${id}?${params}`)})]`;
        });
        const code = `export default new Map([\n${entries.join(',\n')}\n]);\n`;
        if (code === previous) return;
        const temporary = new URL('./imports.tmp', file);
        writeFileSync(temporary, code);
        renameSync(temporary, file);
        previous = code;
      }
      const store: LoaderContext['store'] = {
        ...context.store,
        set(entry) { const changed = context.store.set(entry); flush(); return changed; },
        delete(id) { context.store.delete(id); flush(); },
        clear() { context.store.clear(); flush(); },
      };
      await loader.load({ ...context, store });
      loading = false;
      flush();
    },
  };
}
