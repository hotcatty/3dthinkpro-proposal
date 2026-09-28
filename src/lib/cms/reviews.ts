import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { ProductReview, ReviewsContent } from './types';
import { emptyReview } from './reviewRow';

const contentPath = path.join(process.cwd(), 'content/reviews.json');

const SEED: ProductReview[] = [
  {
    id: 'rv-1',
    productHandle: '',
    status: 'published',
    featured: true,
    name: 'ivan s.',
    date: '06/12/26',
    rating: 5,
    text: "Best upgrade I've made to the bike. My tailbone finally forgives me.",
    ownerBadge: 'Honda CBR650R owner',
    country: 'US',
    location: 'California',
    images: [],
    likes: 21,
    dislikes: 0,
  },
  {
    id: 'rv-2',
    productHandle: 'honda-cbr1000-rr',
    status: 'published',
    featured: false,
    name: 'Marcus T.',
    date: '07/17/26',
    rating: 5,
    text: "Switched to the 3DThinkPro lattice seat before a 900-mile weekend run. On my old foam seat I'd be shifting around and going numb by hour six — this time I rolled into camp still comfortable. It stays cool even in stop-and-go traffic, and after three months of daily commuting it looks brand new, zero sag. Honestly didn't expect a seat to make this much difference.",
    ownerBadge: 'BMW R1250GS owner',
    country: 'US',
    location: 'California',
    images: [],
    likes: 12,
    dislikes: 0,
  },
  {
    id: 'rv-3',
    productHandle: 'honda-cbr1000-rr',
    status: 'published',
    featured: false,
    name: 'kez',
    date: '09/05/26',
    rating: 5,
    text: 'Fit my CB650R perfectly — bolts lined up first try. Look is aggressive, ride is soft where it needs to be.',
    ownerBadge: 'Honda CB650R owner',
    country: 'JP',
    location: 'Tokyo',
    images: ['/pdp/review-1.jpg', '/pdp/review-2.jpg', '/pdp/review-3.jpg'],
    likes: 8,
    dislikes: 0,
  },
  {
    id: 'rv-4',
    productHandle: '',
    status: 'published',
    featured: false,
    name: 'Elena R.',
    date: '08/22/26',
    rating: 5,
    text: "Finally a seat that doesn't cook my legs in summer. Lattice vents heat better than any foam I've owned.",
    ownerBadge: 'Yamaha MT-09 owner',
    country: 'ES',
    location: 'Barcelona',
    images: [],
    likes: 5,
    dislikes: 0,
  },
];

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function normalizeReviews(raw: Partial<ReviewsContent> | null | undefined): ReviewsContent {
  const reviews = Array.isArray(raw?.reviews)
    ? raw.reviews.map((item, index): ProductReview => {
        const base = emptyReview(str(item?.id) || `rv-${index + 1}`);
        return {
          ...base,
          ...item,
          id: str(item?.id) || base.id,
          status: item?.status === 'published' ? 'published' : 'pending',
          featured: Boolean(item?.featured),
          rating: Math.min(5, Math.max(1, Math.round(num(item?.rating, 5)))),
          images: Array.isArray(item?.images)
            ? item.images.filter((x): x is string => typeof x === 'string')
            : [],
          likes: num(item?.likes, 0),
          dislikes: num(item?.dislikes, 0),
        };
      })
    : [];
  return { reviews };
}

export async function getReviews(): Promise<ReviewsContent> {
  try {
    const raw = await readFile(contentPath, 'utf8');
    const parsed = JSON.parse(raw) as ReviewsContent;
    if (Array.isArray(parsed?.reviews)) return normalizeReviews(parsed);
  } catch {
    // missing file → seed
  }
  return { reviews: SEED };
}

export async function saveReviews(input: ReviewsContent): Promise<ReviewsContent> {
  const next = normalizeReviews(input);
  await mkdir(path.dirname(contentPath), { recursive: true });
  await writeFile(contentPath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

export function reviewsForProduct(all: ProductReview[], handle: string): ProductReview[] {
  return all.filter(
    (item) =>
      item.status === 'published' &&
      (!item.productHandle || item.productHandle === handle),
  );
}

export function featuredReviewFor(all: ProductReview[], handle?: string): ProductReview | null {
  const featured = all.filter((item) => item.status === 'published' && item.featured);
  if (handle) {
    const matched = featured.find((item) => !item.productHandle || item.productHandle === handle);
    if (matched) return matched;
  }
  return featured[0] ?? null;
}
