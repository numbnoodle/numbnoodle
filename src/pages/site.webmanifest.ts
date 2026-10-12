/** /site.webmanifest: generated from site.ts so names and colors live in one place. */
import type { APIRoute } from 'astro';
import site from '@/content/site';

export const prerender = true;

export const GET: APIRoute = () => {
  const manifest = {
    name: `${site.person.handle} · ${site.person.name}`,
    short_name: site.person.handle,
    description: site.seo.description,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: site.seo.themeColorLight,
    theme_color: site.seo.themeColorLight,
    icons: [
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
