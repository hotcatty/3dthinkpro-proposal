import { NextResponse } from 'next/server';
import { adminConfigured, missingAdminScopes, REQUIRED_ADMIN_SCOPES } from '@/lib/shopify/admin';
import { probeAdmin } from '@/lib/shopify/adminProbe';

export async function GET() {
  if (!adminConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error:
        '还没配置 Shopify Admin 凭据。需要 SHOPIFY_STORE_DOMAIN + (SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET) 或者 SHOPIFY_ADMIN_ACCESS_TOKEN。',
    });
  }

  try {
    const probe = await probeAdmin();
    if (!probe.ok) {
      return NextResponse.json({
        ok: false,
        configured: true,
        error: probe.error,
      });
    }
    const missing = missingAdminScopes(probe.scopes);
    return NextResponse.json({
      ok: true,
      configured: true,
      data: {
        name: probe.name,
        myshopifyDomain: probe.myshopifyDomain,
        scopes: probe.scopes,
        requiredScopes: REQUIRED_ADMIN_SCOPES,
        missingScopes: missing,
      },
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      configured: true,
      error: error instanceof Error ? error.message : '连接失败',
    });
  }
}
