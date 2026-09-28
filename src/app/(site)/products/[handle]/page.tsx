import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts as getCmsProducts } from '@/lib/cms/products';
import { fitmentFromCms } from '@/lib/cms/pdpOverlay';
import { featuredReviewFor, getReviews } from '@/lib/cms/reviews';
import { getJudgeMeReviews, getJudgeMeStats, shopifyNumericId } from '@/lib/judgeme/reviews';
import { getProduct, getProductHandles, getProductRecommendations } from '@/lib/shopify/products';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 60;
export const dynamicParams = true;

function productHandle(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateStaticParams() {
  try {
    const handles = await getProductHandles();
    return handles.map((handle) => ({ handle }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const handle = productHandle((await params).handle);
  const product = await getProduct(handle).catch(() => null);
  if (!product) return { title: 'Product' };
  return {
    title: `${product.title} — 3DThinkPro`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const handle = productHandle((await params).handle);
  const product = await getProduct(handle);
  if (!product) notFound();

  const [cms, reviewStore, liveReviews, liveStats] = await Promise.all([
    getCmsProducts(),
    getReviews(),
    getJudgeMeReviews({ handle, productId: shopifyNumericId(product.id) }),
    getJudgeMeStats(),
  ]);
  const row = cms.rows.find((item) => item.handle === handle);
  const featuredReview = featuredReviewFor(reviewStore.reviews, handle);
  const fitment = fitmentFromCms(product, row);

  const related = await getProductRecommendations({ productId: product.id }).catch(
    () => [],
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.priceRange.minVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(liveStats.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: liveStats.rating,
            reviewCount: liveStats.count,
          },
        }
      : {}),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetailClient
        product={product}
        related={related}
        featuredReview={featuredReview}
        listReviews={liveReviews}
        fitment={fitment}
      />
    </div>
  );
}
