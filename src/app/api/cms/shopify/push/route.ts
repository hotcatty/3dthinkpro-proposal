import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/cms/products';
import { adminConfigured, missingAdminScopes } from '@/lib/shopify/admin';
import { pushProductRows } from '@/lib/shopify/adminPush';
import { probeAdmin } from '@/lib/shopify/adminProbe';

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          '还没配置 Shopify Admin 凭据。在本页填 Client ID + Client Secret（或 SHOPIFY_ADMIN_ACCESS_TOKEN）并先点「测试 Shopify 连接」。',
      },
      { status: 400 },
    );
  }

  let ids: string[] | undefined;
  try {
    const body = (await request.json()) as { ids?: unknown };
    if (Array.isArray(body.ids)) {
      ids = body.ids.filter((id): id is string => typeof id === 'string' && Boolean(id));
    }
  } catch {
    ids = undefined;
  }

  try {
    const probe = await probeAdmin();
    if (!probe.ok) {
      return NextResponse.json({ ok: false, error: probe.error }, { status: 400 });
    }
    const missing = missingAdminScopes(probe.scopes);
    if (missing.includes('write_products')) {
      return NextResponse.json(
        {
          ok: false,
          error: `当前 token 没有 write_products。请在 Dev Dashboard 勾选 ${missing.join(' / ')} 后重新 Release，再测连接。`,
        },
        { status: 400 },
      );
    }

    const catalog = await getProducts();
    const rows = catalog.rows.filter((row) => {
      if (!row.handle.trim() && !row.title.trim()) return false;
      if (ids?.length) return ids.includes(row.id);
      return Boolean(row.handle.trim() && row.title.trim());
    });
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: '没有可推送的商品。先保存，并确认 Handle / Title 已填。' }, { status: 400 });
    }

    const data = await pushProductRows(rows);
    return NextResponse.json({
      ok: data.errors.length === 0,
      data: {
        ...data,
        missingScopes: missing,
      },
      error:
        data.errors.length > 0
          ? `${data.results.length} 条成功，${data.errors.length} 条失败：${data.errors
              .map((item) => `${item.handle || item.sku || item.id} ${item.message}`)
              .join('；')}`
          : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : '推送失败' },
      { status: 500 },
    );
  }
}
