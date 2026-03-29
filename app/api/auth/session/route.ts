import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  const response = NextResponse.json({
    ok: true,
    user,
    isLoggedIn: !!user,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
