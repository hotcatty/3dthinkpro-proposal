'use client';

import { useState } from 'react';
import { ShopifyProduct } from '@/lib/shopify';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const image = product.images.edges[0]?.node;

  const handleBuyNow = async () => {
    if (!selectedVariant?.adminVariantId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: selectedVariant.adminVariantId, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAdded(true);
      setTimeout(() => {
        window.open(data.checkoutUrl, '_blank');
        setAdded(false);
      }, 600);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-white/25 transition-all">
      {/* Product Image */}
      <div className="aspect-square bg-[#1a1a1a] flex items-center justify-center">
        {image ? (
          <img src={image.url} alt={image.altText || product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-600 text-sm text-center px-4">
            <div className="text-4xl mb-2">🏍</div>
            <p className="text-xs">No image yet</p>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="font-semibold text-white text-lg leading-tight mb-1">{product.title}</h3>
        {product.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        )}

        {/* Price */}
        <p className="text-2xl font-bold text-white mb-4">
          ${price.toFixed(2)}{' '}
          <span className="text-sm font-normal text-gray-400">{currency}</span>
        </p>

        {/* Color / Variant Selector */}
        {product.variants.edges.length > 1 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Select Option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.edges.map(({ node: variant }) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selectedVariant?.id === variant.id
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-white/20 text-gray-400 hover:border-white/40'
                  }`}
                >
                  {variant.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <p className="text-red-400 text-xs mb-3 bg-red-900/20 rounded p-2">{errorMsg}</p>
        )}

        {/* Buy Now Button */}
        <button
          onClick={handleBuyNow}
          disabled={loading || !selectedVariant?.availableForSale}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
            added
              ? 'bg-green-600 text-white'
              : loading
              ? 'bg-gray-700 text-gray-400 cursor-wait'
              : !selectedVariant?.availableForSale
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-500 text-white active:scale-95'
          }`}
        >
          {added
            ? '✓ Opening Checkout...'
            : loading
            ? 'Processing...'
            : !selectedVariant?.availableForSale
            ? 'Out of Stock'
            : 'Buy Now →'}
        </button>
      </div>
    </div>
  );
}
