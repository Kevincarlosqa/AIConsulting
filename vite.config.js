import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

// <!-- include:header --> pulls partials/header.html into any page, so every
// page shares one header and footer.
const partials = () => ({
  name: 'html-partials',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, name) => readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8')),
  },
  handleHotUpdate({ file, server }) {
    if (file.includes('partials') && file.endsWith('.html')) server.ws.send({ type: 'full-reload' });
  },
});

// Every blog/<slug>/index.html becomes its own page in the build
const blogPages = () => {
  const dir = resolve(root, 'blog');
  const pages = { blog: resolve(dir, 'index.html') };
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(dir, entry.name, 'index.html')))
    .forEach((entry) => (pages[`blog/${entry.name}`] = resolve(dir, entry.name, 'index.html')));
  return pages;
};

export default defineConfig({
  plugins: [partials()],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        privacidad: resolve(root, 'privacidad', 'index.html'),
        ...blogPages(),
      },
    },
  },
});
