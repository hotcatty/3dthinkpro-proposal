const API_VERSION = '2026-07';

type StorefrontError = {
  message: string;
};

function endpoint() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN');
  }
  if (domain === 'mock.shop') {
    return 'https://mock.shop/api';
  }
  return `https://${domain}/api/${API_VERSION}/graphql.json`;
}

async function buyerIp() {
  try {
    const { headers } = await import('next/headers');
    const incoming = await headers();
    const forwarded = incoming.get('x-forwarded-for');
    const first = forwarded?.split(',')[0]?.trim();
    if (first) return first;
    return incoming.get('x-real-ip') ?? incoming.get('cf-connecting-ip') ?? undefined;
  } catch {
    return undefined;
  }
}

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number | false },
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

  if (!domain) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN');
  }
  if (domain !== 'mock.shop' && !token) {
    throw new Error('Missing SHOPIFY_STOREFRONT_PUBLIC_TOKEN');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (domain !== 'mock.shop' && token) {
    headers['X-Shopify-Storefront-Access-Token'] = token;
    const ip = await buyerIp();
    if (ip) headers['Shopify-Storefront-Buyer-IP'] = ip;
  }

  const res = await fetch(endpoint(), {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    ...(options?.revalidate === false
      ? { cache: 'no-store' as const }
      : { next: { revalidate: options?.revalidate ?? 60 } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storefront API ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: StorefrontError[];
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  if (!json.data) {
    throw new Error('Storefront API returned empty data');
  }
  return json.data;
}
