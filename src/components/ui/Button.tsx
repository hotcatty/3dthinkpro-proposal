import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'outline-white' | 'accent' | 'solid-white' | 'solid' | 'shop';

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AsLink = Common & {
  href: string;
};

const variants: Record<Variant, string> = {
  'outline-white': 'btn btn-outline-white',
  accent: 'btn btn-accent',
  'solid-white': 'btn btn-solid-white',
  solid: 'btn btn-solid',
  shop: 'btn btn-shop',
};

export default function Button(props: AsButton | AsLink) {
  const { children, variant = 'accent', className = '' } = props;
  const cls = `${variants[variant]} ${className}`.trim();

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const { href: _href, variant: _v, className: _c, ...buttonProps } = props as AsButton;
  return (
    <button type="button" className={cls} {...buttonProps}>
      {children}
    </button>
  );
}
