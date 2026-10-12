import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { StickerGroup } from '@/content/site';

interface Props {
  groups: StickerGroup[];
}

type Offset = { x: number; y: number };

const COLORS = ['lime', 'paper', 'ink', 'paper', 'tomato'] as const;
const GROUP_COLORS: Record<StickerGroup['id'], 'lime' | 'tomato' | 'paper' | 'ink'> = {
  build: 'lime',
  design: 'tomato',
  ship: 'ink',
  grow: 'paper',
};

/** Small deterministic hash so stickers look random but render the same on server and client. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function burstPoints(points = 14, outer = 56, inner = 47, cx = 60, cy = 60) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}
const BURST = burstPoints();

/**
 * The toolbox as stickers on a laptop lid. On desktop (fine pointer, wide
 * screen) they can be dragged anywhere on the lid and snap back on
 * double-click. Keyboard: focus a sticker, arrows move it (shift = faster),
 * Enter snaps it back. On touch screens it's a sticker sheet: tap to wiggle.
 */
export default function StickerSheet({ groups }: Props) {
  const [canDrag, setCanDrag] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, Offset>>({});
  const [snapping, setSnapping] = useState<Record<string, boolean>>({});
  const [wiggle, setWiggle] = useState<string | null>(null);
  const [lifted, setLifted] = useState<string | null>(null);
  const z = useRef(10);
  const zs = useRef<Record<string, number>>({});
  const lid = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean; bounds: DOMRect; el: DOMRect } | null>(null);
  const hintId = useId();
  const moved = Object.values(offsets).some((o) => o.x !== 0 || o.y !== 0);

  useEffect(() => {
    const mq = matchMedia('(min-width: 64rem) and (hover: hover) and (pointer: fine)');
    const sync = () => setCanDrag(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const bringToFront = (id: string) => {
    z.current += 1;
    zs.current[id] = z.current;
  };

  const clampOffset = useCallback((id: string, next: Offset, base?: { bounds: DOMRect; el: DOMRect; ox: number; oy: number }) => {
    if (!base) return next;
    // keep the sticker on the lid: el rect was measured at offset (ox, oy)
    const pad = 8;
    const minX = base.bounds.left + pad - (base.el.left - base.ox);
    const maxX = base.bounds.right - pad - (base.el.right - base.ox);
    const minY = base.bounds.top + pad - (base.el.top - base.oy);
    const maxY = base.bounds.bottom - pad - (base.el.bottom - base.oy);
    void id;
    return {
      x: Math.min(maxX, Math.max(minX, next.x)),
      y: Math.min(maxY, Math.max(minY, next.y)),
    };
  }, []);

  const snapBack = (id: string) => {
    setSnapping((s) => ({ ...s, [id]: true }));
    setOffsets((o) => ({ ...o, [id]: { x: 0, y: 0 } }));
    window.setTimeout(() => setSnapping((s) => ({ ...s, [id]: false })), 700);
  };

  const resetAll = () => {
    const all: Record<string, boolean> = {};
    Object.keys(offsets).forEach((k) => (all[k] = true));
    setSnapping(all);
    setOffsets({});
    window.setTimeout(() => setSnapping({}), 700);
  };

  const doWiggle = (id: string) => {
    setWiggle(null);
    requestAnimationFrame(() => setWiggle(id));
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, id: string) => {
    if (!canDrag || e.button !== 0 || !lid.current) return;
    const o = offsets[id] ?? { x: 0, y: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      id,
      sx: e.clientX,
      sy: e.clientY,
      ox: o.x,
      oy: o.y,
      moved: false,
      bounds: lid.current.getBoundingClientRect(),
      el: e.currentTarget.getBoundingClientRect(),
    };
    bringToFront(id);
    setLifted(id);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    const next = clampOffset(d.id, { x: d.ox + dx, y: d.oy + dy }, d);
    setOffsets((o) => ({ ...o, [d.id]: next }));
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
    setLifted(null);
    if (!d.moved) doWiggle(d.id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (offsets[id] && (offsets[id]!.x || offsets[id]!.y)) snapBack(id);
      else doWiggle(id);
      return;
    }
    const step = e.shiftKey ? 40 : 12;
    const dir: Record<string, Offset> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const move = dir[e.key];
    if (!move || !canDrag || !lid.current) return;
    e.preventDefault();
    const o = offsets[id] ?? { x: 0, y: 0 };
    bringToFront(id);
    const next = clampOffset(id, { x: o.x + move.x, y: o.y + move.y }, {
      bounds: lid.current.getBoundingClientRect(),
      el: e.currentTarget.getBoundingClientRect(),
      ox: o.x,
      oy: o.y,
    });
    setOffsets((s) => ({ ...s, [id]: next }));
  };

  let n = 0;

  return (
    <div className={`stickers${canDrag ? ' can-drag' : ''}`}>
      <div ref={lid} className="lid">
        <svg className="lid__logo" viewBox="0 0 32 32" aria-hidden="true">
          <path
            d="M7.5 22.5v-7a3.6 3.6 0 0 1 7.2 0v2.6a2.15 2.15 0 0 0 4.3 0v-2.6a3.6 3.6 0 0 1 7.2 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="lid__sheet-label label" aria-hidden="true">
          sticker sheet 1/1 · numbnoodle toolbox
        </p>

        {groups.map((g) => (
          <div key={g.id} className={`zone zone--${g.id}`}>
            <h3 className="burst" data-color={GROUP_COLORS[g.id]} style={{ rotate: `${(hash(g.id) * 20 - 10).toFixed(1)}deg` }}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <polygon className="burst__edge" points={BURST} />
                <polygon className="burst__fill" points={BURST} />
              </svg>
              <span>{g.label}</span>
            </h3>
            <ul className="zone__list">
              {g.items.map((item) => {
                const id = `${g.id}:${item}`;
                const h = hash(item);
                const i = n++;
                const color = COLORS[i % COLORS.length];
                const shape = item.length <= 4 ? 'round' : h > 0.72 ? 'rect' : 'pill';
                const r = (h * 16 - 8).toFixed(1);
                const size = (0.95 + hash(item + 'size') * 0.3).toFixed(2);
                const o = offsets[id] ?? { x: 0, y: 0 };
                const classes = [
                  'stk',
                  `stk--${color}`,
                  `stk--${shape}`,
                  snapping[id] ? 'is-snapping' : '',
                  lifted === id ? 'is-lifted' : '',
                  wiggle === id ? 'is-wiggle' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li key={id} className="zone__item" style={{ zIndex: zs.current[id] ?? undefined }}>
                    <button
                      type="button"
                      className={classes}
                      style={
                        {
                          '--r': `${r}deg`,
                          '--x': `${o.x}px`,
                          '--y': `${o.y}px`,
                          '--fs': size,
                        } as CSSProperties
                      }
                      aria-describedby={hintId}
                      onPointerDown={(e) => onPointerDown(e, id)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                      onDoubleClick={() => snapBack(id)}
                      onKeyDown={(e) => onKeyDown(e, id)}
                      onClick={(e) => {
                        // keyboard "click" is handled in onKeyDown; touch taps wiggle
                        if (!canDrag && e.detail > 0) doWiggle(id);
                      }}
                      onAnimationEnd={() => setWiggle((w) => (w === id ? null : w))}
                    >
                      {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="stickers__foot">
        <p id={hintId} className="label stickers__hint">
          {canDrag ? (
            <>
              drag them around · double-click to snap back · <span className="normal-case">keyboard: arrows move, enter snaps back</span>
            </>
          ) : (
            <>tap a sticker. it wiggles. that's it, that's the feature.</>
          )}
        </p>
        {canDrag && (
          <button type="button" className="btn btn-sm" onClick={resetAll} disabled={!moved}>
            Tidy up
          </button>
        )}
      </div>
    </div>
  );
}
