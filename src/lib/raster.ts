/**
 * Build-time raster helpers for the share image and app icons.
 *
 * Satori and resvg can't read CSS custom properties, so the brand colors
 * are repeated here. Keep them in sync with the tokens in global.css.
 */
import { Resvg } from '@resvg/resvg-js';

export const BRAND = {
  paper: '#f2ede3',
  paperHi: '#fbf8f1',
  ink: '#141311',
  lime: '#c9f73a',
  tomato: '#ff5a36',
  muted: '#59534a',
  grid: 'rgba(20, 19, 17, 0.07)',
} as const;

/** The noodle in the logo tile. Same geometry as NoodleMark.astro (32×32 box). */
export const MARK_NOODLE = 'M7.5 22.5v-7a3.6 3.6 0 0 1 7.2 0v2.6a2.15 2.15 0 0 0 4.3 0v-2.6a3.6 3.6 0 0 1 7.2 0';

/** The logo's SVG elements in a 32×32 box. `shadow` adds a hard ink offset (in box units). */
export function markElements({ shadow = 0 }: { shadow?: number } = {}): string {
  const { ink, lime } = BRAND;
  const drop = shadow
    ? `<rect x="${1.5 + shadow}" y="${1.5 + shadow}" width="29" height="29" rx="8" fill="${ink}"/>`
    : '';
  return (
    drop +
    `<rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="${lime}" stroke="${ink}" stroke-width="2.5"/>` +
    `<path d="${MARK_NOODLE}" fill="none" stroke="${ink}" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

/** Standalone logo SVG (the favicon artwork). */
export function markSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${markElements()}</svg>`;
}

/**
 * App icon: the mark on a square of paper with the faint notebook grid and a
 * hard shadow. Drawn in a 180-unit box; platforms round the corners themselves.
 */
export function appIconSvg(): string {
  const { paper, grid } = BRAND;
  const S = 180;
  const step = S / 8;
  const lines = Array.from({ length: 7 }, (_, i) => {
    const p = (i + 1) * step;
    return `<path d="M${p} 0V${S}M0 ${p}H${S}"/>`;
  }).join('');
  // tile is 29 units wide; scale so it fills ~62% of the icon, nudged up-left so tile + shadow sit centered
  const scale = 3.6;
  const shadow = 3.5;
  const offset = (S - 32 * scale) / 2 - (shadow * scale) / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">` +
    `<rect width="${S}" height="${S}" fill="${paper}"/>` +
    `<g stroke="${grid}" stroke-width="1">${lines}</g>` +
    `<g transform="translate(${offset} ${offset}) scale(${scale})">${markElements({ shadow })}</g>` +
    `</svg>`
  );
}

/** Rasterize an SVG string to PNG bytes at the given pixel width. */
export function svgToPng(svg: string, width: number): Uint8Array {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false },
  });
  return new Uint8Array(resvg.render().asPng());
}

/**
 * Wrap one PNG in an ICO container: a 6-byte ICONDIR plus one 16-byte
 * ICONDIRENTRY, then the PNG bytes (PNG-in-ICO is supported everywhere that matters).
 */
export function pngToIco(png: Uint8Array, size: number): Uint8Array {
  const HEADER = 6 + 16;
  const out = new Uint8Array(HEADER + png.length);
  const v = new DataView(out.buffer);
  // ICONDIR
  v.setUint16(0, 0, true); // reserved
  v.setUint16(2, 1, true); // type: icon
  v.setUint16(4, 1, true); // image count
  // ICONDIRENTRY
  v.setUint8(6, size >= 256 ? 0 : size); // width (0 means 256)
  v.setUint8(7, size >= 256 ? 0 : size); // height
  v.setUint8(8, 0); // palette size
  v.setUint8(9, 0); // reserved
  v.setUint16(10, 1, true); // color planes
  v.setUint16(12, 32, true); // bits per pixel
  v.setUint32(14, png.length, true); // image byte size
  v.setUint32(18, HEADER, true); // image offset
  out.set(png, HEADER);
  return out;
}

/** A static binary response with a sensible cache header for dev; hosts set their own in prod. */
export function binaryResponse(bytes: Uint8Array, contentType: string): Response {
  return new Response(bytes.slice().buffer as ArrayBuffer, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=0, must-revalidate' },
  });
}
