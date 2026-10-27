/** CSS owns the finite animations; this controller only coordinates typing and visibility. */
export function createHeroEntrance(hero: HTMLElement | null) {
  if (!hero) return;
  const preview = hero.querySelector<HTMLElement>('.interaction-preview');
  const description = hero.querySelector<HTMLElement>('.hero-description');
  const primary = hero.querySelector<HTMLElement>('.hero-actions > .button-primary');
  const secondary = hero.querySelector<HTMLElement>('.hero-actions > .button-secondary');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  // Match the single-column Hero breakpoint once. Resizing must not restart this visit's sequence.
  const sequential = matchMedia('(max-width: 780px)').matches;
  let observer: IntersectionObserver | undefined;
  let stopped = false;
  let previewStarted = false;
  let copyReady = false;
  let descriptionDone = !description;
  let primaryDone = !primary;
  let secondaryDone = !secondary;
  const destroy = () => {
    if (stopped) return;
    stopped = true;
    observer?.disconnect();
    window.removeEventListener('scroll', revealPreview);
    window.removeEventListener('resize', revealPreview);
    motion.removeEventListener('change', onMotionChange);
    hero.removeEventListener('animationend', onAnimation);
    hero.removeEventListener('animationcancel', onAnimation);
    hero.removeEventListener('focusin', onFocus);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    delete hero.dataset.heroEntrance;
    delete hero.dataset.heroCopyReady;
    delete hero.dataset.heroSequential;
    delete hero.dataset.heroActionsReady;
    if (primary) delete primary.dataset.heroActionDone;
    if (secondary) delete secondary.dataset.heroActionDone;
    if (preview) delete preview.dataset.heroPreview;
  };
  const onMotionChange = () => { if (motion.matches) destroy(); };
  const onVisibilityChange = () => { if (document.hidden) destroy(); };
  const revealPreview = () => {
    if (stopped || !preview || previewStarted) return;
    if (sequential && !(copyReady && descriptionDone && primaryDone && secondaryDone)) return;
    // Recheck the current viewport, rather than remembering an earlier scroll into view.
    const rect = preview.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
    previewStarted = true;
    preview.dataset.heroPreview = '';
    observer?.disconnect();
    window.removeEventListener('scroll', revealPreview);
    window.removeEventListener('resize', revealPreview);
  };
  const settleAction = (action: HTMLElement) => {
    action.dataset.heroActionDone = '';
    if (action === primary) primaryDone = true;
    if (action === secondary) secondaryDone = true;
    revealPreview();
  };
  const settleDescription = () => {
    descriptionDone = true;
    if (sequential) hero.dataset.heroActionsReady = '';
    // Focus or an animation override may skip an effect entirely. Never wait for a missing event.
    if (primary && !getComputedStyle(primary).animationName.split(',').some((name) => name.trim() === 'hero-invite-nudge')) settleAction(primary);
    if (secondary && !getComputedStyle(secondary).animationName.split(',').some((name) => name.trim() === 'hero-button-in')) settleAction(secondary);
    revealPreview();
  };
  const onAnimation = (event: AnimationEvent) => {
    if (stopped || !copyReady) return;
    if (event.target === description && event.animationName === 'hero-description-in') settleDescription();
    if (primary && event.target === primary && (event.animationName === 'hero-invite-nudge'
      || (event.type === 'animationcancel' && event.animationName === 'hero-button-in'))) settleAction(primary);
    if (secondary && event.target === secondary && event.animationName === 'hero-button-in') settleAction(secondary);
  };
  const onFocus = (event: FocusEvent) => {
    // Keyboard users can use either button immediately; skip its remaining entrance permanently.
    if (primary?.contains(event.target as Node)) settleAction(primary);
    if (secondary?.contains(event.target as Node)) settleAction(secondary);
  };

  try {
    motion.addEventListener('change', onMotionChange);
    hero.addEventListener('animationend', onAnimation);
    hero.addEventListener('animationcancel', onAnimation);
    hero.addEventListener('focusin', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    // No content is hidden before JS succeeds; cancellation/cleanup restores visibility.
    hero.dataset.heroEntrance = '';
    if (sequential) hero.dataset.heroSequential = '';
    if (preview && typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) revealPreview();
      }, { threshold: 0 });
      observer.observe(preview);
    } else if (preview) {
      window.addEventListener('scroll', revealPreview, { passive: true });
      window.addEventListener('resize', revealPreview);
    }
    revealPreview();
  } catch {
    destroy();
    return;
  }

  return {
    revealCopy() {
      if (stopped || copyReady) return;
      copyReady = true;
      hero.dataset.heroCopyReady = '';
      if (!description || getComputedStyle(description).animationName !== 'hero-description-in') settleDescription();
    },
    destroy,
  };
}
