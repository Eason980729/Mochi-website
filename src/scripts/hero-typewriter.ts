import { createHeroEntrance } from './hero-entrance';

// Progressively enhance a fully rendered heading; hidden glyphs retain their layout space.
let stopTyping: (() => void) | undefined;
let stopEntrance: (() => void) | undefined;

const stopHero = () => {
  stopTyping?.();
  stopEntrance?.();
  stopEntrance = undefined;
};

function initializeHeroTypewriter() {
  const heading = document.querySelector<HTMLElement>('[data-hero-typewriter]');
  if (heading?.dataset.heroInitialized !== undefined) return;
  stopHero();
  if (!heading) return;
  heading.dataset.heroInitialized = '';

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (motion.matches || navigation?.type === 'back_forward') return;

  const glyphs: HTMLSpanElement[] = [];
  heading.querySelectorAll<HTMLElement>('[data-hero-line]').forEach((line) => {
    const characters = Array.from(line.textContent ?? '').map((character) => {
      const glyph = document.createElement('span');
      glyph.className = 'hero-glyph';
      glyph.textContent = character;
      glyphs.push(glyph);
      return glyph;
    });
    line.replaceChildren(...characters);
  });
  if (!glyphs.length) return;

  const entrance = createHeroEntrance(heading.closest<HTMLElement>('.hero'));
  stopEntrance = entrance?.destroy;
  let timer: number | undefined;
  let cursor = glyphs[0]!;
  let position = 0;
  let stopped = false;
  const finish = () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(timer);
    delete heading.dataset.heroTyping;
    delete cursor.dataset.cursor;
    motion.removeEventListener('change', onMotionChange);
    if (stopTyping === finish) stopTyping = undefined;
  };
  const onMotionChange = () => { if (motion.matches) stopHero(); };
  const randomDelay = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  const typeNext = () => {
    delete cursor.dataset.cursor;
    cursor = glyphs[position++]!;
    cursor.dataset.visible = '';
    cursor.dataset.cursor = '';
    const punctuationPause = /[，。,.]/u.test(cursor.textContent ?? '') ? randomDelay(200, 300) : 0;
    if (position < glyphs.length) {
      timer = window.setTimeout(typeNext, randomDelay(65, 165) + punctuationPause);
    } else {
      entrance?.revealCopy();
      // Keep the final punctuation pause before exactly three cursor blinks.
      timer = window.setTimeout(() => {
        heading.dataset.heroTyping = 'complete';
        timer = window.setTimeout(finish, 1800);
      }, punctuationPause);
    }
  };

  stopTyping = finish;
  motion.addEventListener('change', onMotionChange);
  heading.dataset.heroTyping = '';
  cursor.dataset.cursor = 'start';
  timer = window.setTimeout(typeNext, randomDelay(65, 165));
}

initializeHeroTypewriter();
// Astro may reuse this module during client navigation. Bind lifecycle handlers only once.
document.addEventListener('astro:page-load', initializeHeroTypewriter);
document.addEventListener('astro:before-swap', stopHero);
window.addEventListener('pagehide', stopHero);
