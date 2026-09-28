import { NextResponse } from 'next/server';
import { readFile, writeFile, rename } from 'fs/promises';
import path from 'path';

const CLIENT_ID_KEY = 'SHOPIFY_CLIENT_ID';
const CLIENT_SECRET_KEY = 'SHOPIFY_CLIENT_SECRET';
const DOMAIN_KEY = 'SHOPIFY_STORE_DOMAIN';
// 兼容旧的：早期如果有用户设置了显式 access token，依然能读写
const TOKEN_KEY = 'SHOPIFY_ADMIN_ACCESS_TOKEN';

function envPath() {
  return path.join(process.cwd(), '.env.local');
}

async function readEnvFile(): Promise<string> {
  try {
    return await readFile(envPath(), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw error;
  }
}

function upsertKey(contents: string, key: string, value: string): string {
  const lines = contents.split(/\r?\n/);
  const re = new RegExp(`^${key}=`);
  const idx = lines.findIndex((line) => re.test(line));
  const entry = `${key}=${value}`;
  if (idx >= 0) {
    lines[idx] = entry;
  } else {
    while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    lines.push(entry);
    lines.push('');
  }
  return lines.join('\n');
}

function stripKey(contents: string, key: string): string {
  const lines = contents.split(/\r?\n/);
  const re = new RegExp(`^${key}=`);
  const next = lines.filter((line) => !re.test(line));
  return next.join('\n');
}

function mask(value: string): string {
  if (!value) return '';
  if (value.length <= 10) return `${value.slice(0, 2)}…${value.slice(-2)} (len ${value.length})`;
  return `${value.slice(0, 6)}…${value.slice(-4)} (len ${value.length})`;
}

function readValue(contents: string, key: string): string {
  const match = contents.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1] : '';
}

export async function GET() {
  const contents = await readEnvFile();
  const clientId = readValue(contents, CLIENT_ID_KEY);
  const clientSecret = readValue(contents, CLIENT_SECRET_KEY);
  const domain = readValue(contents, DOMAIN_KEY);
  const legacyToken = readValue(contents, TOKEN_KEY);
  return NextResponse.json({
    ok: true,
    data: {
      mode: legacyToken ? ('explicit' as const) : ('client_credentials' as const),
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      hasLegacyToken: Boolean(legacyToken),
      maskedClientId: clientId ? mask(clientId) : '',
      maskedClientSecret: clientSecret ? mask(clientSecret) : '',
      maskedLegacyToken: legacyToken ? mask(legacyToken) : '',
      domain,
    },
  });
}

export async function PUT(request: Request) {
  let body: {
    clientId?: string;
    clientSecret?: string;
    domain?: string;
    clear?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const clientId = (body.clientId ?? '').trim();
  const clientSecret = (body.clientSecret ?? '').trim();
  const domain = (body.domain ?? '').trim();

  if (!body.clear && !clientId && !clientSecret && !domain) {
    return NextResponse.json(
      { ok: false, error: '至少填一项（Client ID / Client Secret / 域名）' },
      { status: 400 },
    );
  }

  // 校验 Client ID / Secret 形状：
  // Client ID 是 32 位 hex；Client Secret 以 shpss_ 开头
  if (clientId && !/^[0-9a-f]{32}$/i.test(clientId)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Client ID 看起来不对。应该是 32 位 hex 字符串（截图里那串）。',
      },
      { status: 400 },
    );
  }
  if (clientSecret && !/^shpss_[A-Za-z0-9]{16,}$/.test(clientSecret)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Client Secret 看起来不对。应该以 shpss_ 开头，后面跟一长串字符。',
      },
      { status: 400 },
    );
  }

  try {
    let current = await readEnvFile();
    if (body.clear) {
      current = stripKey(current, CLIENT_ID_KEY);
      current = stripKey(current, CLIENT_SECRET_KEY);
    } else {
      if (clientId) current = upsertKey(current, CLIENT_ID_KEY, clientId);
      if (clientSecret) current = upsertKey(current, CLIENT_SECRET_KEY, clientSecret);
    }
    if (domain) current = upsertKey(current, DOMAIN_KEY, domain);

    const target = envPath();
    const tmp = `${target}.tmp`;
    await writeFile(tmp, current, 'utf8');
    await rename(tmp, target);

    return NextResponse.json({
      ok: true,
      data: {
        saved: true,
        note:
          '已写入 .env.local。Client Credentials 模式下，每次启动 dev server 会自动用 Client ID + Secret 换取 24h 有效的 access token，无需手动续期。**重启 dev server** 让新凭据生效。',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '写入失败';
    const hint =
      msg.includes('EROFS') || msg.includes('read-only') || msg.includes('ENOSYS')
        ? '当前环境无法写本地 .env.local（典型情况：部署在 Vercel 等 serverless 平台）。请在本地项目里手动编辑 .env.local。'
        : msg;
    return NextResponse.json({ ok: false, error: hint }, { status: 500 });
  }
}