import { storefrontFetch } from './client';
import { SHOP_POLICIES_QUERY } from './queries';

export type ShopPolicy = {
  title: string;
  handle: string;
  body: string;
};

type RawPolicy = {
  title?: string | null;
  handle?: string | null;
  body?: string | null;
} | null;

type ShopPoliciesResponse = {
  shop: {
    privacyPolicy: RawPolicy;
    refundPolicy: RawPolicy;
    shippingPolicy: RawPolicy;
    termsOfService: RawPolicy;
    termsOfSale: RawPolicy;
    legalNotice: RawPolicy;
    contactInformation: RawPolicy;
    subscriptionPolicy: RawPolicy;
  };
};

function sanitizePolicyHtml(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<\/?(iframe|object|embed|link|meta)\b[^>]*>/gi, '');
}

function normalizePolicy(raw: RawPolicy): ShopPolicy | null {
  if (!raw?.handle?.trim() || !raw.body?.trim()) return null;
  return {
    title: raw.title?.trim() || 'Policy',
    handle: raw.handle.trim(),
    body: sanitizePolicyHtml(raw.body),
  };
}

export async function getShopPolicies(): Promise<ShopPolicy[]> {
  const data = await storefrontFetch<ShopPoliciesResponse>(SHOP_POLICIES_QUERY, undefined, {
    revalidate: 300,
  });
  return [
    data.shop.privacyPolicy,
    data.shop.refundPolicy,
    data.shop.shippingPolicy,
    data.shop.termsOfService,
    data.shop.termsOfSale,
    data.shop.legalNotice,
    data.shop.contactInformation,
    data.shop.subscriptionPolicy,
  ]
    .map(normalizePolicy)
    .filter((policy): policy is ShopPolicy => Boolean(policy));
}

export async function getShopPolicy(handle: string): Promise<ShopPolicy | null> {
  const policies = await getShopPolicies();
  return policies.find((policy) => policy.handle === handle) ?? null;
}
