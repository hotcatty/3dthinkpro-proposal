export type VehicleRequestPayload = {
  name: string;
  email: string;
  brand: string;
  model: string;
  year: string;
  notes: string;
};

export const VEHICLE_REQUEST_INBOX =
  process.env.CONTACT_INBOX?.trim() || 'sales1@3dthinkpro.com';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderBodies(data: VehicleRequestPayload) {
  const lines = [
    'New vehicle request from the storefront.',
    '',
    `Full Name: ${data.name}`,
    `Email: ${data.email}`,
    `Brand: ${data.brand}`,
    `Model: ${data.model}`,
    `Year: ${data.year}`,
    `Optional notes: ${data.notes || '(none)'}`,
  ];
  const text = lines.join('\n');
  const html = `
    <p>New vehicle request from the storefront.</p>
    <table>
      <tr><td>Full Name</td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td>Email</td><td>${escapeHtml(data.email)}</td></tr>
      <tr><td>Brand</td><td>${escapeHtml(data.brand)}</td></tr>
      <tr><td>Model</td><td>${escapeHtml(data.model)}</td></tr>
      <tr><td>Year</td><td>${escapeHtml(data.year)}</td></tr>
      <tr><td>Optional notes</td><td>${escapeHtml(data.notes || '(none)')}</td></tr>
    </table>
  `;
  return {
    subject: `Vehicle request: ${data.brand} ${data.model} ${data.year}`,
    text,
    html,
  };
}

async function sendWithResend(subject: string, text: string, html: string, replyTo: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    '3DThinkPro <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [VEHICLE_REQUEST_INBOX],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Resend failed (${response.status})`);
  }
  return true;
}

async function sendWithSmtp(subject: string, text: string, html: string, replyTo: string) {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return false;

  const nodemailer = await import('nodemailer');
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user || VEHICLE_REQUEST_INBOX;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to: VEHICLE_REQUEST_INBOX,
    replyTo,
    subject,
    text,
    html,
  });
  return true;
}

export async function sendVehicleRequest(data: VehicleRequestPayload) {
  const { subject, text, html } = renderBodies(data);

  if (process.env.RESEND_API_KEY?.trim()) {
    await sendWithResend(subject, text, html, data.email);
    return { inbox: VEHICLE_REQUEST_INBOX };
  }

  if (process.env.SMTP_HOST?.trim()) {
    await sendWithSmtp(subject, text, html, data.email);
    return { inbox: VEHICLE_REQUEST_INBOX };
  }

  throw new Error(
    'Email is not configured. Set RESEND_API_KEY or SMTP_HOST in .env.local.',
  );
}
