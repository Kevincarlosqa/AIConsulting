import '@fontsource-variable/inter';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/main.css';
import './styles/blog.css';

import { ParticleField } from './particles/field.js';
import { initLatestPosts } from './ui/blog.js';
import { initContact } from './ui/contact.js';
import { initNav } from './ui/nav.js';
import { initProjects } from './ui/projects.js';
import { initReveal } from './ui/reveal.js';
import { initScrollStory } from './ui/scroll-story.js';
import { initPageTransition } from './ui/page-transition.js';
import { initSmoothScroll } from './ui/smooth-scroll.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initPageTransition({ reduceMotion });
initSmoothScroll({ reduceMotion });
initNav();
initProjects({ reduceMotion });
initLatestPosts();
initReveal(document, { reduceMotion });
initScrollStory({ reduceMotion });
initContact();

const canvas = document.querySelector('.field');
if (canvas) {
  new ParticleField(canvas, [...document.querySelectorAll('[data-shape]')], { reduceMotion }).init();
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();
