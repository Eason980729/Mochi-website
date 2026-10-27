/** Shared pre-paint initialization. Reactive updates are owned by theme.ts after parsing. */
export const themeBootstrap = `
(() => {
  let stored;
  try { stored = localStorage.getItem('starlight-theme'); } catch {}
  const preference = stored === 'light' || stored === 'dark' ? stored : 'system';
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = preference === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
})();
`;
