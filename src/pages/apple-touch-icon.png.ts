/** /apple-touch-icon.png: 180×180, the mark on paper. iOS rounds the corners itself. */
import type { APIRoute } from 'astro';
import { appIconSvg, binaryResponse, svgToPng } from '@/lib/raster';

export const prerender = true;

export const GET: APIRoute = () => binaryResponse(svgToPng(appIconSvg(), 180), 'image/png');
