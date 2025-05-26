// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://key.melobeatsz.fr",
  integrations: [solidJs(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});