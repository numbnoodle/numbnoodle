// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/** @param {string} pkg @param {string} file */
const fontFile = (pkg, file) => `./node_modules/${pkg}/files/${file}`;

export default defineConfig({
  site: 'https://numbnoodle.com',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/404') }),
  ],
  vite: { plugins: [tailwindcss()] },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Bricolage Grotesque',
      cssVariable: '--nn-display',
      fallbacks: ['Arial Black', 'Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fontFile('@fontsource-variable/bricolage-grotesque', 'bricolage-grotesque-latin-opsz-normal.woff2')],
            weight: '200 800',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Instrument Sans',
      cssVariable: '--nn-body',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fontFile('@fontsource-variable/instrument-sans', 'instrument-sans-latin-wght-normal.woff2')],
            weight: '400 700',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--nn-mono',
      fallbacks: ['Courier New', 'monospace'],
      options: {
        variants: [
          {
            src: [fontFile('@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')],
            weight: '400 800',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
