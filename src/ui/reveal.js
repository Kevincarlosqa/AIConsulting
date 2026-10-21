// Fades `[data-reveal]` elements in as they enter, cascading siblings
export function initReveal(root = document, { reduceMotion = false } = {}) {
  const items = [...root.querySelectorAll('[data-reveal]:not(.is-in)')];

  items.forEach((el) => {
    const siblings = [...el.parentElement.querySelectorAll(':scope > [data-reveal]')];
    el.style.setProperty('--d', siblings.indexOf(el));
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((el) => observer.observe(el));
}
