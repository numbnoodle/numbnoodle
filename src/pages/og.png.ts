/** /og.png: the 1200×630 share card, rendered once at build time. */
import type { APIRoute } from 'astro';
import { renderOgImage } from '@/lib/og-image';
import { binaryResponse } from '@/lib/raster';

export const prerender = true;

export const GET: APIRoute = async () => binaryResponse(await renderOgImage(), 'image/png');
