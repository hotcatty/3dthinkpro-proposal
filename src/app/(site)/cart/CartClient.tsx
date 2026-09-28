'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { removeCartLineAction, updateCartLineAction } from '@/lib/actions/cart';
import { formatMoney } from '@/lib/shopify/products';
import type { Cart } from '@/lib/shopify/types';

export default function CartClient({ cart }: { cart: Cart | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="empty-note" style={{ marginTop: 40 }}>
        <p>Your cart is empty.</p>
        <Link href="/shop" className="btn-primary" style={{ marginTop: 20 }}>Shop Seats</Link>
      </div>
    );
  }

  function changeQty(lineId: string, quantity: number) {
    setError('');
    startTransition(async () => {
      const result = await updateCartLineAction(lineId, quantity);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function remove(lineId: string) {
    setError('');
    startTransition(async () => {
      const result = await removeCartLineAction(lineId);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="cart-layout">
      <div>
        {cart.lines.map((line) => (
          <div key={line.id} className="cart-line">
            <div className="cart-thumb">
              {line.merchandise.product.featuredImage ? (
                <img
                  src={line.merchandise.product.featuredImage.url}
                  alt=""
                  width={96}
                  height={96}
                />
              ) : null}
            </div>
            <div className="cart-line-info">
              <Link href={`/products/${line.merchandise.product.handle}`}>
                {line.merchandise.product.title}
              </Link>
              <p className="body-muted">
                {line.merchandise.selectedOptions.map((o) => o.value).join(' / ')}
              </p>
              <p>{formatMoney(line.cost.totalAmount)}</p>
              <div className="qty-row">
                <button type="button" disabled={pending} onClick={() => changeQty(line.id, line.quantity - 1)}>-</button>
                <span>{line.quantity}</span>
                <button type="button" disabled={pending} onClick={() => changeQty(line.id, line.quantity + 1)}>+</button>
                <button type="button" className="text-btn" disabled={pending} onClick={() => remove(line.id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="cart-summary">
        <p className="label">Total</p>
        <p className="pdp-price">{formatMoney(cart.cost.totalAmount)}</p>
        {error && <p className="error-box">{error}</p>}
        <a className="btn-primary" href={cart.checkoutUrl}>
          Checkout
        </a>
        <Link href="/shop" className="link-arrow">Continue Shopping</Link>
      </aside>
    </div>
  );
}
