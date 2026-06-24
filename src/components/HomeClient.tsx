'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShopifyProduct } from '@/lib/shopify';

// ── Series cards with hover ──────────────────────────────────
export function SeriesGrid() {
  const series = [
    { name: 'Harley-Davidson', desc: 'Softail · Sportster · Touring', count: '12 models', icon: '🏍' },
    { name: 'Vespa', desc: 'Classic · Sprint · GTS', count: '8 models', icon: '🛵' },
    { name: 'Off-Road', desc: 'Enduro · Motocross · Rally', count: '10 models', icon: '🏁' },
    { name: 'Custom', desc: 'Bespoke 3D-printed solutions', count: 'Made to order', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)' }}>
      {series.map(s => (
        <SeriesCard key={s.name} {...s} />
      ))}
    </div>
  );
}

function SeriesCard({ name, desc, count, icon }: { name: string; desc: string; count: string; icon: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href="/shop" style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: hovered ? '#141414' : '#0f0f0f',
          padding: '40px 32px',
          borderBottom: `3px solid ${hovered ? '#cc0000' : 'transparent'}`,
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ fontSize: 32, marginBottom: 20 }}>{icon}</div>
        <p style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', marginBottom: 8 }}>{name}</p>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>{desc}</p>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#cc0000' }}>{count} →</p>
      </div>
    </Link>
  );
}

// ── Featured product cards with hover ───────────────────────
export function FeaturedProducts({ products }: { products: ShopifyProduct[] }) {
  if (products.length === 0) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)' }}>
      {products.map(product => (
        <FeaturedCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function FeaturedCard({ product }: { product: ShopifyProduct }) {
  const [hovered, setHovered] = useState(false);
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const image = product.images.edges[0]?.node;

  return (
    <Link href="/shop" style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: hovered ? '#141414' : '#0f0f0f',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ aspectRatio: '4/3', background: '#111', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, color: '#222' }}>
          {image ? (
            <img src={image.url} alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
          ) : '🏍'}
        </div>
        <div style={{ padding: '24px 28px' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>3DThinkPro</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 0 }}>{product.title}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
              ${price.toFixed(0)}
              <span style={{ fontSize: 13, color: '#555', fontWeight: 400, marginLeft: 4 }}>USD</span>
            </p>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#cc0000' }}>View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
