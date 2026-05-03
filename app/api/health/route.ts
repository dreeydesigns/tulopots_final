import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let db: 'ok' | 'error' = 'error';
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'ok';
  } catch (err: any) {
    dbError = err?.message?.includes('Can\'t reach database')
      ? 'DB_UNREACHABLE'
      : err?.code || 'DB_ERROR';
  }

  return NextResponse.json(
    { ok: db === 'ok', db, dbError },
    { status: db === 'ok' ? 200 : 503 }
  );
}
