import type { ReactNode } from 'react';

type IconName =
  | 'search'
  | 'bag'
  | 'language'
  | 'menu'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-down'
  | 'trust-card'
  | 'trust-ship'
  | 'trust-return'
  | 'x'
  | 'instagram'
  | 'facebook'
  | 'tiktok';

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

const files: Partial<Record<IconName, string>> = {
  search: '/icons/search.svg',
  bag: '/icons/bag.svg',
  language: '/icons/language.svg',
  menu: '/icons/menu.svg',
  'chevron-down': '/icons/chevron-down.svg',
};

const paths: Partial<Record<IconName, ReactNode>> = {
  /* Figma 557:4193 / 557:4194 — 24 box, 14 shaft arrows */
  'arrow-left': <path d="M12 19 5 12m0 0 7-7M5 12h14" />,
  'arrow-right': <path d="M5 12h14m0 0-7-7m7 7-7 7" />,
  'trust-card': (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  'trust-ship': (
    <>
      <path d="M3 16h13l5-6H8L3 16Z" />
      <path d="M8 10V7h7" />
    </>
  ),
  'trust-return': (
    <>
      <path d="M3 12a9 9 0 1 0 3-7" />
      <path d="M3 4v5h5" />
    </>
  ),
  x: (
    <>
      <path d="M5 5 19 19" />
      <path d="M19 5 5 19" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" />,
  tiktok: <path d="M14 6c.8 2.2 2.4 3.4 4.5 3.6V13c-1.6 0-3-.5-4.5-1.4V16A5 5 0 1 1 9 11.1V14a2.2 2.2 0 1 0 2.2 2.2V6h2.8Z" />,
};

export default function Icon({ name, size = 24, className }: IconProps) {
  const src = files[name];
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'arrow-left' || name === 'arrow-right' ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
