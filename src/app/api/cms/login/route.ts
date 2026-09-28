import { NextResponse } from 'next/server';
import { CMS_COOKIE, cmsToken, passwordOk } from '@/lib/cms/auth';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!passwordOk(body?.password ?? '')) {
    return NextResponse.json({ ok: false, error: '密码不对' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CMS_COOKIE, await cmsToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
