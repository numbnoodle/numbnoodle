import { useEffect, useRef, useState } from 'react';
import IconR from '@/components/global/IconR';
import { track } from '@/lib/analytics';

interface Props {
  email: string;
  copyLabel: string;
  copiedLabel: string;
}

/** The big email pill. Click copies; a stamp says so. */
export default function CopyEmail({ email, copyLabel, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setFailed(false);
    } catch {
      // older browsers / insecure contexts: select the text so ⌘C works
      const range = document.createRange();
      const node = document.getElementById('email-text');
      if (node) {
        range.selectNodeContents(node);
        const sel = getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setFailed(true);
    }
    setCopied(true);
    track('copy_email');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="copy-email">
      <button type="button" className={`copy-email__btn${copied ? ' is-copied' : ''}`} onClick={copy}>
        <span id="email-text" className="copy-email__text">
          {email.split('@')[0]}
          <wbr />@{email.split('@')[1]}
        </span>
        <span className="copy-email__hint label" aria-hidden="true">
          <IconR name="copy" className="size-4" stroke={2.25} /> {copyLabel}
        </span>
        <span className="copy-email__stamp" aria-hidden="true">
          <IconR name="check" className="size-6" stroke={3.25} /> {failed ? 'selected' : copiedLabel}
        </span>
        <span className="visually-hidden">: copy email address</span>
      </button>
      <p className="copy-email__live visually-hidden" role="status" aria-live="polite">
        {copied ? (failed ? 'Email selected. Press Control or Command C to copy.' : 'Email address copied to clipboard.') : ''}
      </p>
    </div>
  );
}
