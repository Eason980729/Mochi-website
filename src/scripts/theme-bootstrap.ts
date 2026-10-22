/** Inline before paint in both layouts; also restore native Starlight pickers after back/forward cache. */
export const themeBootstrap = `
(() => {
  const restore = () => {
    let stored;
    try { stored = localStorage.getItem('starlight-theme'); } catch {}
    const preference = stored === 'light' || stored === 'dark' ? stored : 'auto';
    document.documentElement.dataset.theme = preference === 'auto'
      ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : preference;
    window.StarlightThemeProvider?.updatePickers(preference);
  };
  restore();
  window.addEventListener('pageshow', restore);
})();
`;
