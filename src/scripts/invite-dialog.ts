/** Native modal dialogs provide focus containment, background inertness and Escape handling. */
export function initializeInviteDialog() {
  const trigger = document.querySelector<HTMLButtonElement>('[data-invite-trigger]');
  const dialog = document.querySelector<HTMLDialogElement>('#invite-dialog');
  if (!trigger || !dialog) return;

  let scrollY = 0;
  let previousBodyStyle: string | null = null;
  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    scrollY = window.scrollY;
    previousBodyStyle = document.body.getAttribute('style');
    dialog.showModal();
    // A fixed body also prevents background scrolling on mobile browsers.
    Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden' });
  });

  dialog.querySelectorAll<HTMLButtonElement>('[data-close-invite]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (previousBodyStyle === null) document.body.removeAttribute('style');
    else document.body.setAttribute('style', previousBodyStyle);
    window.scrollTo({ top: scrollY, behavior: 'instant' });
    trigger.focus({ preventScroll: true });
  });
}
