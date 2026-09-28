import { cookies } from 'next/headers';

export const CMS_COOKIE = 'cms_auth';

function password() {
  return process.env.CMS_ADMIN_PASSWORD || '';
}

export async function cmsToken() {
  const value = password();
  if (!value) return '';
  const bytes = new TextEncoder().encode(`3dthinkpro-cms:${value}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function passwordOk(input: string) {
  const expected = password();
  return Boolean(expected) && input === expected;
}

export async function cmsAuthed() {
  const token = await cmsToken();
  if (!token) return false;
  const store = await cookies();
  return store.get(CMS_COOKIE)?.value === token;
}
