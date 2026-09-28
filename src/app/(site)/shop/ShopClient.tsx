'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/commerce/ProductCard';
import Icon from '@/components/ui/Icon';
import { SHOP_BRANDS, parseProductMeta, resolveShopBrand } from '@/lib/catalog';
import type { ProductCardData } from '@/lib/shopify/types';

type ShopQuery = {
  brand?: string;
  model?: string;
  year?: string;
  q?: string;
};

export default function ShopClient({
  products,
  initial,
}: {
  products: ProductCardData[];
  initial: ShopQuery;
}) {
  const router = useRouter();
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);

  const brand = resolveShopBrand(initial.brand);
  const model = initial.model?.trim() ?? '';
  const year = initial.year?.trim() ?? '';
  const query = initial.q?.trim() ?? '';

  const parsed = useMemo(
    () =>
      products.map((product) => {
        const meta = parseProductMeta(product.title);
        const years = [
          ...new Set([...(product.years ?? []), ...(meta.year ? [meta.year] : [])]),
        ];
        return { product, ...meta, years };
      }),
    [products],
  );

  const brandItems = useMemo(
    () => (brand ? parsed.filter((item) => item.brand === brand) : parsed),
    [brand, parsed],
  );

  const models = useMemo(() => {
    const names = new Set<string>();
    brandItems.forEach((item) => {
      if (item.model) names.add(item.model);
    });
    return [...names];
  }, [brandItems]);

  // Cascade: years only after a model is chosen (brand → model → year).
  const years = useMemo(() => {
    if (!model) return [];
    const source = brandItems.filter((item) => item.model.toLowerCase() === model.toLowerCase());
    const values = new Set<string>();
    source.forEach((item) => {
      item.years.forEach((value) => values.add(value));
    });
    return [...values]
      .filter((value) => /^\d{4}$/.test(value))
      .sort((a, b) => Number(b) - Number(a));
  }, [brandItems, model]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return parsed
      .filter((item) => {
        if (brand && item.brand !== brand) return false;
        if (model && item.model.toLowerCase() !== model.toLowerCase()) return false;
        if (year) {
          if (item.years.length === 0) return true;
          if (!item.years.includes(year)) return false;
        }
        if (!needle) return true;
        return `${item.product.title} ${item.product.handle} ${item.product.sku}`.toLowerCase().includes(needle);
      })
      .map((item) => item.product);
  }, [brand, model, parsed, query, year]);

  function write(next: ShopQuery) {
    const params = new URLSearchParams();
    if (next.brand) params.set('brand', next.brand);
    if (next.model) params.set('model', next.model);
    if (next.year) params.set('year', next.year);
    if (next.q) params.set('q', next.q);
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
    setYearOpen(false);
  }

  function onBrand(name: string) {
    if (brand === name) {
      write({ q: query || undefined });
      return;
    }
    write({ brand: name, q: query || undefined });
  }

  function onModel(name: string) {
    const nextModel = model === name ? undefined : name;
    write({
      brand,
      model: nextModel,
      // Reset year whenever model changes — year depends on model.
      year: undefined,
      q: query || undefined,
    });
  }

  function onYear(value: string) {
    write({
      brand,
      model: model || undefined,
      year: year === value ? undefined : value,
      q: query || undefined,
    });
  }

  useEffect(() => {
    if (!yearOpen) return undefined;
    function onPointer(event: PointerEvent) {
      if (!yearRef.current?.contains(event.target as Node)) setYearOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [yearOpen]);

  const selectedBrand = SHOP_BRANDS.find((item) => item.name === brand);
  const yearLabel = year || years[0] || '';

  return (
    <div className="shop-catalog">
      <div className="shop-filter">
        <p className="shop-filter-label">Select Your Moto</p>
        <div className={`shop-filter-row${brand ? ' is-open' : ''}`}>
          {brand && selectedBrand ? (
            <>
              <button
                type="button"
                className="shop-chip is-on"
                aria-pressed="true"
                onClick={() => onBrand(selectedBrand.name)}
              >
                <img src={selectedBrand.src} alt="" width={20} height={20} />
                <span>{selectedBrand.name}</span>
              </button>
              {models.length > 0 && (
                <div className="shop-models">
                  {models.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`shop-chip${model.toLowerCase() === name.toLowerCase() ? ' is-on' : ''}`}
                      aria-pressed={model.toLowerCase() === name.toLowerCase()}
                      onClick={() => onModel(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
              {model && years.length > 0 && (
                <div className="shop-year" ref={yearRef}>
                  <button
                    type="button"
                    className={`shop-chip shop-year-btn${year ? ' is-on' : ''}`}
                    aria-expanded={yearOpen}
                    aria-haspopup="listbox"
                    onClick={() => setYearOpen((open) => !open)}
                  >
                    <span>{yearLabel}</span>
                    <Icon name="chevron-down" size={20} />
                  </button>
                  {yearOpen && (
                    <div className="shop-year-menu" role="listbox">
                      {years.map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="option"
                          aria-selected={year === value}
                          className={year === value ? 'is-on' : undefined}
                          onClick={() => onYear(value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="shop-brands">
                {SHOP_BRANDS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="shop-chip"
                    onClick={() => onBrand(item.name)}
                  >
                    <img src={item.src} alt="" width={20} height={20} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
              <Link href="/shop/request" className="shop-find">
                Can&apos;t Find Your Vehicle?
              </Link>
            </>
          )}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="shop-grid">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} layout="shop" priority={index < 6} />
          ))}
        </div>
      )}
    </div>
  );
}
