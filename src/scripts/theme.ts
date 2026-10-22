type Theme = 'auto' | 'light' | 'dark';
const key = 'starlight-theme';
const parseTheme = (value: unknown): Theme => value === 'light' || value === 'dark' ? value : 'auto';

/** Share Starlight's preference without importing its document layout. */
export function initializeThemePicker() {
  const picker = document.querySelector<HTMLSelectElement>('[data-theme-picker]');
  if (!picker) return;
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference: Theme = 'auto';
  try { preference = parseTheme(localStorage.getItem(key)); } catch { /* Storage may be blocked. */ }
  const apply = () => {
    document.documentElement.dataset.theme = preference === 'auto' ? (system.matches ? 'dark' : 'light') : preference;
    picker.value = preference;
  };
  picker.addEventListener('change', () => {
    preference = parseTheme(picker.value);
    try {
      if (preference === 'auto') localStorage.removeItem(key);
      else localStorage.setItem(key, preference);
    } catch { /* Theme switching still works for the current page. */ }
    apply();
  });
  system.addEventListener('change', () => { if (preference === 'auto') apply(); });
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) { preference = parseTheme(event.newValue); apply(); }
  });
  apply();
}
