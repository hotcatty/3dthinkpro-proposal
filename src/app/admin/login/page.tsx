import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CMS_COOKIE, cmsToken, passwordOk } from '@/lib/cms/auth';
import LoginForm from './LoginForm';

function safeNext(value: FormDataEntryValue | string | null) {
  const next = String(value ?? '/admin');
  return next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
}

async function loginAction(formData: FormData) {
  'use server';
  if (!passwordOk(String(formData.get('password') ?? ''))) {
    redirect('/admin/login?error=1');
  }

  const store = await cookies();
  store.set(CMS_COOKIE, await cmsToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect(safeNext(formData.get('next')));
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <LoginForm error={params.error === '1'} next={safeNext(params.next ?? '/admin')} action={loginAction} />
  );
}
