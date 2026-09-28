'use client';

import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/commerce/ProductCard';
import ProductRail from '@/components/commerce/ProductRail';
import ReviewList from '@/components/reviews/ReviewList';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { addToCartAction, buyNowAction } from '@/lib/actions/cart';
import { pdpCopyFromProduct } from '@/lib/shopify/pdpCopy';
import { findVariantBySelectedOptions, formatMoney, hasDiscount } from '@/lib/shopify/products';
import type { ProductReview } from '@/lib/cms/types';
import type { Product, ProductCardData } from '@/lib/shopify/types';

type AccordionId = 'details' | 'installation';

const KEY_INFO = [
  {
    title: 'Vehicle Fitment Notice',
    body: 'Please double-check your motorcycle model and year before ordering.',
    image: '/pdp/fitment.png',
  },
  {
    title: 'Installation Guide',
    body: 'Please check all parts upon receipt before installation. Improper installation may cause product damage or safety hazards.',
    image: '/pdp/install.png',
  },
  {
    title: 'Material Specifications',
    body: 'Made of high-density durable material, wear resistant and sun-resistant for long-term outdoor motorcycle use.',
    image: '/pdp/material.png',
  },
] as const;

function AccordionIcon({ minus }: { minus: boolean }) {
  return (
    <svg className="pdp-acc-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      {minus ? (
        <path d="M5 12h14" />
      ) : (
        <path d="M5 12h14M12 5v14" />
      )}
    </svg>
  );
}

function Stars({ count = 5, size = 24 }: { count?: number; size?: number }) {
  return (
    <span className="pdp-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <img key={i} src="/icons/star.svg" alt="" width={size} height={size} />
      ))}
    </span>
  );
}


export default function ProductDetailClient({
  product,
  related,
  featuredReview,
  listReviews,
  fitment,
}: {
  product: Product;
  related: ProductCardData[];
  featuredReview: ProductReview | null;
  listReviews: ProductReview[];
  fitment: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const copy = useMemo(() => pdpCopyFromProduct(product), [product]);
  const [open, setOpen] = useState<AccordionId | null>(() => {
    const initial = pdpCopyFromProduct(product);
    if (initial.installationHtml) return 'installation';
    if (initial.detailsHtml) return 'details';
    return null;
  });
  const [maskOn, setMaskOn] = useState(false);
  const detailsOpen = open === 'details';
  const installOpen = open === 'installation';
  const installScrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = product.variants[0];
    const init: Record<string, string> = {};
    first?.selectedOptions.forEach((opt) => {
      init[opt.name] = opt.value;
    });
    return init;
  });

  const variant = useMemo(
    () => findVariantBySelectedOptions(product, selected) ?? product.variants[0] ?? null,
    [product, selected],
  );

  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compare = variant?.compareAtPrice;
  const images = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const sku = (variant?.sku || product.sku || product.handle).toUpperCase();
  const featured = featuredReview;
  const cartLabel = pending && !added ? 'Please wait…' : added ? 'Added' : 'Add to Cart';
  const shopReady = Boolean(variant?.availableForSale);

  function syncInstallMask(el: HTMLElement | null) {
    if (!el || !installOpen) {
      setMaskOn(false);
      return;
    }
    const overflow = el.scrollHeight - el.clientHeight > 1;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setMaskOn(overflow && !atEnd);
  }

  useLayoutEffect(() => {
    const el = installScrollRef.current;
    syncInstallMask(el);
    if (!el) return;
    const onResize = () => syncInstallMask(el);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    ro?.observe(el);
    window.addEventListener('resize', onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [installOpen, detailsOpen, copy.installationHtml]);

  function toggleAccordion(id: AccordionId) {
    setOpen((current) => (current === id ? null : id));
  }

  function add() {
    if (!variant) return;
    setError('');
    setAdded(false);
    startTransition(async () => {
      const result = await addToCartAction(variant.id, qty);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAdded(true);
      router.refresh();
    });
  }

  function buy() {
    if (!variant) return;
    setError('');
    startTransition(async () => {
      const result = await buyNowAction(variant.id, qty);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.data.checkoutUrl;
    });
  }

  return (
    <div className="pdp-page">
      <div className="pdp-main">
        <div className="pdp-hero">
          <div className="pdp-gallery">
            {images.length > 0 ? (
              images.map((img, i) => (
                <figure key={img.url + i} className="pdp-gallery-frame">
                  <img
                    src={img.url}
                    alt={img.altText || product.title}
                    width={img.width || 1200}
                    height={img.height || 1200}
                    decoding="async"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </figure>
              ))
            ) : (
              <div className="pdp-gallery-empty">No image</div>
            )}
          </div>

          <aside className="pdp-buy">
            <div className="pdp-buy-head">
              <div className="pdp-buy-title">
                <div className="pdp-sku">{sku}</div>
                <h1 className="pdp-fit-title">{fitment}</h1>
              </div>
              <div className="pdp-price">
                {formatMoney(price)}
                {compare && hasDiscount(price, compare) && (
                  <span className="pcard-compare">{formatMoney(compare)}</span>
                )}
              </div>
            </div>

            <hr className="pdp-rule" />

            <div className="pdp-order">
              <div className="pdp-info">
                <div className={`pdp-acc pdp-acc-details${detailsOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="pdp-acc-head"
                    aria-expanded={detailsOpen}
                    aria-controls="pdp-details-body"
                    onClick={() => toggleAccordion('details')}
                  >
                    <span className="fs-14 fw-regular c-black-60">Details</span>
                    <AccordionIcon minus={detailsOpen} />
                  </button>
                  <div className="pdp-acc-panel" aria-hidden={!detailsOpen}>
                    <div className="pdp-acc-clip">
                      {copy.detailsHtml ? (
                        <div
                          className="pdp-acc-body pdp-details"
                          id="pdp-details-body"
                          dangerouslySetInnerHTML={{ __html: copy.detailsHtml }}
                        />
                      ) : (
                        <div className="pdp-acc-body pdp-details pdp-acc-empty" id="pdp-details-body">
                          More information coming soon.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="pdp-rule" />

                <div className={`pdp-acc pdp-acc-install${installOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="pdp-acc-head"
                    aria-expanded={installOpen}
                    aria-controls="pdp-install-body"
                    onClick={() => toggleAccordion('installation')}
                  >
                    <span className="fs-14 fw-regular c-black-60">Installation</span>
                    <AccordionIcon minus={installOpen} />
                  </button>
                  <div className="pdp-acc-panel" aria-hidden={!installOpen}>
                    <div className="pdp-acc-clip">
                      {copy.installationHtml ? (
                        <div
                          className="pdp-acc-body pdp-install"
                          id="pdp-install-body"
                          ref={installScrollRef}
                          onScroll={(e) => syncInstallMask(e.currentTarget)}
                          dangerouslySetInnerHTML={{ __html: copy.installationHtml }}
                        />
                      ) : (
                        <div
                          className="pdp-acc-body pdp-install pdp-acc-empty"
                          id="pdp-install-body"
                          ref={installScrollRef}
                          onScroll={(e) => syncInstallMask(e.currentTarget)}
                        >
                          More information coming soon.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="pdp-rule" />

                {maskOn ? <div className="pdp-info-mask" aria-hidden /> : null}
              </div>

              <div className="pdp-qty">
                <p className="pdp-label fs-14 fw-regular c-black-60">QUANTITY:</p>
                <div className="pdp-qty-box">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                  >
                    −
                  </button>
                  <span className="fs-18">{qty}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((n) => n + 1)}>
                    +
                  </button>
                </div>
              </div>

              {error && <p className="error-box">{error}</p>}

              <div className="pdp-checkout">
                <Button
                  variant="solid"
                  className="pdp-cta"
                  disabled={pending || !variant?.availableForSale}
                  onClick={add}
                >
                  <span className="pdp-cta-label">{cartLabel}</span>
                </Button>
                <Button
                  variant="shop"
                  className="pdp-cta"
                  disabled={pending || !variant?.availableForSale}
                  onClick={buy}
                >
                  <span className="pdp-cta-label">
                    {shopReady ? (
                      <>
                        <span>Buy with</span>
                        <img
                          src="/icons/shop-wordmark.svg"
                          alt="Shop"
                          width={48.208}
                          height={19.295}
                          className="pdp-btn-shop-logo"
                        />
                      </>
                    ) : (
                      'Unavailable'
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <hr className="pdp-rule pdp-rule-full" />

        {featured ? (
          <section className="pdp-featured" id="reviews">
            <Stars count={featured.rating} size={24} />
            <div className="pdp-featured-row">
              <div className="pdp-featured-copy">
                <p className="pdp-featured-quote">“{featured.text}”</p>
                <p className="pdp-featured-author">{featured.name}</p>
              </div>
              {listReviews.length > 0 ? (
                <a href="#reviews-list" className="pdp-reviews-btn">
                  Read All Reviews
                  <Icon name="chevron-down" size={20} />
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="pdp-key">
          <h2 className="pdp-section-title">Key Information</h2>
          <div className="pdp-key-grid">
            {KEY_INFO.map((item) => (
              <Link key={item.title} href="/technology" className="pdp-key-card">
                <div className="pdp-key-media">
                  <img src={item.image} alt="" />
                </div>
                <div className="pdp-key-body">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span className="pdp-key-more">Learn More</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {listReviews.length > 0 ? (
          <section className="pdp-reviews" id="reviews-list">
            <h2 className="pdp-section-title">Ratings &amp; Reviews</h2>
            <ReviewList reviews={listReviews} />
          </section>
        ) : null}
      </div>

      {related.length > 0 && (
        <ProductRail title="You May Also Like">
          {related.map((item, index) => (
            <ProductCard key={item.id} product={item} priority={index < 2} />
          ))}
        </ProductRail>
      )}
    </div>
  );
}
