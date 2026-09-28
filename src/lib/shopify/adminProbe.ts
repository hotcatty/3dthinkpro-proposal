import { adminGraphql } from './admin';

export type AdminProbe = {
  ok: boolean;
  name?: string;
  myshopifyDomain?: string;
  scopes: string[];
  error?: string;
};

const PROBE = `
  query AdminProbe {
    shop { name myshopifyDomain }
    currentAppInstallation {
      accessScopes { handle }
    }
  }
`;

export async function probeAdmin(): Promise<AdminProbe> {
  const json = await adminGraphql<{
    shop: { name: string; myshopifyDomain: string } | null;
    currentAppInstallation: { accessScopes: Array<{ handle: string }> } | null;
  }>(PROBE);

  if (json.errors?.length) {
    return { ok: false, scopes: [], error: json.errors[0].message };
  }
  const shop = json.data?.shop;
  if (!shop) {
    return {
      ok: false,
      scopes: [],
      error: '能连上但读不到店铺，检查 token 权限（至少需要 read_products）。',
    };
  }
  const scopes = json.data?.currentAppInstallation?.accessScopes.map((item) => item.handle) ?? [];
  return {
    ok: true,
    name: shop.name,
    myshopifyDomain: shop.myshopifyDomain,
    scopes,
  };
}
