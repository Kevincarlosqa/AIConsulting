// Scroll-driven storytelling: words that light up as you read, and the
// solutions list that tracks which card is in view.

const splitWords = (el) => {
  const words = [];
  const wrap = (text, extraClass) => {
    const fragment = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.append(' ');
        return;
      }
      const span = document.createElement('span');
      span.className = extraClass ? `w ${extraClass}` : 'w';
      span.textContent = part;
      words.push(span);
      fragment.append(span);
    });
    return fragment;
  };

  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.replaceWith(wrap(node.textContent));
    else if (node.nodeType === Node.ELEMENT_NODE) node.replaceWith(wrap(node.textContent, node.className));
  });

  return words;
};

function initScrub({ reduceMotion }) {
  document.querySelectorAll('[data-scrub]').forEach((el) => {
    const section = el.closest('.impact');
    const words = splitWords(el);

    if (reduceMotion || !section) {
      words.forEach((w) => w.classList.add('is-lit'));
      return;
    }

    let lit = -1;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 1);
      // Finish lighting a little before the sticky block releases
      const progress = Math.min(Math.max(-rect.top / (travel * 0.85), 0), 1);
      const next = Math.round(progress * words.length);
      if (next === lit) return;
      lit = next;
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
}

function initBenefits() {
  const list = document.querySelector('[data-benefits]');
  if (!list) return;

  const cards = [...list.querySelectorAll('.benefit')];
  const index = [...document.querySelectorAll('.benefits-index li')];

  const activate = (i) => {
    cards.forEach((card, k) => card.classList.toggle('is-active', k === i));
    index.forEach((item, k) => item.classList.toggle('is-active', k === i));
  };

  if (!('IntersectionObserver' in window)) return;

  // A card is active while it crosses the middle band of the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activate(cards.indexOf(entry.target));
      });
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );

  cards.forEach((card) => observer.observe(card));
}

// Problem section: scattered tool chips drift at different depths as the section scrolls by
function initProblem({ reduceMotion }) {
  const cloud = document.querySelector('[data-problem] .tool-cloud');
  if (!cloud || reduceMotion) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = cloud.getBoundingClientRect();
    const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) / window.innerHeight;
    cloud.style.setProperty('--p', Math.max(-1, Math.min(1, offset)).toFixed(3));
  };

  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

export function initScrollStory(options = {}) {
  initScrub(options);
  initBenefits();
  initProblem(options);
}
