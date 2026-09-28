import { readFileSync } from 'fs';
import path from 'path';
import { humanizeAdminHttpError } from './adminErrors';

export const ADMIN_API_VERSION = '2026-07';
export const REQUIRED_ADMIN_SCOPES = [
  'read_products',
  'write_products',
  'read_files',
  'write_files',
  'read_publications',
  'write_publications',
];

type AdminCredentials = {
  domain: string;
  explicitToken: string;
  clientId: string;
  clientSecret: string;
};

let envFileCache: { at: number; values: Record<string, string> } | null = null;

function readEnvLocal(): Record<string, string> {
  const now = Date.now();
  if (envFileCache && now - envFileCache.at < 2000) return envFileCache.values;
  try {
    const text = readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    const values: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      values[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
    envFileCache = { at: now, values };
    return values;
  } catch {
    envFileCache = { at: now, values: {} };
    return {};
  }
}

function pick(file: Record<string, string>, key: string, fallback: string): string {
  return (file[key] || fallback || '').trim();
}

function credentials(): AdminCredentials {
  const file = readEnvLocal();
  return {
    domain: pick(file, 'SHOPIFY_STORE_DOMAIN', process.env.SHOPIFY_STORE_DOMAIN || ''),
    explicitToken: pick(file, 'SHOPIFY_ADMIN_ACCESS_TOKEN', process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || ''),
    clientId: pick(file, 'SHOPIFY_CLIENT_ID', process.env.SHOPIFY_CLIENT_ID || ''),
    clientSecret: pick(file, 'SHOPIFY_CLIENT_SECRET', process.env.SHOPIFY_CLIENT_SECRET || ''),
  };
}

export function adminConfigured(): boolean {
  const { domain, explicitToken, clientId, clientSecret } = credentials();
  return Boolean(domain && (explicitToken || (clientId && clientSecret)));
}

export function missingAdminScopes(scopes: string[]): string[] {
  const have = new Set(scopes.map((scope) => scope.trim().toLowerCase()));
  return REQUIRED_ADMIN_SCOPES.filter((scope) => !have.has(scope));
}

export type AdminErrors = { message: string }[] | undefined;

type CachedToken = { token: string; expiresAt: number; scope?: string; key: string };
let cached: CachedToken | null = null;

function credKey(creds: AdminCredentials): string {
  return `${creds.domain}|${creds.clientId}|${creds.clientSecret}|${creds.explicitToken}`;
}

async function fetchAccessToken(
  domain: string,
  clientId: string,
  clientSecret: string,
): Promise<Omit<CachedToken, 'key'>> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(humanizeAdminHttpError(res.status, text));
  }
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
    scope?: string;
  };
  if (!json.access_token) {
    throw new Error('换取 access token 失败：响应里没有 access_token');
  }
  return {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
    scope: json.scope,
  };
}

async function getAccessToken(domain: string): Promise<string> {
  const creds = credentials();
  const key = credKey(creds);
  if (creds.explicitToken) return creds.explicitToken;
  if (!creds.clientId || !creds.clientSecret) {
    throw new Error(
      '未配置 SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET（或显式 SHOPIFY_ADMIN_ACCESS_TOKEN）',
    );
  }
  if (cached && cached.key === key && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cached.token;
  }
  const next = await fetchAccessToken(domain, creds.clientId, creds.clientSecret);
  cached = { ...next, key };
  return cached.token;
}

export async function adminGraphql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: T; errors?: AdminErrors }> {
  const { domain } = credentials();
  if (!domain) {
    throw new Error('未配置 SHOPIFY_STORE_DOMAIN');
  }
  const token = await getAccessToken(domain);

  const res = await fetch(`https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(humanizeAdminHttpError(res.status, detail));
  }

  return (await res.json()) as { data?: T; errors?: AdminErrors };
}

export async function ensureAccessToken(): Promise<void> {
  const { domain } = credentials();
  if (!domain) {
    throw new Error('未配置 SHOPIFY_STORE_DOMAIN');
  }
  await getAccessToken(domain);
}
