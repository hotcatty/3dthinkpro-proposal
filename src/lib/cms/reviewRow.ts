import type { ProductReview } from './types';

export function emptyReview(id: string): ProductReview {
  return {
    id,
    productHandle: '',
    status: 'published',
    featured: true,
    name: '',
    date: new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    }),
    rating: 5,
    text: '',
    ownerBadge: '',
    country: 'US',
    location: '',
    images: [],
    likes: 0,
    dislikes: 0,
  };
}
