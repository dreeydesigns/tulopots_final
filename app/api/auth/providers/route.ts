import { NextResponse } from 'next/server';
import { getAuthProviderStatus } from '@/lib/oauth';

export async function GET() {
  const response = NextResponse.json({
    ok: true,
    providers: getAuthProviderStatus(),
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
