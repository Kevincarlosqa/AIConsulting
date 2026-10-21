// Curtain transition between pages. The curtain is painted by the HTML itself
// (see partials/head.html), so a new page never flashes blank: it opens once the
// page is styled, and closes again before navigating away.

const STORAGE_KEY = 'pt-label';
const LEAVE_MS = 950;
const root = document.documentElement;

const labelFor = (link, url) => {
  if (link.dataset.ptLabel) return link.dataset.ptLabel;
  if (url.pathname === '/' || url.pathname === '/index.html') return 'Inicio';
  if (url.pathname.startsWith('/privacidad')) return 'Privacidad';
  if (url.pathname.startsWith('/blog/') && url.pathname !== '/blog/') return 'Artículo';
  if (url.pathname.startsWith('/blog')) return 'Blog';
  return 'PronoIA';
};

// Only plain clicks on links to another page of this site
const isPageLink = (link, event) => {
  if (!link || event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (link.target && link.target !== '_self') return null;
  if (link.hasAttribute('download')) return null;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname) return null;
  return url;
};

const prefetched = new Set();
const prefetch = (url) => {
  const href = url.pathname + url.search;
  if (prefetched.has(href)) return;
  prefetched.add(href);
  const hint = document.createElement('link');
  hint.rel = 'prefetch';
  hint.href = href;
  document.head.append(hint);
};

export function initPageTransition({ reduceMotion = false } = {}) {
  const curtain = document.querySelector('[data-pt]');
  if (!curtain) return;
  // Scripts are running: switch off the CSS failsafe that would hide the curtain
  root.classList.add('pt-ready');

  const label = curtain.querySelector('[data-pt-label]');
  let stored = null;
  try {
    stored = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); the default label is fine
  }
  if (stored && label) label.textContent = stored;

  const finish = () => curtain.classList.add('is-done');

  const enter = () => {
    root.classList.remove('pt-out', 'pt-prep');
    if (reduceMotion) {
      finish();
      return;
    }
    root.classList.add('pt-in');
    setTimeout(finish, 1500);
  };

  // Open once fonts are ready so the page is fully styled underneath, but never wait long
  const ready = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]) : Promise.resolve();
  ready.then(() => requestAnimationFrame(enter));

  // Coming back through the back/forward cache restores the closed curtain: open it again
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      root.classList.remove('pt-in');
      curtain.classList.remove('is-done');
      requestAnimationFrame(enter);
    }
  });

  document.addEventListener('pointerover', (event) => {
    const link = event.target.closest('a[href]');
    const url = link && isPageLink(link, { defaultPrevented: false, button: 0 });
    if (url) prefetch(url);
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    const url = isPageLink(link, event);
    if (!url) return;

    event.preventDefault();
    try {
      sessionStorage.setItem(STORAGE_KEY, labelFor(link, url));
    } catch {
      // Ignore: the next page falls back to the default label
    }

    if (reduceMotion) {
      window.location.href = url.href;
      return;
    }

    if (label) label.textContent = labelFor(link, url);
    curtain.classList.remove('is-done');
    root.classList.remove('pt-in');
    root.classList.add('pt-prep');
    // Commit the off-screen start position before animating the panels in
    void curtain.offsetHeight;
    root.classList.remove('pt-prep');
    root.classList.add('pt-out');
    setTimeout(() => (window.location.href = url.href), LEAVE_MS);
  });
}
