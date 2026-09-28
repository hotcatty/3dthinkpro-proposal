import { NextResponse } from 'next/server';
import { getReviews, saveReviews } from '@/lib/cms/reviews';
import type { ReviewsContent } from '@/lib/cms/types';

export async function GET() {
  try {
    const data = await getReviews();
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
    const body = (await request.json()) as ReviewsContent;
    const data = await saveReviews(body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : '保存失败。Vercel 上不能写本地文件，请在本地改完再部署。',
      },
      { status: 500 },
    );
  }
}
