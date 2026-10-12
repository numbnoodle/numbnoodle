/**
 * Noodle mode: your cursor drags a noodle around. Loaded on demand from the
 * command palette, so it costs nothing until someone asks for it.
 */
type Pt = { x: number; y: number; t: number };

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let pts: Pt[] = [];
let raf = 0;
let on = false;
const LIFE = 650; // ms a point stays on screen
const MAX = 64;

function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function onMove(e: PointerEvent) {
  pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  if (pts.length > MAX) pts.shift();
  if (!raf) raf = requestAnimationFrame(draw);
}

function stroke(width: number, color: string) {
  if (!ctx || pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i]!.x + pts[i + 1]!.x) / 2;
    const my = (pts[i]!.y + pts[i + 1]!.y) / 2;
    ctx.quadraticCurveTo(pts[i]!.x, pts[i]!.y, mx, my);
  }
  const last = pts[pts.length - 1]!;
  ctx.lineTo(last.x, last.y);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function draw() {
  raf = 0;
  if (!ctx || !canvas) return;
  const now = performance.now();
  pts = pts.filter((p) => now - p.t < LIFE);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const css = getComputedStyle(document.documentElement);
  stroke(11, css.getPropertyValue('--ink').trim() || '#141311');
  stroke(6, css.getPropertyValue('--lime').trim() || '#c9f73a');
  if (pts.length) raf = requestAnimationFrame(draw);
}

export function enableNoodle() {
  if (on) return;
  on = true;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '95', pointerEvents: 'none' });
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.classList.add('noodle-mode');
}

export function disableNoodle() {
  if (!on) return;
  on = false;
  removeEventListener('resize', resize);
  removeEventListener('pointermove', onMove);
  cancelAnimationFrame(raf);
  raf = 0;
  pts = [];
  canvas?.remove();
  canvas = null;
  ctx = null;
  document.documentElement.classList.remove('noodle-mode');
}

export function toggleNoodle(): boolean {
  if (on) disableNoodle();
  else enableNoodle();
  return on;
}
