// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Canonical origin used for sitemap/OG URLs. Change in one place when the domain settles.
  site: 'https://narani.my',
  build: { format: 'directory' },
  vite: {
    plugins: [tailwindcss()],
  },
});
