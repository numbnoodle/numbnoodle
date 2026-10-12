/**
 * Noodle geometry. One loop pattern, reused everywhere so the line always
 * has the same handwriting: desktop pipeline (horizontal) and the mobile
 * pipeline (vertical, built at runtime from real DOM positions).
 *
 * Pattern is in (u, v) space: u runs along the line (0 → 240), v is the
 * sideways wobble (positive = away from the baseline).
 */
const LOOP: Array<[number, number, number, number, number, number]> = [
  [55, 0, 95, 12, 125, 42],
  [148, 66, 132, 90, 112, 82],
  [88, 72, 102, 12, 150, 2],
  [180, -4, 210, 0, 240, 0],
];

type Map = (u: number, v: number) => [number, number];

const fmt = (n: number) => Math.round(n * 10) / 10;

/** Cubic segments for one loop from u0 to u1 on the given side. */
function loopSegment(u0: number, u1: number, side: 1 | -1, vScale: number, map: Map): string {
  const k = (u1 - u0) / 240;
  return LOOP.map(([a, b, c, d, e, f]) => {
    const p1 = map(u0 + a * k, side * b * vScale);
    const p2 = map(u0 + c * k, side * d * vScale);
    const p3 = map(u0 + e * k, side * f * vScale);
    return `C ${fmt(p1[0])} ${fmt(p1[1])}, ${fmt(p2[0])} ${fmt(p2[1])}, ${fmt(p3[0])} ${fmt(p3[1])}`;
  }).join(' ');
}

/**
 * A noodle through `stops` (positions along u), looping between each pair.
 * `start`/`end` are lead-in and lead-out positions along u.
 */
export function noodleThrough(
  stops: number[],
  { start, end, vScale = 1, map, firstSide = 1 }: { start: number; end: number; vScale?: number; map: Map; firstSide?: 1 | -1 },
): string {
  const [sx, sy] = map(start, 0);
  const parts = [`M ${fmt(sx)} ${fmt(sy)}`];
  const first = map(stops[0]!, 0);
  parts.push(`L ${fmt(first[0])} ${fmt(first[1])}`);
  let side: 1 | -1 = firstSide;
  for (let i = 0; i < stops.length - 1; i++) {
    parts.push(loopSegment(stops[i]!, stops[i + 1]!, side, vScale, map));
    side = side === 1 ? -1 : 1;
  }
  const [ex, ey] = map(end, 0);
  const mid = map((stops[stops.length - 1]! + end) / 2, 0);
  parts.push(`C ${fmt(mid[0])} ${fmt(mid[1])}, ${fmt(mid[0])} ${fmt(mid[1])}, ${fmt(ex)} ${fmt(ey)}`);
  return parts.join(' ');
}

/** Fractions (0–1) along a rendered path closest to each target point. */
export function fractionsAt(path: SVGPathElement, targets: Array<[number, number]>, samples = 600): number[] {
  const total = path.getTotalLength();
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const p = path.getPointAtLength((total * i) / samples);
    pts.push([p.x, p.y]);
  }
  return targets.map(([x, y]) => {
    let best = 0;
    let bestD = Infinity;
    pts.forEach(([px, py], i) => {
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i / samples;
      }
    });
    return best;
  });
}
