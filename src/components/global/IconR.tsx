import { icons, type IconName } from '@/lib/icons';

interface Props {
  name: IconName;
  className?: string;
  stroke?: number;
}

/** React twin of Icon.astro, so islands draw with the same hand. */
export default function IconR({ name, className = 'size-5', stroke = 2.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icons[name]} />
      {name === 'designer' && (
        <g fill="currentColor" stroke="none">
          <rect x="2" y="16" width="4" height="4" rx="0.5" />
          <rect x="18" y="4" width="4" height="4" rx="0.5" />
          <circle cx="9.5" cy="6" r="1.8" />
          <circle cx="14.5" cy="19" r="1.8" />
        </g>
      )}
    </svg>
  );
}
