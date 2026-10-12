import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import IconR from '@/components/global/IconR';
import type { IconName } from '@/lib/icons';
import { toggleTheme } from '@/lib/theme';
import { track } from '@/lib/analytics';
import './palette.css';

interface Props {
  email: string;
  links: Record<string, string>;
}

interface Command {
  id: string;
  label: string;
  hint: string;
  group: 'Do' | 'Go to';
  icon: IconName;
  keywords?: string;
  run: () => void | Promise<void>;
}

/** Subsequence match: "hg" matches "hire gaurav". Lower score = better. */
function score(query: string, text: string): number {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t.includes(query.toLowerCase().trim())) return t.indexOf(query.toLowerCase().trim());
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return Infinity;
    gaps += found - ti;
    ti = found + 1;
  }
  return 100 + gaps;
}

/**
 * Press / or ⌘K. A tiny command line for the site: the founder version of
 * a contact form. Native <dialog> for focus trapping and Esc for free.
 */
export default function CommandPalette({ email, links }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<{ text: string; n: number } | null>(null);
  const [noodle, setNoodle] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const uid = useId();
  const listId = `${uid}-list`;

  const say = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast((t) => ({ text, n: (t?.n ?? 0) + 1 }));
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const close = useCallback(() => {
    dialog.current?.close();
  }, []);

  const open = useCallback(() => {
    const d = dialog.current;
    if (!d || d.open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActive(0);
    d.showModal();
    requestAnimationFrame(() => input.current?.focus());
    track('palette_open');
  }, []);

  const goTo = useCallback((hash: string) => {
    const onHome = location.pathname === '/' || location.pathname === '/index.html';
    if (!onHome) {
      location.href = `/${hash}`;
      return;
    }
    const el = document.querySelector<HTMLElement>(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      return true;
    } catch {
      return false;
    }
  }, [email]);

  const toggleNoodle = useCallback(async () => {
    const mod = await import('./NoodleCursor');
    const on = mod.toggleNoodle();
    setNoodle(on);
    say(on ? 'noodle mode: on. wiggle your cursor.' : 'noodle mode: off. back to business.');
  }, [say]);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'hire',
        label: 'hire gaurav',
        hint: 'copies my email, takes you to contact',
        group: 'Do',
        icon: 'founder',
        keywords: 'job role founding team contact work together',
        run: async () => {
          const ok = await copyEmail();
          goTo('#contact');
          say(ok ? `great call. ${email} is on your clipboard.` : `great call. it’s ${email}`);
        },
      },
      {
        id: 'coins',
        label: 'open coins.me',
        hint: 'app.coins.me, new tab',
        group: 'Do',
        icon: 'arrow-up-right',
        keywords: 'coins app live',
        run: () => void window.open(links.coins, '_blank', 'noopener'),
      },
      {
        id: 'p2p',
        label: 'open p2p.me',
        hint: 'p2p.me, new tab',
        group: 'Do',
        icon: 'arrow-up-right',
        keywords: 'p2p live',
        run: () => void window.open(links.p2p, '_blank', 'noopener'),
      },
      {
        id: 'resume',
        label: 'resume',
        hint: 'the pdf, new tab',
        group: 'Do',
        icon: 'download',
        keywords: 'cv pdf',
        run: () => void window.open(links.resume, '_blank', 'noopener'),
      },
      {
        id: 'email',
        label: 'email',
        hint: 'copy my address',
        group: 'Do',
        icon: 'mail',
        keywords: 'mail contact copy',
        run: async () => {
          const ok = await copyEmail();
          say(ok ? `copied: ${email}` : `here it is: ${email}`);
        },
      },
      {
        id: 'theme',
        label: 'toggle theme',
        hint: 'light / dark',
        group: 'Do',
        icon: 'moon',
        keywords: 'dark light mode',
        run: () => {
          const t = toggleTheme();
          say(`${t} mode`);
        },
      },
      {
        id: 'noodle',
        label: noodle ? 'noodle mode (on)' : 'noodle mode',
        hint: 'your cursor trails a noodle',
        group: 'Do',
        icon: 'noodle',
        keywords: 'cursor trail fun',
        run: toggleNoodle,
      },
      { id: 'go-pipeline', label: 'the pipeline', hint: 'idea to grow', group: 'Go to', icon: 'arrow-right', run: () => goTo('#pipeline') },
      { id: 'go-shipped', label: 'shipped work', hint: 'the case files', group: 'Go to', icon: 'arrow-right', keywords: 'projects', run: () => goTo('#shipped') },
      { id: 'go-coins', label: 'coins.me case file', hint: '/work/coins-me', group: 'Go to', icon: 'arrow-right', run: () => void (location.href = '/work/coins-me') },
      { id: 'go-p2p', label: 'p2p.me case file', hint: '/work/p2p-me', group: 'Go to', icon: 'arrow-right', run: () => void (location.href = '/work/p2p-me') },
      { id: 'go-toolbox', label: 'toolbox', hint: 'the sticker sheet', group: 'Go to', icon: 'arrow-right', keywords: 'skills stack', run: () => goTo('#toolbox') },
      { id: 'go-manual', label: 'operating manual', hint: 'how I work', group: 'Go to', icon: 'arrow-right', keywords: 'principles', run: () => goTo('#manual') },
      { id: 'go-contact', label: 'contact', hint: 'let’s build something', group: 'Go to', icon: 'arrow-right', run: () => goTo('#contact') },
      { id: 'github', label: 'github', hint: 'github.com/numbnoodle', group: 'Go to', icon: 'arrow-up-right', keywords: 'code source', run: () => void window.open(links.github, '_blank', 'noopener') },
    ],
    [copyEmail, email, goTo, links, noodle, say, toggleNoodle],
  );

  const results = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((c) => ({ c, s: Math.min(score(query, c.label), score(query, `${c.label} ${c.keywords ?? ''}`) + 50) }))
      .filter((r) => r.s !== Infinity)
      .sort((a, b) => a.s - b.s)
      .map((r) => r.c);
  }, [commands, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // global shortcuts + any [data-palette-open] trigger
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        open();
      }
    };
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement | null)?.closest('[data-palette-open]');
      if (trigger) {
        e.preventDefault();
        open();
      }
    };
    const onScroll = () => setShowFab(scrollY > 640);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
      removeEventListener('scroll', onScroll);
    };
  }, [close, open]);

  // restore focus where it was when the dialog closes
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => {
      const el = lastFocus.current;
      if (el && document.contains(el) && !el.closest('dialog')) el.focus({ preventScroll: true });
    };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  const runAt = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    track('palette_command', { id: cmd.id });
    close();
    // let the dialog close (and focus restore) before navigating
    requestAnimationFrame(() => void cmd.run());
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = results.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a >= last ? 0 : a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? last : a - 1));
    } else if (e.key === 'Home' && e.ctrlKey) {
      setActive(0);
    } else if (e.key === 'End' && e.ctrlKey) {
      setActive(last);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    }
  };

  useEffect(() => {
    document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, uid]);

  let lastGroup = '';

  return (
    <>
      <dialog
        ref={dialog}
        className="palette"
        aria-label="Command menu"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="palette__panel">
          <div className="palette__bar">
            <IconR name="search" className="size-5 shrink-0" />
            <input
              ref={input}
              className="palette__input"
              type="text"
              placeholder="type a command… try “hire gaurav”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKey}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results.length ? `${uid}-opt-${active}` : undefined}
              aria-label="Command"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <button type="button" className="palette__esc label" onClick={close}>
              esc<span className="visually-hidden"> to close</span>
            </button>
          </div>
          <ul id={listId} role="listbox" aria-label="Commands" className="palette__list">
            {results.map((c, i) => {
              const header = c.group !== lastGroup ? c.group : null;
              lastGroup = c.group;
              return (
                <li
                  key={c.id}
                  id={`${uid}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`palette__opt${i === active ? ' is-active' : ''}`}
                  data-group={header ?? undefined}
                  onMouseMove={() => setActive(i)}
                  onClick={() => runAt(i)}
                >
                  <span className="palette__icon" aria-hidden="true">
                    <IconR name={c.icon} className="size-[1.1rem]" stroke={2.4} />
                  </span>
                  <span className="palette__label">{c.label}</span>
                  <span className="palette__hint">{c.hint}</span>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="palette__empty" role="option" aria-selected="false" aria-disabled="true">
                no command for “{query}”. this one didn’t find product-market fit either.
              </li>
            )}
          </ul>
          <p className="palette__foot label" aria-hidden="true">
            <span>up/down: move</span>
            <span>enter: run</span>
            <span>esc: close</span>
          </p>
        </div>
      </dialog>

      <button
        type="button"
        className={`palette-fab${showFab ? ' is-shown' : ''}`}
        onClick={open}
        aria-label="Open command menu"
        tabIndex={showFab ? 0 : -1}
        aria-hidden={showFab ? undefined : true}
      >
        <IconR name="command" className="size-6" stroke={2.25} />
      </button>

      <p className="nn-toast-region" role="status" aria-live="polite">
        {toast && (
          <span key={toast.n} className="nn-toast">
            {toast.text}
          </span>
        )}
      </p>
    </>
  );
}
