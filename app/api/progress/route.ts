import { NextResponse } from 'next/server';
import { readProgress } from '@/lib/progress';

export async function GET() {
  const payload = await readProgress();

  return NextResponse.json(payload, {
    headers: {
      'cache-control': 'no-store, max-age=0',
    },
  });
}
