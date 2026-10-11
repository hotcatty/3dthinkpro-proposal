import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SITE_GATE_COOKIE,
  siteGateEnabled,
  siteGatePasswordOk,
  siteGateToken,
} from '@/lib/siteGate';

function safeNext(value: FormDataEntryValue | string | null) {
  const next = String(value ?? '/');
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

async function enterAction(formData: FormData) {
  'use server';
  if (!siteGatePasswordOk(String(formData.get('password') ?? ''))) {
    const next = safeNext(formData.get('next'));
    redirect(next === '/' ? '/access?error=1' : `/access?error=1&next=${encodeURIComponent(next)}`);
  }

  const store = await cookies();
  store.set(SITE_GATE_COOKIE, await siteGateToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.VERCEL === '1',
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(safeNext(formData.get('next')));
}

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (!siteGateEnabled()) {
    redirect('/');
  }

  const params = await searchParams;
  const next = safeNext(params.next ?? '/');
  const expected = await siteGateToken();
  const got = (await cookies()).get(SITE_GATE_COOKIE)?.value;
  if (expected && got === expected) {
    redirect(next);
  }

  return (
    <main className="site-access">
      <form className="site-access-card" action={enterAction}>
        <input type="hidden" name="next" value={next} />
        <p className="site-access-brand">3DThinkPro</p>
        <h1 className="site-access-title">Coming Soon</h1>
        <p className="site-access-copy">
          This website is still under construction. We expect to launch on October 30.
        </p>
        <p className="site-access-copy">
          3DThinkPro makes HIVE lattice motorcycle seats — a complete seat, not a cover. Each
          seat is precision-printed to fit a specific bike.
        </p>
        <label className="site-access-label" htmlFor="site-access-password">
          PASSWORD
        </label>
        <input
          id="site-access-password"
          className="site-access-input"
          type="password"
          name="password"
          placeholder="Enter the preview password"
          autoFocus
          required
        />
        <button className="btn btn-solid site-access-submit" type="submit">
          Enter
        </button>
        {params.error === '1' ? <p className="site-access-error">The password is incorrect.</p> : null}
      </form>
    </main>
  );
}
