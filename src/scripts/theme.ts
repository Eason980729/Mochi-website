type Theme = 'system' | 'light' | 'dark';
type Reveal = { cancelled: boolean; transition?: ViewTransition; animation?: Animation };
const key = 'starlight-theme';
const parseTheme = (value: unknown): Theme => value === 'light' || value === 'dark' ? value : 'system';
const order: Theme[] = ['system', 'light', 'dark'];
const labels: Record<Theme, string> = { system: '跟隨系統', light: '淺色', dark: '深色' };
let initialized = false;

/** One controller for the product header and every Starlight theme button. */
export function initializeThemeToggle() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  if (initialized || !buttons.length) return;
  initialized = true;
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let preference = parseTheme(root.dataset.themePreference);
  let storageAvailable = true;
  let active: Reveal | undefined;
  const resolve = () => preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
  const commit = () => {
    root.dataset.theme = resolve();
    root.dataset.themePreference = preference;
    const next = order[(order.indexOf(preference) + 1) % order.length]!;
    const label = `切換主題，目前：${labels[preference]}；下一個：${labels[next]}`;
    buttons.forEach((button) => {
      button.setAttribute('aria-label', label);
      button.title = label;
      button.disabled = false;
    });
  };
  const cancelReveal = () => {
    if (!active) return;
    active.cancelled = true;
    active.animation?.cancel();
    active.transition?.skipTransition();
  };
  const applyImmediately = () => {
    cancelReveal();
    // Suppress existing link/button hover transitions during a palette change, too.
    root.dataset.themeUpdating = '';
    commit();
    void root.getBoundingClientRect();
    if (!active) delete root.dataset.themeUpdating;
  };
  const applyFromButton = (button: HTMLButtonElement) => {
    if (active || reducedMotion.matches || typeof document.startViewTransition !== 'function'
      || typeof root.animate !== 'function' || root.dataset.theme === resolve()) {
      applyImmediately();
      return;
    }
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))) + 1;
    const run: Reveal = { cancelled: false };
    active = run;
    root.dataset.themeReveal = '';
    root.dataset.themeUpdating = '';
    const cleanup = () => {
      if (active !== run) return;
      active = undefined;
      delete root.dataset.themeReveal;
      delete root.dataset.themeUpdating;
    };
    try {
      const transition = document.startViewTransition(() => {
        // skipTransition() still runs this callback. Ignore stale work after another input.
        if (!run.cancelled) commit();
      });
      run.transition = transition;
      void transition.ready.then(() => {
        if (run.cancelled) return;
        run.animation = root.animate({
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        }, {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        });
      }).catch(() => {
        // A skipped transition or unsupported pseudo-element animation must not block the theme.
        if (active === run) applyImmediately();
      });
      void transition.finished.then(cleanup, () => {
        applyImmediately();
        cleanup();
      });
    } catch {
      cleanup();
      applyImmediately();
    }
  };
  const cycle = (button: HTMLButtonElement) => {
    preference = order[(order.indexOf(preference) + 1) % order.length]!;
    try { localStorage.setItem(key, preference); }
    catch { storageAvailable = false; /* Keep switching on this page when storage is blocked. */ }
    applyFromButton(button);
  };
  buttons.forEach((button) => button.addEventListener('click', () => cycle(button)));
  document.addEventListener('click', (event) => {
    // Native snapshot capture can target <html> instead of the button. Keep rapid pointer
    // clicks on the same visible control working, without handling unrelated page clicks.
    if (!active || event.target !== root || event.detail === 0) return;
    const button = [...buttons].find((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && event.clientX >= rect.left
        && event.clientX <= rect.left + rect.width && event.clientY >= rect.top
        && event.clientY <= rect.top + rect.height;
    });
    if (button) {
      cycle(button);
      button.focus({ preventScroll: true });
    }
  });
  system.addEventListener('change', () => { if (preference === 'system') applyImmediately(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) applyImmediately(); });
  window.addEventListener('storage', (event) => {
    if (event.key !== key && event.key !== null) return;
    try { if (event.storageArea && event.storageArea !== localStorage) return; }
    catch { return; }
    preference = parseTheme(event.newValue);
    applyImmediately();
  });
  // Back/forward cache may restore a page whose preference changed in another tab.
  window.addEventListener('pageshow', () => {
    if (storageAvailable) {
      try { preference = parseTheme(localStorage.getItem(key)); }
      catch { storageAvailable = false; }
    }
    applyImmediately();
  });
  commit();
}
