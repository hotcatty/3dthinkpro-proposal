import type { ProductReview } from '@/lib/cms/types';

const API = 'https://api.judge.me/api/v1';

type JudgeMePicture = {
  hidden?: boolean;
  urls?: {
    small?: string;
    compact?: string;
    huge?: string;
    original?: string;
  };
};

type JudgeMeReviewer = {
  name?: string;
};

type JudgeMeReview = {
  id?: number;
  title?: string;
  body?: string;
  rating?: number;
  hidden?: boolean;
  curated?: string;
  verified?: string;
  created_at?: string;
  product_external_id?: number | string;
  product_handle?: string;
  product_title?: string;
  reviewer?: JudgeMeReviewer;
  has_published_pictures?: boolean;
  pictures?: JudgeMePicture[];
};

type ReviewsResponse = {
  current_page?: number;
  per_page?: number;
  reviews?: JudgeMeReview[];
  error?: string;
};

function shopDomain() {
  return (
    process.env.JUDGEME_SHOP_DOMAIN ||
    process.env.SHOPIFY_STORE_DOMAIN ||
    ''
  ).replace(/^https?:\/\//, '');
}

function privateToken() {
  return process.env.JUDGEME_PRIVATE_API_TOKEN || '';
}

export function shopifyNumericId(gid: string) {
  const match = gid.match(/Product\/(\d+)/);
  return match?.[1] || '';
}

function plain(value: unknown) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(iso: string | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

function pictureUrls(pictures: JudgeMePicture[] | undefined) {
  if (!Array.isArray(pictures)) return [];
  return pictures
    .filter((item) => !item.hidden)
    .map((item) => item.urls?.compact || item.urls?.huge || item.urls?.original || item.urls?.small || '')
    .filter(Boolean);
}

function isPublished(review: JudgeMeReview) {
  return !review.hidden && review.curated !== 'spam' && review.curated !== 'hold';
}

function toProductReview(review: JudgeMeReview): ProductReview {
  const verified = review.verified === 'buyer';
  const title = plain(review.title);
  const body = plain(review.body);
  return {
    id: `jm-${review.id ?? crypto.randomUUID()}`,
    productHandle: plain(review.product_handle),
    status: 'published',
    featured: false,
    name: plain(review.reviewer?.name) || 'Customer',
    date: formatDate(review.created_at),
    rating: Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5))),
    text: body || title,
    ownerBadge: verified ? 'Verified buyer' : plain(review.product_title),
    country: '',
    location: '',
    images: pictureUrls(review.pictures),
    likes: 0,
    dislikes: 0,
  };
}

async function judgeMeGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const token = privateToken();
  const domain = shopDomain();
  if (!token || !domain) return null;

  const url = new URL(`${API}${path}`);
  url.searchParams.set('shop_domain', domain);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Api-Token': token,
    },
    next: { revalidate: 60, tags: ['judgeme-reviews'] },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function fetchReviewPages() {
  const all: JudgeMeReview[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const data = await judgeMeGet<ReviewsResponse>('/reviews', {
      page: String(page),
      per_page: '50',
    });
    if (!data || data.error || !Array.isArray(data.reviews)) break;
    all.push(...data.reviews);
    if (data.reviews.length < 50) break;
  }
  return all.filter(isPublished);
}

export async function getJudgeMeReviews(filter?: {
  handle?: string;
  productId?: string;
}): Promise<ProductReview[]> {
  try {
    const rows = await fetchReviewPages();
    const handle = filter?.handle?.toLowerCase() || '';
    const productId = filter?.productId || '';
    const matched = rows.filter((item) => {
      if (!handle && !productId) return true;
      const itemHandle = String(item.product_handle || '').toLowerCase();
      const itemId = String(item.product_external_id || '');
      return (handle && itemHandle === handle) || (productId && itemId === productId);
    });
    return matched.map(toProductReview);
  } catch {
    return [];
  }
}

export async function getJudgeMeStats() {
  try {
    const [countRes, ratingRes] = await Promise.all([
      judgeMeGet<{ all_reviews_count?: number }>('/widgets/all_reviews_count', {}),
      judgeMeGet<{ all_reviews_rating?: string }>('/widgets/all_reviews_rating', {}),
    ]);
    const count = Number(countRes?.all_reviews_count) || 0;
    const rating = Number(ratingRes?.all_reviews_rating) || 0;
    return { count, rating };
  } catch {
    return { count: 0, rating: 0 };
  }
}
