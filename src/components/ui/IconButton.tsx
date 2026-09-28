import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  href?: string;
  label: string;
  onClick?: () => void;
  expanded?: boolean;
};

export default function IconButton({ children, href, label, onClick, expanded }: Props) {
  if (href) {
    return (
      <Link href={href} className="icon-btn" aria-label={label}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={label}
      aria-expanded={expanded}
      aria-haspopup={expanded == null ? undefined : 'dialog'}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
