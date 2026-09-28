import { getProducts } from '@/lib/shopify/products';
import type { ProductCardData } from '@/lib/shopify/types';
import ShopClient from './ShopClient';

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; model?: string; year?: string; q?: string }>;
}) {
  const params = await searchParams;
  let products: ProductCardData[] = [];
  let error = '';
  try {
    products = await getProducts({ first: 50, sortKey: 'UPDATED_AT', reverse: true, revalidate: 0 });
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load products';
  }

  return (
    <div className="shop-page">
      <div className="shop-intro">
        <h1 className="fs-32 fw-regular c-black-80">Seats Built for Your Ride</h1>
        <p className="shop-lead">
          Each seat is precision-printed to fit a specific model — not reshaped, not restuffed, but rebuilt from the ground up. A TPU lattice structure replaces the foam layer entirely, delivering support that doesn&apos;t compress, ventilation that actually works, and a surface that holds up after ten thousand miles.
        </p>
      </div>
      {error && <p className="error-box">{error}</p>}
      <ShopClient
        key={`${params.brand ?? ''}-${params.model ?? ''}-${params.year ?? ''}-${params.q ?? ''}`}
        products={products}
        initial={params}
      />
    </div>
  );
}
