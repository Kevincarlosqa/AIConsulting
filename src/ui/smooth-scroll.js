import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Leaves room for the fixed navigation bar when jumping to a section
const NAV_OFFSET = -72;
// Menu jumps take the same time whatever the distance, easing out like the wheel scroll
const JUMP = { offset: NAV_OFFSET, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) };

let lenis = null;

// Inertial wheel/trackpad scrolling. Touch keeps the native scroll, which is already smooth.
export function initSmoothScroll({ reduceMotion = false } = {}) {
  if (reduceMotion) return null;

  lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    autoRaf: true,
    // Let the case viewer scroll on its own while it is open
    prevent: (node) => Boolean(node.closest?.('dialog[open]')),
  });

  // In-page links glide with Lenis instead of the browser's instant jump
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || event.defaultPrevented) return;
    // Only links to a section of this same page; "/#contacto" from the blog navigates normally
    const url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname || url.origin !== window.location.origin) return;
    const hash = url.hash;
    if (hash.length < 2 || !document.querySelector(hash)) return;
    event.preventDefault();
    scrollToTarget(hash);
    history.replaceState(null, '', hash);
  });

  return lenis;
}

export function scrollToTarget(selector) {
  if (lenis) {
    lenis.scrollTo(selector, JUMP);
    return;
  }
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
}

export const pauseScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();
