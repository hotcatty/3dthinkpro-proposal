import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SITE_GATE_COOKIE, siteGateEnabled, siteGateToken } from '@/lib/siteGate';

const CMS_COOKIE = 'cms_auth';

async function cmsToken() {
  const password = process.env.CMS_ADMIN_PASSWORD || '';
  if (!password) return '';
  const bytes = new TextEncoder().encode(`3dthinkpro-cms:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function withRobots(response: NextResponse) {
  if (siteGateEnabled()) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (/ninjia/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/ninjia/gi, 'ninja');
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/cms')) {
    const publicCms = pathname === '/admin/login' || pathname === '/api/cms/login';
    if (publicCms) return withRobots(NextResponse.next());

    const expected = await cmsToken();
    const got = request.cookies.get(CMS_COOKIE)?.value;
    if (!expected || got !== expected) {
      if (pathname.startsWith('/api/cms')) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
      const login = new URL('/admin/login', request.url);
      login.searchParams.set('next', pathname);
      return withRobots(NextResponse.redirect(login));
    }
    return withRobots(NextResponse.next());
  }

  if (!siteGateEnabled()) {
    return NextResponse.next();
  }

  if (pathname === '/access' || pathname === '/robots.txt') {
    return withRobots(NextResponse.next());
  }

  const expected = await siteGateToken();
  const got = request.cookies.get(SITE_GATE_COOKIE)?.value;
  if (expected && got === expected) {
    return withRobots(NextResponse.next());
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const login = new URL('/access', request.url);
  if (pathname !== '/') {
    login.searchParams.set('next', pathname);
  }
  return withRobots(NextResponse.redirect(login));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
