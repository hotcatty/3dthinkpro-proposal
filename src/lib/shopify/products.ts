import { storefrontFetch } from './client';
import {
  COLLECTION_PRODUCTS_QUERY,
  PRODUCT_HANDLES_QUERY,
  PRODUCT_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  PRODUCTS_QUERY,
} from './queries';
import type { Metafield, Money, Product, ProductCardData, Variant } from './types';
import { expandYearRange, isAllYearsToken } from '@/lib/cms/yearRange';

type ProductsResponse = {
  products: { nodes: RawProductCard[] };
};

type ProductResponse = {
  product: RawProduct | null;
};

type HandlesResponse = {
  products: { nodes: { handle: string }[] };
};

type CollectionProductsResponse = {
  collection: {
    handle: string;
    title: string;
    products: { nodes: RawProductCard[] };
  } | null;
};

type RecommendationsResponse = {
  productRecommendations: RawProductCard[] | null;
};

/** Shopify collection handle for the homepage Iconic Products rail. */
export const ICONIC_PRODUCTS_COLLECTION_HANDLE = 'iconic-products';
/** Duplicate-handle suffix Shopify adds if `iconic-products` is already taken. */
export const ICONIC_PRODUCTS_COLLECTION_ALIASES = ['iconic-products-1'] as const;

type RawImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type RawMoney = { amount: string; currencyCode: string };

type RawProductCard = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  options?: { id: string; name: string; values: string[] }[];
  featuredImage: RawImage | null;
  images: { nodes: RawImage[] };
  variants: { nodes: { sku: string | null }[] };
  priceRange: { minVariantPrice: RawMoney };
  compareAtPriceRange: { minVariantPrice: RawMoney };
};

type RawProduct = RawProductCard & {
  description: string;
  descriptionHtml: string;
  metafields?: Array<Metafield | null> | null;
  options: { id: string; name: string; values: string[] }[];
  images: { nodes: RawImage[] };
  variants: {
    nodes: {
      id: string;
      title: string;
      sku: string | null;
      availableForSale: boolean;
      quantityAvailable: number | null;
      selectedOptions: { name: string; value: string }[];
      price: RawMoney;
      compareAtPrice: RawMoney | null;
      image: RawImage | null;
    }[];
  };
  priceRange: { minVariantPrice: RawMoney; maxVariantPrice: RawMoney };
  compareAtPriceRange: { minVariantPrice: RawMoney; maxVariantPrice: RawMoney };
};

export function hasDiscount(price: Money, compareAt?: Money | null) {
  if (!compareAt) return false;
  const a = parseFloat(price.amount);
  const b = parseFloat(compareAt.amount);
  return Number.isFinite(a) && Number.isFinite(b) && b > a && b > 0;
}

export function formatMoney(money: Money, locale = 'en-US') {
  const value = parseFloat(money.amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currencyCode,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function yearsFromProduct(node: RawProductCard): string[] {
  const fromOptions =
    node.options?.find((option) => /year|年份|fitment|年款/i.test(option.name))?.values ?? [];
  const cleaned = fromOptions.map((value) => value.trim()).filter(Boolean);
  if (cleaned.length) {
    const expanded: string[] = [];
    for (const value of cleaned) {
      if (isAllYearsToken(value)) continue;
      const years = expandYearRange(value);
      if (years.length) expanded.push(...years);
      else if (/^\d{4}$/.test(value)) expanded.push(value);
    }
    return [...new Set(expanded)].sort((a, b) => Number(b) - Number(a));
  }

  const titleYear = node.title.match(/\b((?:19|20)\d{2})\b/)?.[1];
  return titleYear ? [titleYear] : [];
}

function flattenCard(node: RawProductCard): ProductCardData {
  const featured = node.featuredImage ?? node.images?.nodes[0] ?? null;
  const hover = node.images?.nodes.find((image) => image.url !== featured?.url) ?? null;
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    sku: node.variants?.nodes[0]?.sku?.trim() || node.handle,
    featuredImage: featured,
    hoverImage: hover,
    price: node.priceRange.minVariantPrice,
    compareAtPrice: hasDiscount(
      node.priceRange.minVariantPrice,
      node.compareAtPriceRange.minVariantPrice,
    )
      ? node.compareAtPriceRange.minVariantPrice
      : null,
    availableForSale: node.availableForSale,
    years: yearsFromProduct(node),
  };
}

function flattenProduct(node: RawProduct): Product {
  const sku =
    node.variants.nodes.find((v) => v.sku?.trim())?.sku?.trim() ||
    node.handle;
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    metafields: (node.metafields ?? []).filter((field): field is Metafield => Boolean(field)),
    availableForSale: node.availableForSale,
    sku,
    options: node.options,
    variants: node.variants.nodes,
    images: node.images.nodes,
    featuredImage: node.featuredImage,
    priceRange: node.priceRange,
    compareAtPriceRange: node.compareAtPriceRange,
  };
}

export async function getProducts(opts?: {
  first?: number;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
  revalidate?: number;
}): Promise<ProductCardData[]> {
  const data = await storefrontFetch<ProductsResponse>(
    PRODUCTS_QUERY,
    {
      first: opts?.first ?? 24,
      query: opts?.query ?? null,
      sortKey: opts?.sortKey ?? 'BEST_SELLING',
      reverse: opts?.reverse ?? false,
    },
    { revalidate: opts?.revalidate === 0 ? false : opts?.revalidate ?? 60 },
  );
  return data.products.nodes.map(flattenCard);
}

/** Products from one collection. Missing/empty collection returns [] — no catalog fallback. */
export async function getCollectionProducts(opts: {
  handle: string;
  first?: number;
  sortKey?: string;
  revalidate?: number;
}): Promise<ProductCardData[]> {
  const data = await storefrontFetch<CollectionProductsResponse>(
    COLLECTION_PRODUCTS_QUERY,
    {
      handle: opts.handle,
      first: opts.first ?? 24,
      sortKey: opts.sortKey ?? 'COLLECTION_DEFAULT',
    },
    { revalidate: opts.revalidate === 0 ? false : opts.revalidate ?? 60 },
  );
  return data.collection?.products.nodes.map(flattenCard) ?? [];
}

/**
 * Shopify native recommendations for a PDP (You May Also Like).
 * Empty/unavailable stays empty — no catalog fallback.
 */
export async function getProductRecommendations(opts: {
  productId: string;
  revalidate?: number;
}): Promise<ProductCardData[]> {
  const data = await storefrontFetch<RecommendationsResponse>(
    PRODUCT_RECOMMENDATIONS_QUERY,
    { productId: opts.productId },
    { revalidate: opts.revalidate === 0 ? false : opts.revalidate ?? 60 },
  );
  return (data.productRecommendations ?? [])
    .filter((node) => node.id !== opts.productId)
    .map(flattenCard);
}

export async function getProduct(
  handle: string,
  opts?: { revalidate?: number },
): Promise<Product | null> {
  const data = await storefrontFetch<ProductResponse>(
    PRODUCT_QUERY,
    { handle },
    { revalidate: opts?.revalidate ?? 60 },
  );
  return data.product ? flattenProduct(data.product) : null;
}

export async function getProductHandles(first = 100): Promise<string[]> {
  const data = await storefrontFetch<HandlesResponse>(
    PRODUCT_HANDLES_QUERY,
    { first },
    { revalidate: 3600 },
  );
  return data.products.nodes.map((n) => n.handle);
}

export function findVariantBySelectedOptions(
  product: Product,
  selected: Record<string, string>,
): Variant | null {
  return (
    product.variants.find((variant) =>
      variant.selectedOptions.every((opt) => selected[opt.name] === opt.value),
    ) ?? null
  );
}
