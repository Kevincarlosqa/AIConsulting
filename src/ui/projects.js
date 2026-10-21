import { categories, projects } from '../data/projects.js';
import { renderImage, renderScreen } from './mockups.js';
import { pauseScroll, resumeScroll, scrollToTarget } from './smooth-scroll.js';

const PHONE_SCREENS = new Set(['chat', 'product', 'analytics']);
const SLOTS = ['main', 'a', 'b'];

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const pad = (n) => String(n).padStart(2, '0');

const card = (project, index) => {
  const layers = project.screens
    .slice(0, 3)
    .map((type, k) => `<div class="layer layer--${SLOTS[k]}${PHONE_SCREENS.has(type) ? ' is-phone' : ''}">${renderScreen(type)}</div>`)
    .join('');
  const [result] = project.results;

  return `
    <article class="pcard" data-index="${index}" style="--accent: ${project.accent}">
      <div class="pcard-visual" role="button" tabindex="0" aria-label="Ver caso: ${escape(project.title)}">
        <div class="pcard-stage">${layers}</div>
        <span class="pcard-index">${pad(index + 1)} / ${pad(projects.length)}</span>
        <span class="pcard-cursor" aria-hidden="true">Ver caso</span>
      </div>
      <div class="pcard-info">
        <p class="pcard-meta"><span>${escape(categories[project.category])}</span><span>${escape(project.client)} · ${escape(project.year)}</span></p>
        <h3>${escape(project.title)}</h3>
        <p class="pcard-summary">${escape(project.summary)}</p>
        <div class="pcard-side">
          <p class="pcard-result"><strong>${escape(result.value)}</strong><span>${escape(result.label)}</span></p>
          <button class="pcard-open" type="button">Ver caso <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>`;
};

const outro = `
  <article class="pcard pcard--outro">
    <p class="eyebrow">Tu proyecto</p>
    <h3>¿Eres el <em>siguiente caso de éxito?</em></h3>
    <p>Cuéntanos qué quieres lograr y diseñamos la solución contigo.</p>
    <a class="btn btn-primary" href="#contacto">Empecemos</a>
  </article>`;

/* ---------- Case viewer ---------- */

function createViewer() {
  const dialog = document.querySelector('[data-viewer]');
  if (!dialog) return () => {};

  const slidesEl = dialog.querySelector('[data-slides]');
  const thumbsEl = dialog.querySelector('[data-thumbs]');
  const infoEl = dialog.querySelector('[data-info]');
  let slides = [];
  let thumbs = [];
  let current = 0;

  const show = (next) => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, k) => {
      slide.classList.toggle('is-active', k === current);
      slide.classList.toggle('is-before', k < current);
    });
    thumbs.forEach((thumb, k) => {
      thumb.classList.toggle('is-active', k === current);
      thumb.setAttribute('aria-current', String(k === current));
    });
    thumbs[current]?.scrollIntoView({ block: 'nearest', inline: 'center' });
  };

  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    setTimeout(() => {
      dialog.classList.remove('is-closing');
      dialog.close();
      document.documentElement.classList.remove('has-viewer');
      resumeScroll();
    }, 320);
  };

  const open = (index) => {
    const project = projects[index];
    const media = [
      ...project.images.map((src, k) => renderImage(src, `${project.title} — imagen ${k + 1}`)),
      ...project.screens.map(renderScreen),
    ];

    dialog.style.setProperty('--accent', project.accent);
    slidesEl.innerHTML = media.map((html) => `<div class="vslide">${html}</div>`).join('');
    thumbsEl.innerHTML = media
      .map((html, k) => `<button class="vthumb" type="button" aria-label="Imagen ${k + 1}">${html}</button>`)
      .join('');
    infoEl.innerHTML = `
      <p class="pcard-meta"><span>${escape(categories[project.category])}</span><span>${escape(project.client)} · ${escape(project.year)}</span></p>
      <h3 class="viewer-title">${escape(project.title)}</h3>
      <p class="viewer-summary">${escape(project.summary)}</p>
      <dl class="viewer-story">
        <div><dt>El reto</dt><dd>${escape(project.challenge)}</dd></div>
        <div><dt>La solución</dt><dd>${escape(project.solution)}</dd></div>
      </dl>
      <div class="viewer-results">
        ${project.results.map((r) => `<p><strong>${escape(r.value)}</strong><span>${escape(r.label)}</span></p>`).join('')}
      </div>
      <ul class="viewer-stack">${project.stack.map((s) => `<li>${escape(s)}</li>`).join('')}</ul>
      <a class="btn btn-primary" href="#contacto" data-viewer-cta>Quiero algo así</a>`;

    slides = [...slidesEl.children];
    thumbs = [...thumbsEl.children];
    thumbs.forEach((thumb, k) => thumb.addEventListener('click', () => show(k)));

    pauseScroll();
    document.documentElement.classList.add('has-viewer');
    dialog.showModal();
    show(0);
  };

  dialog.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
  dialog.querySelector('[data-close]').addEventListener('click', close);

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
    const cta = event.target.closest('[data-viewer-cta]');
    if (cta) {
      event.preventDefault();
      close();
      setTimeout(() => scrollToTarget('#contacto'), 340);
    }
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'ArrowLeft') show(current - 1);
  });

  // Swipe between slides on touch screens
  let startX = null;
  slidesEl.addEventListener('pointerdown', (event) => (startX = event.clientX));
  slidesEl.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  return open;
}

/* ---------- Horizontal gallery ---------- */

export function initProjects({ reduceMotion = false } = {}) {
  const section = document.querySelector('[data-projects]');
  if (!section) return;

  const track = section.querySelector('[data-track]');
  const counter = section.querySelector('[data-current]');
  const bar = section.querySelector('[data-bar]');
  const ghost = section.querySelector('[data-ghost]');

  section.querySelector('[data-total]').textContent = pad(projects.length);
  track.innerHTML = projects.map(card).join('') + outro;

  const cards = [...track.querySelectorAll('.pcard')];
  const projectCards = cards.filter((c) => c.dataset.index !== undefined);
  const openViewer = createViewer();

  // Cards reveal the first time they slide into view
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((c) => io.observe(c));
  } else {
    cards.forEach((c) => c.classList.add('is-in'));
  }

  projectCards.forEach((c) => {
    const index = Number(c.dataset.index);
    const visual = c.querySelector('.pcard-visual');

    visual.addEventListener('click', () => openViewer(index));
    visual.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openViewer(index);
      }
    });
    c.querySelector('.pcard-open').addEventListener('click', () => openViewer(index));

    if (reduceMotion) return;

    // Tilt towards the pointer and let the cursor bubble follow it
    visual.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = visual.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      c.style.setProperty('--mx', (x / rect.width - 0.5).toFixed(3));
      c.style.setProperty('--my', (y / rect.height - 0.5).toFixed(3));
      c.style.setProperty('--cx', `${x}px`);
      c.style.setProperty('--cy', `${y}px`);
    });
    visual.addEventListener('pointerleave', () => {
      c.style.setProperty('--mx', 0);
      c.style.setProperty('--my', 0);
    });
  });

  const pinned = window.matchMedia('(min-width: 861px) and (min-height: 501px)');
  let overflow = 0;
  let x = 0;

  const layout = () => {
    if (pinned.matches) {
      track.style.transform = '';
      overflow = Math.max(track.scrollWidth - window.innerWidth, 0);
      section.style.height = `${window.innerHeight + overflow}px`;
    } else {
      overflow = 0;
      track.style.transform = '';
      section.style.height = '';
    }
  };

  const tick = () => {
    const rect = section.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;

    if (visible) {
      let progress;
      if (pinned.matches) {
        const travel = Math.max(rect.height - window.innerHeight, 1);
        progress = Math.min(Math.max(-rect.top / travel, 0), 1);
        const target = -progress * overflow;
        x += (target - x) * (reduceMotion ? 1 : 0.22);
        track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      } else {
        const max = track.scrollWidth - track.clientWidth;
        progress = max > 0 ? track.scrollLeft / max : 0;
        x = -track.scrollLeft;
      }

      bar.style.transform = `scaleX(${progress.toFixed(3)})`;
      if (ghost) ghost.style.transform = `translate3d(${(x * 0.35).toFixed(1)}px, 0, 0)`;

      // Parallax: each card knows how far it is from the centre of the screen
      const vw = window.innerWidth;
      let nearest = 0;
      let best = Infinity;
      projectCards.forEach((c, k) => {
        const r = c.getBoundingClientRect();
        const offset = (r.left + r.width / 2 - vw / 2) / vw;
        if (!reduceMotion) c.style.setProperty('--para', Math.max(-1, Math.min(1, offset)).toFixed(3));
        if (Math.abs(offset) < best) {
          best = Math.abs(offset);
          nearest = k;
        }
      });
      counter.textContent = pad(nearest + 1);
    }

    requestAnimationFrame(tick);
  };

  layout();
  window.addEventListener('resize', layout);
  pinned.addEventListener('change', layout);
  // Fonts change card widths once they load
  document.fonts?.ready.then(layout);
  requestAnimationFrame(tick);
}
