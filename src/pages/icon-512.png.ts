/** /icon-512.png: the web app manifest icon. Same artwork as the apple-touch-icon. */
import type { APIRoute } from 'astro';
import { appIconSvg, binaryResponse, svgToPng } from '@/lib/raster';

export const prerender = true;

export const GET: APIRoute = () => binaryResponse(svgToPng(appIconSvg(), 512), 'image/png');
