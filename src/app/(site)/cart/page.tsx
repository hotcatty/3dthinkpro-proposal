import { getCart } from '@/lib/shopify/cart';
import CartClient from './CartClient';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  let cart = null;
  let error = '';
  try {
    cart = await getCart();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Could not load cart';
  }

  return (
    <div className="page-pad">
      <div className="container">
        <h1 className="section-h">Cart</h1>
        {error && <p className="error-box">{error}</p>}
        <CartClient cart={cart} />
      </div>
    </div>
  );
}
