// Shopify Admin API 服务端工具（Server-side only）
// 使用 Admin REST API 获取产品，用 Storefront API 处理结账

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;

// ─── Admin REST API：获取产品列表（仅服务端） ────────────────
export async function getProducts(): Promise<ShopifyProduct[]> {
  const url = `https://${domain}/admin/api/2024-04/products.json?limit=50&status=active`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': adminAccessToken,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify Admin API error ${response.status}: ${text}`);
  }

  const json = await response.json();
  
  // 将 Admin API 格式转换为统一格式
  return json.products.map((p: AdminProduct) => ({
    id: `gid://shopify/Product/${p.id}`,
    adminId: p.id,
    title: p.title,
    handle: p.handle,
    description: p.body_html?.replace(/<[^>]+>/g, '') || '',
    priceRange: {
      minVariantPrice: {
        amount: p.variants?.[0]?.price || '0',
        currencyCode: 'USD',
      },
    },
    images: {
      edges: p.images?.map((img) => ({
        node: { url: img.src, altText: img.alt || null },
      })) || [],
    },
    variants: {
      edges: p.variants?.map((v) => ({
        node: {
          id: `gid://shopify/ProductVariant/${v.id}`,
          adminVariantId: v.id,
          title: v.title,
          price: { amount: v.price, currencyCode: 'USD' },
          availableForSale: v.inventory_quantity > 0 || v.inventory_management === null,
        },
      })) || [],
    },
  }));
}

// ─── Admin REST API：用 Draft Order 创建结账链接 ─────────────
export async function createCheckout(variantId: number, quantity: number = 1): Promise<string> {
  const url = `https://${domain}/admin/api/2024-04/draft_orders.json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': adminAccessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      draft_order: {
        line_items: [{ variant_id: variantId, quantity }],
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Checkout creation failed ${response.status}: ${text}`);
  }

  const json = await response.json();
  // Draft order 的结账链接
  return json.draft_order.invoice_url;
}

// ─── Admin API 原始类型 ───────────────────────────────────────
interface AdminProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  variants: AdminVariant[];
  images: AdminImage[];
}

interface AdminVariant {
  id: number;
  title: string;
  price: string;
  inventory_quantity: number;
  inventory_management: string | null;
}

interface AdminImage {
  src: string;
  alt: string | null;
}

// ─── 统一类型定义 ────────────────────────────────────────────
export interface ShopifyProduct {
  id: string;
  adminId?: number;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        adminVariantId?: number;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}
