export function initNav() {
  const bar = document.querySelector('.top-bar');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#primary-nav');
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = [...document.querySelectorAll('[data-nav-section]')];

  const update = () => {
    bar.classList.toggle('is-scrolled', window.scrollY > 40);

    const mid = window.innerHeight / 2;
    const current = sections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= mid && rect.bottom > mid;
    });
    // Pages outside the home (the blog) mark their own link via <body data-page>
    const id = current ? current.dataset.navSection : document.body.dataset.page || null;
    links.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === id));
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  if (!toggle || !menu) return;

  const setOpen = (open) => {
    bar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Cerrar' : 'Menú';
  };

  toggle.addEventListener('click', () => setOpen(!bar.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
}
