import { NextResponse } from 'next/server';
import { CMS_COOKIE } from '@/lib/cms/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CMS_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
