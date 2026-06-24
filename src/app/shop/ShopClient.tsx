'use client';

import { useState } from 'react';
import { ShopifyProduct } from '@/lib/shopify';

const MODELS = ['All Models', 'Harley-Davidson', 'Vespa', 'Off-Road', 'Scooter'];

interface Props { products: ShopifyProduct[]; }

export default function ShopClient({ products }: Props) {
  const [filter, setFilter] = useState('All Models');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = products; // In MVP all shown; later filter by metafields

  const handleBuy = async (product: ShopifyProduct, variantId?: number) => {
    if (!variantId) return;
    const key = `${product.id}-${variantId}`;
    setLoadingId(key);
    setErrorMsg('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.open(data.checkoutUrl, '_blank');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 48, background: 'rgba(255,255,255,0.04)', padding: 2, width: 'fit-content' }}>
        {MODELS.map(m => (
          <button key={m} onClick={() => setFilter(m)} style={{
            padding: '10px 20px',
            background: filter === m ? '#cc0000' : 'transparent',
            color: filter === m ? 'white' : '#666',
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}>{m}</button>
        ))}
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', padding: '12px 20px', marginBottom: 24 }}>
          <p style={{ color: '#cc0000', fontSize: 13 }}>{errorMsg}</p>
        </div>
      )}

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🏍</p>
          <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No products found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} loadingId={loadingId} onBuy={handleBuy} />
          ))}
        </div>
      )}

      {/* Count */}
      <p className="label" style={{ marginTop: 40 }}>
        {filtered.length} Product{filtered.length !== 1 ? 's' : ''} shown
      </p>
    </div>
  );
}

function ProductCard({ product, loadingId, onBuy }: {
  product: ShopifyProduct;
  loadingId: string | null;
  onBuy: (p: ShopifyProduct, variantId?: number) => void;
}) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
  const [hovered, setHovered] = useState(false);
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const image = product.images.edges[0]?.node;
  const key = `${product.id}-${selectedVariant?.adminVariantId}`;
  const isLoading = loadingId === key;

  return (
    <div
      style={{
        background: hovered ? '#141414' : '#0f0f0f',
        transition: 'background 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ aspectRatio: '4/3', background: '#111', overflow: 'hidden', position: 'relative' }}>
        {image ? (
          <img src={image.url} alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, color: '#1e1e1e' }}>🏍</div>
        )}
        {/* Red corner accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 40, background: '#cc0000', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }} />
      </div>

      {/* Info */}
      <div style={{ padding: '24px 28px 28px' }}>
        <p className="label" style={{ marginBottom: 8 }}>3DThinkPro</p>
        <p style={{
          fontSize: 15, fontWeight: 700, color: 'white', textTransform: 'uppercase',
          letterSpacing: '0.04em', marginBottom: 16, lineHeight: 1.3,
        }}>{product.title}</p>

        {product.description && (
          <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, marginBottom: 20,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}

        {/* Variants */}
        {product.variants.edges.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <p className="label" style={{ marginBottom: 10 }}>Color</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.variants.edges.map(({ node: v }) => (
                <button key={v.id} onClick={() => setSelectedVariant(v)} style={{
                  padding: '6px 14px',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  border: `1px solid ${selectedVariant?.id === v.id ? '#cc0000' : 'rgba(255,255,255,0.15)'}`,
                  background: selectedVariant?.id === v.id ? 'rgba(204,0,0,0.1)' : 'transparent',
                  color: selectedVariant?.id === v.id ? '#cc0000' : '#777',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{v.title}</button>
              ))}
            </div>
          </div>
        )}

        {/* Price + CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              ${price.toFixed(0)}
              <span style={{ fontSize: 12, color: '#444', fontWeight: 400, marginLeft: 4 }}>USD</span>
            </p>
          </div>
          <button
            onClick={() => onBuy(product, selectedVariant?.adminVariantId)}
            disabled={isLoading || !selectedVariant?.availableForSale}
            style={{
              padding: '12px 24px',
              background: isLoading ? '#333' : '#cc0000',
              color: 'white',
              border: 'none',
              cursor: isLoading ? 'wait' : 'pointer',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}
          >
            {isLoading ? '...' : 'Buy Now →'}
          </button>
        </div>
      </div>
    </div>
  );
}
