import { getProducts, ShopifyProduct } from '@/lib/shopify';
import ShopClient from './ShopClient';

export const revalidate = 0;

export default async function ShopPage() {
  let products: ShopifyProduct[] = [];
  let error = '';
  try {
    products = await getProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load products';
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '60px 32px 40px',
        background: '#080808',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="label" style={{ marginBottom: 12 }}>3DThinkPro Collection</p>
          <h1 className="heading">Shop</h1>
          <div className="divider" />
          <p style={{ color: '#666', fontSize: 14, marginTop: 16 }}>
            Premium 3D-printed seats for every motorcycle — select your model to find the perfect fit.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: 1280, margin: '24px auto', padding: '0 32px' }}>
          <div style={{ background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', padding: 20 }}>
            <p style={{ color: '#cc0000', fontFamily: 'monospace', fontSize: 13 }}>⚠ {error}</p>
          </div>
        </div>
      )}

      <ShopClient products={products} />
    </div>
  );
}
