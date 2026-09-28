import { NextResponse } from 'next/server';
import { sendVehicleRequest } from '@/lib/email/sendVehicleRequest';

const MAX = {
  name: 120,
  email: 200,
  brand: 80,
  model: 120,
  year: 40,
  notes: 4000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  name?: unknown;
  email?: unknown;
  brand?: unknown;
  model?: unknown;
  year?: unknown;
  notes?: unknown;
  company?: unknown;
};

function read(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields; ignore the submission.
  if (read(body.company, 80)) {
    return NextResponse.json({ ok: true });
  }

  const payload = {
    name: read(body.name, MAX.name),
    email: read(body.email, MAX.email),
    brand: read(body.brand, MAX.brand),
    model: read(body.model, MAX.model),
    year: read(body.year, MAX.year),
    notes: read(body.notes, MAX.notes),
  };

  if (!payload.name || !payload.email || !payload.brand || !payload.model || !payload.year) {
    return NextResponse.json(
      { ok: false, error: 'Please fill in all required fields.' },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(payload.email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 });
  }

  try {
    const result = await sendVehicleRequest(payload);
    return NextResponse.json({ ok: true, inbox: result.inbox });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send the request.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
