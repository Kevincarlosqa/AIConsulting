import '@fontsource-variable/inter';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/main.css';
import './styles/blog.css';

import { initArticle, initBlogIndex } from './ui/blog.js';
import { initNav } from './ui/nav.js';
import { initReveal } from './ui/reveal.js';
import { initPageTransition } from './ui/page-transition.js';
import { initSmoothScroll } from './ui/smooth-scroll.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initPageTransition({ reduceMotion });
initSmoothScroll({ reduceMotion });
initNav();
initBlogIndex();
initArticle();
initReveal(document, { reduceMotion });

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
