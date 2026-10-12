/** /favicon.ico: the noodle mark as a 32×32 PNG inside an ICO container. */
import type { APIRoute } from 'astro';
import { binaryResponse, markSvg, pngToIco, svgToPng } from '@/lib/raster';

export const prerender = true;

export const GET: APIRoute = () => binaryResponse(pngToIco(svgToPng(markSvg(), 32), 32), 'image/x-icon');
