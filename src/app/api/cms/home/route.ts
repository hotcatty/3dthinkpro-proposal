import { NextResponse } from 'next/server';
import { getHomeContent, saveHomeContent } from '@/lib/cms/store';
import type { HomeContent } from '@/lib/cms/types';

export async function GET() {
  try {
    const data = await getHomeContent();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : '读取失败' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as HomeContent;
    const data = await saveHomeContent(body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : '保存失败。Vercel 上不能写本地文件，请在本地改完再部署。' },
      { status: 500 },
    );
  }
}
