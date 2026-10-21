import { author, formatDate, posts } from '../data/posts.js';

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const byDate = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const postCard = (post, { featured = false } = {}) => `
  <a class="post-card${featured ? ' post-card--featured' : ''}" href="/blog/${post.slug}/" data-reveal data-tags="${post.tags.join(',')}">
    <div class="post-cover" aria-hidden="true">
      <span class="post-glyph">${escape(post.glyph)}</span>
      <span class="post-tag">${escape(post.tags[0])}</span>
    </div>
    <div class="post-card-body">
      <p class="post-card-meta"><time datetime="${post.date}">${formatDate(post.date)}</time><span>${post.readingTime} min de lectura</span></p>
      <h3>${escape(post.title)}</h3>
      <p class="post-card-excerpt">${escape(post.excerpt)}</p>
      <p class="post-card-author"><span class="avatar avatar--sm">${author.initials}</span>${escape(author.name)}</p>
    </div>
  </a>`;

// Home page: the three most recent articles
export function initLatestPosts() {
  const grid = document.querySelector('[data-latest-posts]');
  if (grid) grid.innerHTML = byDate.slice(0, 3).map((p) => postCard(p)).join('');
}

// Blog index: featured article, topic filter and the rest of the list
export function initBlogIndex() {
  const list = document.querySelector('[data-blog-list]');
  const featured = document.querySelector('[data-blog-featured]');
  const filters = document.querySelector('[data-blog-tags]');
  if (!list) return;

  const [first, ...rest] = byDate;
  if (featured) featured.innerHTML = postCard(first, { featured: true });
  list.innerHTML = rest.map((p) => postCard(p)).join('');

  if (!filters) return;
  const tags = ['Todos', ...new Set(posts.flatMap((p) => p.tags))];
  filters.innerHTML = tags
    .map((t, i) => `<button class="tag-filter${i === 0 ? ' is-active' : ''}" type="button" data-tag="${escape(t)}" aria-pressed="${i === 0}">${escape(t)}</button>`)
    .join('');

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tag]');
    if (!button) return;
    const tag = button.dataset.tag;
    filters.querySelectorAll('.tag-filter').forEach((b) => {
      b.classList.toggle('is-active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });

    // Filtering shows every match in the grid, featured one included
    const matches = tag === 'Todos' ? rest : byDate.filter((p) => p.tags.includes(tag));
    if (featured) featured.hidden = tag !== 'Todos';
    list.innerHTML = matches.map((p) => postCard(p)).join('');
    list.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
  });
}

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Article page: table of contents, reading progress, copy link and related posts
export function initArticle() {
  const article = document.querySelector('[data-article]');
  if (!article) return;

  const headings = [...article.querySelectorAll('.prose h2')];
  const toc = article.querySelector('[data-toc]');

  headings.forEach((h) => {
    if (!h.id) h.id = slugify(h.textContent);
  });

  if (toc) {
    toc.innerHTML = headings.map((h) => `<li><a href="#${h.id}">${escape(h.textContent)}</a></li>`).join('');
    const links = [...toc.querySelectorAll('a')];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    headings.forEach((h) => observer.observe(h));
  }

  const progress = document.querySelector('[data-progress]');
  if (progress) {
    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      const p = Math.min(Math.max(-rect.top / total, 0), 1);
      progress.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  const copy = article.querySelector('[data-copy-link]');
  if (copy) {
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href.split('#')[0]);
        copy.textContent = 'Enlace copiado ✓';
      } catch {
        copy.textContent = 'No se pudo copiar';
      }
      setTimeout(() => (copy.textContent = 'Copiar enlace'), 2200);
    });
  }

  const authorBox = document.querySelector('[data-author-box]');
  if (authorBox) {
    authorBox.innerHTML = `
      <span class="avatar avatar--lg">${author.initials}</span>
      <div>
        <p class="author-label">Escrito por</p>
        <p class="author-name">${escape(author.name)}</p>
        <p class="author-role">${escape(author.role)}</p>
        <p class="author-bio">Ingeniero de software especializado en llevar inteligencia artificial a producción en entornos exigentes: arquitectura de sistemas con LLM, agentes, integraciones y seguridad. Escribe sobre cómo las empresas pueden adoptar IA con resultados medibles y sin descuidar el riesgo.</p>
        <p class="author-note">Las opiniones de este artículo son personales y no representan necesariamente la posición de las empresas en las que trabaja.</p>
      </div>`;
  }

  const related = document.querySelector('[data-related]');
  if (related) {
    const current = posts.find((p) => p.slug === article.dataset.slug);
    const score = (p) => (current ? p.tags.filter((t) => current.tags.includes(t)).length : 0);
    const picks = byDate
      .filter((p) => p.slug !== article.dataset.slug)
      .sort((a, b) => score(b) - score(a) || b.date.localeCompare(a.date))
      .slice(0, 3);
    related.innerHTML = picks.map((p) => postCard(p)).join('');
  }
}
