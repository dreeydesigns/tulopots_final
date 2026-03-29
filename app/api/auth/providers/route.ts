import { NextResponse } from 'next/server';
import { getAuthProviderStatus } from '@/lib/oauth';

export async function GET() {
  return NextResponse.json({
    ok: true,
    providers: getAuthProviderStatus(),
  });
}
