import { NextResponse } from 'next/server';
import { clearSessionCookie, deleteCurrentSession } from '@/lib/auth';

export async function POST() {
  await deleteCurrentSession();

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
