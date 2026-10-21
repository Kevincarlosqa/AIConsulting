// Light/dark switch. The initial theme is set before paint by partials/head.html;
// this wires the toggle, remembers the choice and follows the system until one is made.

const root = document.documentElement;
const system = window.matchMedia('(prefers-color-scheme: light)');

const saved = () => {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
};

export function initTheme() {
  const toggles = [...document.querySelectorAll('[data-theme-toggle]')];
  const browserBar = document.querySelector('meta[name="theme-color"]');

  const apply = (theme) => {
    root.dataset.theme = theme;
    browserBar?.setAttribute('content', theme === 'light' ? '#f5f3ee' : '#0e0f11');
    const label = theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
    toggles.forEach((toggle) => toggle.setAttribute('aria-label', label));
  };

  apply(root.dataset.theme === 'light' ? 'light' : 'dark');

  toggles.forEach((toggle) =>
    toggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      apply(next);
      try {
        localStorage.setItem('theme', next);
      } catch {}
    }),
  );

  system.addEventListener('change', (event) => {
    if (!saved()) apply(event.matches ? 'light' : 'dark');
  });
}
