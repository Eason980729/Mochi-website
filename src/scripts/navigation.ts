export function initializeNavigation() {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const navigation = header?.querySelector<HTMLElement>('#site-navigation');
  if (!header || !toggle || !navigation) return;

  const close = (restoreFocus = false) => {
    header.removeAttribute('data-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '開啟選單');
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') close();
    else {
      header.setAttribute('data-menu-open', '');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '關閉選單');
      navigation.querySelector<HTMLAnchorElement>('a')?.focus();
    }
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => close()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      close(true);
    }
  });
  header.addEventListener('focusout', (event) => {
    if (event.relatedTarget instanceof Node && !header.contains(event.relatedTarget)) close();
  });
  matchMedia('(max-width: 780px)').addEventListener('change', () => close());
}
