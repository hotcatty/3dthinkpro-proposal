export type MediaKind = 'image' | 'video';

export type CmsMedia = {
  kind: MediaKind;
  src: string;
};

export type HeroContent = {
  enabled: boolean;
  ctaLabel: string;
  ctaHref: string;
  media: CmsMedia | null;
};

export type CampaignContent = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  media: CmsMedia | null;
};

export type SocialCardContent = {
  id: string;
  brand: string;
  model: string;
  href: string;
  media: CmsMedia | null;
};

export type HomeContent = {
  hero: HeroContent;
  campaigns: CampaignContent[];
  social: {
    title: string;
    cards: SocialCardContent[];
  };
};

export const MAX_CAMPAIGNS = 4;

export type ProductRow = {
  id: string;
  handle: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productCategory: string;
  type: string;
  tags: string;
  published: boolean;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  option3Name: string;
  option3Value: string;
  sku: string;
  /** Details copy: section HTML. Legacy `· ` / `1. ` / `> ` / `**bold**` still loads. */
  detailsText: string;
  /** Installation copy: same HTML (or legacy dump) as detailsText. */
  installationText: string;
  grams: string;
  inventoryTracker: string;
  inventoryQty: string;
  inventoryPolicy: string;
  fulfillmentService: string;
  price: string;
  compareAtPrice: string;
  requiresShipping: boolean;
  taxable: boolean;
  barcode: string;
  images: string[];
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  weightUnit: string;
  status: 'draft' | 'active';
  cost: string;
};

export type ProductsContent = {
  imageBaseUrl: string;
  rows: ProductRow[];
};

export type ReviewStatus = 'published' | 'pending';

export type ProductReview = {
  id: string;
  /** Empty handle = show on every PDP */
  productHandle: string;
  status: ReviewStatus;
  featured: boolean;
  name: string;
  date: string;
  rating: number;
  text: string;
  ownerBadge: string;
  country: string;
  location: string;
  images: string[];
  likes: number;
  dislikes: number;
};

export type ReviewsContent = {
  reviews: ProductReview[];
};
