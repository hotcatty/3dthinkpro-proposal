import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'cms_auth';

async function token() {
  const password = process.env.CMS_ADMIN_PASSWORD || '';
  if (!password) return '';
  const bytes = new TextEncoder().encode(`3dthinkpro-cms:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicCms = pathname === '/admin/login' || pathname === '/api/cms/login';
  if (publicCms) return NextResponse.next();

  const expected = await token();
  const got = request.cookies.get(COOKIE)?.value;
  if (!expected || got !== expected) {
    if (pathname.startsWith('/api/cms')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const login = new URL('/admin/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/cms/:path*'],
};
