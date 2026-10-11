export const SITE_GATE_COOKIE = 'site_gate';

export function siteGatePassword() {
  return process.env.SITE_GATE_PASSWORD || '';
}

export function siteGateEnabled() {
  return Boolean(siteGatePassword());
}

export async function siteGateToken() {
  const value = siteGatePassword();
  if (!value) return '';
  const bytes = new TextEncoder().encode(`3dthinkpro-site:${value}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function siteGatePasswordOk(input: string) {
  const expected = siteGatePassword();
  return Boolean(expected) && input === expected;
}
