/**
 * The 1200×630 share card, drawn with satori (layout → SVG) and resvg (SVG → PNG)
 * at build time. Copy comes from site.ts; colors from raster.ts.
 *
 * Satori wants static TTF/OTF/WOFF files (no woff2, no variable fonts), so this
 * reads the static @fontsource cuts rather than the variable ones the site uses.
 */
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import site from '@/content/site';
import { BRAND, markSvg, svgToPng } from '@/lib/raster';

const W = 1200;
const H = 630;
const { paper, paperHi, ink, lime, tomato } = BRAND;

type Style = Record<string, string | number>;
interface Node {
  type: string;
  props: { style?: Style; children?: Child | Child[]; [k: string]: unknown };
}
type Child = Node | string;

const el = (type: string, style: Style, children?: Child | Child[], extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});
const div = (style: Style, children?: Child | Child[]) => el('div', style, children);
const img = (src: string, width: number, height: number, style: Style = {}): Node =>
  el('img', { width, height, ...style }, undefined, { src, width, height });

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** The hero's noodle arrows (NoodleArrow.astro), as standalone SVGs. */
function noodleArrow(variant: 1 | 2): string {
  const body =
    variant === 1
      ? 'M5 33 C 20 33, 33 30, 44 21 C 54 12, 50 4, 43 7 C 34 11, 41 30, 62 31 C 78 32, 92 31, 108 30'
      : 'M5 30 C 18 34, 30 34, 40 26 C 50 18, 58 8, 66 12 C 74 16, 62 32, 56 26 C 50 20, 80 28, 108 29';
  const head = variant === 1 ? 'M96 20 L109 30 L97 41' : 'M96 19 L109 29 L97 40';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 48" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${body}"/><path d="${head}"/></svg>`
  );
}

let fontCache: Parameters<typeof satori>[1]['fonts'] | undefined;
function fonts() {
  if (fontCache) return fontCache;
  const read = (pkg: string, file: string) =>
    fs.readFileSync(path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));
  fontCache = [
    { name: 'Bricolage', data: read('bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff'), weight: 800, style: 'normal' },
    { name: 'Mono', data: read('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Mono', data: read('jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff'), weight: 700, style: 'normal' },
  ];
  return fontCache;
}

/** "I take products from 0 → 1 → 250K." → lines that mirror the hero. */
function headline() {
  const parts = site.seo.ogTitle.split('→').map((s) => s.trim());
  const leadWords = (parts[0] ?? '').split(' ');
  const last = parts[parts.length - 1] ?? '';
  const punct = /[.!?]$/.test(last) ? last.slice(-1) : '';
  return {
    line1: leadWords.slice(0, 3).join(' '),
    line2: leadWords.slice(3).join(' '),
    middle: parts.slice(1, -1),
    big: punct ? last.slice(0, -1) : last,
    punct,
  };
}

function tree(): Node {
  const h = headline();
  const size = 112;
  const track = Math.round(size * -0.045);
  const arrowW = Math.round(size * 1.05);
  const arrowH = Math.round((arrowW * 48) / 116);
  const arrowGap = Math.round(size * 0.08);
  const line: Style = { display: 'flex', alignItems: 'flex-end', height: Math.round(size * 0.93) };
  const arrow = (v: 1 | 2) =>
    img(svgUri(noodleArrow(v)), arrowW, arrowH, { margin: `0 ${arrowGap}px ${Math.round(size * 0.17)}px` });

  const [, ...rest] = site.seo.ogSub.split(' · ');
  const name = site.seo.ogSub.split(' · ')[0] ?? site.person.name;

  return div(
    {
      width: W,
      height: H,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      padding: '34px 54px 52px 40px',
      backgroundColor: paper,
      backgroundImage: `linear-gradient(${BRAND.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${BRAND.grid} 1.5px, transparent 1.5px)`,
      backgroundSize: '28px 28px',
      backgroundPosition: '-1px -1px',
      fontFamily: 'Bricolage',
      color: ink,
    },
    [
      // the card
      div(
        {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          backgroundColor: paperHi,
          border: `5px solid ${ink}`,
          borderRadius: 26,
          boxShadow: `14px 14px 0 0 ${tomato}, 14px 14px 0 5px ${ink}`,
        },
        [
          // strip: logo + status
          div(
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 70,
              padding: '0 26px 0 22px',
              backgroundColor: lime,
              borderBottom: `5px solid ${ink}`,
              borderRadius: '21px 21px 0 0',
            },
            [
              div({ display: 'flex', alignItems: 'center' }, [
                img(svgUri(markSvg()), 44, 44),
                div({ marginLeft: 12, fontSize: 34, letterSpacing: -1.2, lineHeight: 1 }, site.person.handle),
              ]),
              div(
                { display: 'flex', alignItems: 'center', fontFamily: 'Mono', fontSize: 18, letterSpacing: 0.5 },
                [
                  div({ width: 14, height: 14, marginRight: 10, borderRadius: 999, backgroundColor: ink }),
                  div({ fontWeight: 700, marginRight: 9 }, `${site.hero.status.label}:`),
                  div({}, site.hero.status.text),
                ],
              ),
            ],
          ),

          // headline
          div(
            {
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              justifyContent: 'center',
              padding: '0 48px',
              fontSize: size,
              letterSpacing: track,
              lineHeight: 1,
            },
            [
              div(line, h.line1),
              div(line, [
                h.line2,
                ...h.middle.flatMap((m) => [arrow(1), m]),
              ]),
              div({ ...line, height: Math.round(size * 1.12), alignItems: 'center' }, [
                arrow(2),
                div(
                  {
                    display: 'flex',
                    padding: `0 ${Math.round(size * 0.1)}px ${Math.round(size * 0.07)}px`,
                    backgroundColor: lime,
                    border: `5px solid ${ink}`,
                    borderRadius: Math.round(size * 0.14),
                    boxShadow: `6px 6px 0 0 ${ink}`,
                    transform: 'rotate(-2.5deg)',
                  },
                  h.big,
                ),
                // footnote mark, tying the 250K to the line on the right (as in the hero)
                div(
                  { alignSelf: 'flex-start', marginLeft: 10, marginTop: -4, fontSize: Math.round(size * 0.5), lineHeight: 1 },
                  site.hero.headline.footnoteMark,
                ),
                h.punct ? div({ alignSelf: 'flex-end', marginLeft: 2, marginBottom: 8 }, h.punct) : '',
                // the footnote keeps the 250K honest
                div(
                  {
                    display: 'flex',
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                    marginBottom: 14,
                    width: 400,
                    fontFamily: 'Mono',
                    fontSize: 17,
                    lineHeight: 1.45,
                    letterSpacing: 0,
                    color: BRAND.muted,
                  },
                  `${site.hero.headline.footnoteMark} ${site.hero.footnote}`,
                ),
              ]),
            ],
          ),

          // ink foot: name · role · url
          div(
            {
              display: 'flex',
              alignItems: 'center',
              height: 62,
              padding: '0 26px',
              backgroundColor: ink,
              color: paper,
              borderRadius: '0 0 21px 21px',
              fontFamily: 'Mono',
              fontSize: 22,
              letterSpacing: 0,
            },
            [
              div({ fontWeight: 700, color: lime }, name),
              ...rest.map((r) => div({ display: 'flex' }, [div({ margin: '0 14px', color: '#8a8478' }, '·'), r])),
            ],
          ),

          // die-cut sticker
          div(
            {
              position: 'absolute',
              top: 214,
              right: 60,
              display: 'flex',
              padding: '10px 20px 12px',
              fontSize: 30,
              letterSpacing: -0.5,
              lineHeight: 1,
              color: ink,
              backgroundColor: paperHi,
              border: `4px solid ${paperHi}`,
              borderRadius: 999,
              boxShadow: `0 0 0 3px ${ink}, 5px 6px 0 3px ${ink}`,
              transform: 'rotate(5deg)',
            },
            site.person.locationShort,
          ),
        ],
      ),
    ],
  );
}

/** Render the share card to PNG bytes. */
export async function renderOgImage(): Promise<Uint8Array> {
  const svg = await satori(tree() as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: fonts(),
  });
  return svgToPng(svg, W);
}
