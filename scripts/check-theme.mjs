import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const compile = (text) => ts.transpileModule(text, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const bootExports = {};
vm.runInNewContext(compile(await source('src/scripts/theme-bootstrap.ts')), { exports: bootExports });
const bootstrap = bootExports.themeBootstrap;
const controller = compile(await source('src/scripts/theme.ts'));
const key = 'starlight-theme';

// Exercise the actual scripts with deterministic OS/storage/transition events, without changing
// the user's browser preferences or requiring another DOM/browser dependency.
function page({ saved = new Map(), dark = false, reduce = false, blockedRead = false, blockedWrite = false, viewTransitions = false, startThrows = false, animationThrows = false } = {}) {
  const animations = [];
  const transitions = [];
  const root = {
    dataset: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    animate(keyframes, options) {
      if (animationThrows) throw new Error("Unsupported pseudo-element animation");
      const animation = { keyframes, options, cancelled: false, cancel() { this.cancelled = true; } };
      animations.push(animation);
      return animation;
    },
  };
  const listeners = new Map();
  let writes = 0;

  function media(matches) {
    const callbacks = [];
    return {
      matches,
      addEventListener(type, callback) { assert.equal(type, 'change'); callbacks.push(callback); },
      change(value) { this.matches = value; callbacks.forEach((fn) => fn()); },
    };
  }
  const os = media(dark);
  const motion = media(reduce);
  const storage = {
    getItem(name) { if (blockedRead) throw new Error('Blocked storage'); return saved.get(name) ?? null; },
    setItem(name, value) { if (blockedWrite) throw new Error('Blocked storage'); saved.set(name, value); writes++; },
  };
  const buttons = Array.from({ length: 2 }, (_, index) => {
    const callbacks = [];
    return {
      disabled: true, title: '', attributes: {},
      focus() {},
      getBoundingClientRect: () => ({ left: 100 + index * 600, top: 8, width: 44, height: 44 }),
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(type, callback) { assert.equal(type, 'click'); callbacks.push(callback); },
      click() { assert.equal(this.disabled, false); callbacks.forEach((fn) => fn()); },
    };
  });
  const window = {
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(callback);
    },
    innerWidth: 800, innerHeight: 600,
  };
  const document = { documentElement: root, querySelectorAll: () => buttons, addEventListener: window.addEventListener };
  if (viewTransitions) document.startViewTransition = (callback) => {
    if (startThrows) throw new Error('Transition unavailable');
    let readyResolve, readyReject, finishedResolve, finishedReject;
    const transition = {
      ready: new Promise((resolve, reject) => { readyResolve = resolve; readyReject = reject; }),
      finished: new Promise((resolve, reject) => { finishedResolve = resolve; finishedReject = reject; }),
      skipped: false,
      skipTransition() { this.skipped = true; },
      rejectReady() { readyReject(new Error('Capture unavailable')); },
      update(fail = false) {
        callback(); // Even skipped transitions must run the update callback.
        if (fail || this.skipped) readyReject(new Error('Skipped'));
        else readyResolve();
      },
      finish(fail = false) { if (fail) finishedReject(new Error('Failed')); else finishedResolve(); },
    };
    transitions.push(transition);
    return transition;
  };
  const context = vm.createContext({
    document,
    window, localStorage: storage,
    matchMedia: (query) => {
      if (query === '(prefers-color-scheme: dark)') return os;
      assert.equal(query, '(prefers-reduced-motion: reduce)'); return motion;
    },
    getComputedStyle: () => ({ color: 'rgb(34, 37, 43)' }), exports: {},
  });
  vm.runInContext(bootstrap, context);
  const beforeController = { ...root.dataset };
  vm.runInContext(controller, context);
  context.exports.initializeThemeToggle();
  context.exports.initializeThemeToggle(); // Reinitialization must not double-bind a button.
  assert.ok(!('themeReveal' in root.dataset), 'Initial load animated.');
  assert.equal(transitions.length, 0);
  const emit = (type, event = {}) => (listeners.get(type) ?? []).forEach((fn) => fn(event));
  const finish = () => transitions.forEach((transition) => transition.finish());
  return { root, saved, os, motion, buttons, animations, transitions, emit, finish, beforeController, writes: () => writes };
}

for (const dark of [false, true]) {
  for (const invalid of [null, '', 'auto', 'invalid']) {
    const saved = invalid === null ? new Map() : new Map([[key, invalid]]);
    const p = page({ saved, dark });
    assert.equal(p.beforeController.themePreference, 'system');
    assert.equal(p.beforeController.theme, dark ? 'dark' : 'light');
    p.os.change(!dark);
    assert.equal(p.root.dataset.theme, dark ? 'light' : 'dark');
    assert.equal(p.root.dataset.themePreference, 'system');
    assert.equal(p.writes(), 0, 'An OS change wrote a manual preference.');
    p.finish();
    assert.ok(!('themeReveal' in p.root.dataset));
  }
}
console.log('PASS initial/system: defaults and legacy/invalid values follow the OS before paint; OS changes remain reactive without storage writes.');

const p = page({ dark: true });
for (const [mode, label, next] of [['light', '淺色', '深色'], ['dark', '深色', '跟隨系統'], ['system', '跟隨系統', '淺色']]) {
  p.buttons[0].click();
  assert.equal(p.root.dataset.themePreference, mode);
  assert.equal(p.saved.get(key), mode);
  for (const button of p.buttons) assert.equal(button.attributes['aria-label'], `切換主題，目前：${label}；下一個：${next}`);
  const reloaded = page({ saved: p.saved, dark: true });
  assert.equal(reloaded.beforeController.themePreference, mode);
  assert.equal(reloaded.beforeController.theme, mode === 'system' ? 'dark' : mode);
  p.finish();
}
assert.equal(p.writes(), 3, 'More than one owner persisted each click.');
p.buttons[1].click();
p.os.change(false); p.os.change(true);
assert.equal(p.root.dataset.theme, 'light', 'Explicit light mode followed an OS change.');
console.log('PASS cycle/reload: system → light → dark → system, storage, accessible labels and multiple controls stay synchronized.');

const tick = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };
const reveal = page({ dark: true, viewTransitions: true });
reveal.buttons[1].click();
assert.equal(reveal.transitions.length, 1);
assert.equal(reveal.root.dataset.theme, 'dark', 'Theme changed before the snapshot callback.');
reveal.transitions[0].update(); await tick();
assert.equal(reveal.root.dataset.theme, 'light');
const { keyframes, options } = reveal.animations[0];
assert.equal(keyframes.clipPath[0], 'circle(0px at 722px 30px)');
const radius = Number(keyframes.clipPath[1].match(/circle\((\d+)px/)[1]);
assert.ok(radius > Math.hypot(722, 570), 'Reveal does not cover the furthest viewport corner.');
assert.equal(options.duration, 400);
assert.equal(options.pseudoElement, '::view-transition-new(root)');
assert.equal(options.easing, 'cubic-bezier(0.4, 0, 0.2, 1)');
assert.deepEqual(Object.keys(keyframes), ['clipPath']);
reveal.finish(); await tick();
assert.ok(!('themeReveal' in reveal.root.dataset));
assert.ok(!('themeUpdating' in reveal.root.dataset));
// A resolved-color-preserving system → light switch must update labels without a reveal.
const same = page({ viewTransitions: true }); same.buttons[0].click();
assert.equal(same.transitions.length, 0);
assert.equal(same.root.dataset.themePreference, 'light');
// Unsupported APIs and reduced motion switch immediately, preserving all cycle behavior.
for (const settings of [{ dark: true }, { dark: true, reduce: true, viewTransitions: true },
  { dark: true, viewTransitions: true, startThrows: true }]) {
  const direct = page(settings); direct.buttons[0].click();
  assert.equal(direct.root.dataset.theme, 'light');
  assert.equal(direct.transitions.length, 0);
  assert.ok(!('themeReveal' in direct.root.dataset));
}
// Rapid input before the callback: a late callback must never restore an old selection.
const rapid = page({ dark: true, viewTransitions: true });
rapid.buttons[0].click(); rapid.buttons[1].click(); rapid.buttons[0].click();
assert.equal(rapid.transitions.length, 1);
assert.equal(rapid.transitions[0].skipped, true);
assert.equal(rapid.root.dataset.themePreference, 'system');
rapid.transitions[0].update(); rapid.finish(); await tick();
assert.equal(rapid.root.dataset.theme, 'dark');
assert.equal(rapid.root.dataset.themePreference, 'system');
assert.equal(rapid.animations.length, 0);
const pointer = page({ dark: true, viewTransitions: true });
pointer.buttons[1].click();
pointer.emit('click', { target: pointer.root, detail: 1, clientX: 20, clientY: 500 });
assert.equal(pointer.saved.get(key), 'light', 'An unrelated root click changed the theme.');
pointer.emit('click', { target: pointer.root, detail: 1, clientX: 722, clientY: 30 });
assert.equal(pointer.saved.get(key), 'dark', 'A pointer click retargeted during capture was lost.');
pointer.transitions[0].update(); pointer.finish(); await tick();
assert.equal(pointer.root.dataset.theme, 'dark');
assert.equal(pointer.transitions.length, 1);
// Motion preference changes cancel an in-progress reveal and clean up all flags.
const interrupted = page({ dark: true, viewTransitions: true });
interrupted.buttons[0].click(); interrupted.transitions[0].update(); await tick();
interrupted.motion.change(true);
assert.equal(interrupted.animations[0].cancelled, true);
interrupted.finish(); await tick();
assert.ok(!('themeReveal' in interrupted.root.dataset));
// A rejected ready promise or animation API failure must not leave an overlay behind.
for (const animationThrows of [false, true]) {
  const failed = page({ dark: true, viewTransitions: true, animationThrows });
  failed.buttons[0].click(); failed.transitions[0].update(!animationThrows); await tick();
  failed.finish(); await tick();
  assert.equal(failed.root.dataset.theme, 'light');
  assert.ok(!('themeReveal' in failed.root.dataset));
}
const automatic = page({ viewTransitions: true });
automatic.os.change(true);
automatic.emit('storage', { key, newValue: 'light' });
automatic.saved.set(key, 'dark'); automatic.emit('pageshow');
assert.equal(automatic.transitions.length, 0, 'An automatic update started a click reveal.');
// Automatic updates during a pending capture must cancel its stale callback, too.
for (const kind of ['os', 'storage', 'history']) {
  const pending = page({ saved: new Map([[key, 'dark']]), viewTransitions: true });
  pending.buttons[0].click(); // dark → system, with a pending light snapshot.
  if (kind === 'os') pending.os.change(true);
  else if (kind === 'storage') pending.emit('storage', { key, newValue: 'dark' });
  else { pending.saved.set(key, 'dark'); pending.emit('pageshow'); }
  assert.equal(pending.transitions[0].skipped, true);
  pending.transitions[0].update(); pending.finish(); await tick();
  assert.equal(pending.root.dataset.theme, 'dark', `${kind}: stale callback overwrote the automatic update.`);
  assert.ok(!('themeReveal' in pending.root.dataset));
}
const rejected = page({ dark: true, viewTransitions: true });
rejected.buttons[0].click(); rejected.transitions[0].update(); await tick();
rejected.transitions[0].finish(true); await tick();
assert.equal(rejected.root.dataset.theme, 'light');
assert.ok(!('themeUpdating' in rejected.root.dataset));
const skippedCapture = page({ dark: true, viewTransitions: true });
skippedCapture.buttons[0].click(); skippedCapture.transitions[0].rejectReady(); await tick();
assert.equal(skippedCapture.root.dataset.theme, 'light', 'A skipped capture lost the theme change.');
skippedCapture.transitions[0].update(); skippedCapture.finish(); await tick();
assert.equal(skippedCapture.root.dataset.themePreference, 'light');
assert.ok(!('themeReveal' in skippedCapture.root.dataset));
console.log('PASS reveal: button-center geometry, full viewport coverage, 400ms clip-path only, cancellation, rapid input, API failure and reduced-motion fallbacks.');

const tabs = page();
tabs.saved.set(key, 'dark');
tabs.emit('storage', { key, newValue: 'dark', storageArea: {} });
assert.equal(tabs.root.dataset.themePreference, 'system', 'Session storage affected the theme.');
tabs.emit('storage', { key, newValue: 'dark' });
assert.equal(tabs.root.dataset.themePreference, 'dark');
tabs.saved.set(key, 'light');
tabs.emit('pageshow');
assert.equal(tabs.root.dataset.themePreference, 'light');
assert.ok(!('themeReveal' in tabs.root.dataset), 'History restoration animated.');
tabs.saved.clear(); tabs.emit('storage', { key: null, newValue: null });
assert.equal(tabs.root.dataset.themePreference, 'system');
for (const path of ['/', '/features', '/support', '/docs']) {
  const navigated = page({ saved: new Map([[key, 'dark']]) });
  assert.equal(navigated.beforeController.theme, 'dark', path);
  assert.equal(navigated.root.dataset.themePreference, 'dark', path);
}
for (const blocked of [{ blockedRead: true, blockedWrite: true }, { blockedWrite: true }]) {
  const denied = page({ saved: new Map([[key, 'dark']]), ...blocked });
  denied.buttons[0].click();
  const chosen = denied.root.dataset.themePreference;
  denied.emit('pageshow');
  assert.equal(denied.root.dataset.themePreference, chosen);
}
console.log('PASS navigation/storage: cross-tab updates, clearing, history restoration, shared navigation and blocked storage are handled.');

for (const path of ['index.html', 'features/index.html', 'support/index.html', 'docs/index.html']) {
  const html = await source(`dist/${path}`);
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .filter((match) => !/^<script\b[^>]*type="module"/.test(match[0]) && match[1].includes(key));
  assert.equal(scripts.length, 1, `${path}: competing inline theme owners`);
  assert.ok(scripts[0][1].includes('themePreference'));
  assert.ok(html.indexOf(scripts[0][0]) < html.indexOf('</head>'), `${path}: bootstrap is not before paint`);
  assert.ok(!html.includes('data-theme-picker') && !html.includes('<starlight-theme-select'));
  assert.ok(!html.includes('StarlightThemeProvider'));
  assert.match(html, /<button\b[^>]*data-theme-toggle[^>]*aria-label="切換主題/);
  for (const mode of ['system', 'light', 'dark']) assert.ok(html.includes(`data-theme-icon="${mode}"`));
}
const css = await source('src/styles/theme.css');
assert.ok(css.includes('::view-transition-new(root)') && css.includes('::view-transition-old(root)'));
assert.ok(css.includes('pointer-events: none') && css.includes('animation: none'));
assert.ok(!css.includes('225ms') && !css.includes('data-theme-transitioning'));
assert.ok(!css.includes('transition-property: all') && !/\bopacity\s*:/.test(css));
console.log('PASS production HTML: all four layouts use one pre-paint bootstrap and the same three-state button; native competing selectors are absent.');
