import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Hat, HatId } from '@/content/site';
import IconR from '@/components/global/IconR';

interface Props {
  hats: Hat[];
  prompt: string;
}

/**
 * The core proof of range: one human, four hats. Switching a hat swaps the
 * sub-headline and the hero's accent (via data-hat on the hero section).
 * Keyboard: it's a real tablist. Arrows, Home and End move between hats.
 */
export default function HatSwitcher({ hats, prompt }: Props) {
  const [active, setActive] = useState<HatId>(hats[0]!.id);
  const [bump, setBump] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();

  const select = useCallback(
    (id: HatId, focus = false) => {
      setActive(id);
      setBump((n) => n + 1);
      const hero = root.current?.closest<HTMLElement>('[data-hat]');
      if (hero) hero.dataset.hat = id;
      if (focus) tabs.current[hats.findIndex((h) => h.id === id)]?.focus();
    },
    [hats],
  );

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = hats.length - 1;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    if (next >= 0) {
      e.preventDefault();
      select(hats[next]!.id, true);
    }
  };

  const index = hats.findIndex((h) => h.id === active);

  return (
    <div ref={root} className="hat-card">
      <div className="hat-card__head">
        <p className="label" id={`${uid}-prompt`}>
          {prompt}
        </p>
        <p className="label hat-card__count" aria-hidden="true">
          hat {index + 1}/{hats.length}
        </p>
      </div>

      <div role="tablist" aria-labelledby={`${uid}-prompt`} className="hat-tabs">
        {hats.map((h, i) => {
          const selected = h.id === active;
          return (
            <button
              key={h.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${h.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              data-hat-tab={h.id}
              className="hat-tab"
              onClick={() => select(h.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {h.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${active}`}
        tabIndex={0}
        className="hat-panel"
      >
        <div className="hat-panel__stack">
          {hats.map((h) => {
            const on = h.id === active;
            return (
              <div
                key={on ? `${h.id}-${bump}` : h.id}
                className={`hat-panel__inner${on ? ' is-on' : ''}`}
                aria-hidden={on ? undefined : true}
              >
                <span className="hat-panel__icon" aria-hidden="true">
                  <IconR name={h.id} className="size-8" stroke={2.4} />
                </span>
                <div className="min-w-0">
                  <p className="hat-panel__line">{h.line}</p>
                  <p className="hat-panel__proof">
                    <span className="hat-panel__proof-tag">proof</span> {h.proof}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
