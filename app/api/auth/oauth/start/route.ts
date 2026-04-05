import { NextRequest, NextResponse } from 'next/server';
import { startOAuthFlow, type OAuthProvider } from '@/lib/oauth';

export const runtime = 'nodejs';

function isOAuthProvider(value: string): value is OAuthProvider {
  return value === 'google' || value === 'apple';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      provider?: string;
      returnTo?: string;
    };
    const provider = String(body.provider || '').trim().toLowerCase();

    if (!isOAuthProvider(provider)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported sign-in provider.' },
        { status: 400 }
      );
    }

    return startOAuthFlow(request, provider, body.returnTo);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to start social sign-in right now.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const provider = String(
      request.nextUrl.searchParams.get('provider') || ''
    )
      .trim()
      .toLowerCase();
    const returnTo = request.nextUrl.searchParams.get('returnTo') || undefined;

    if (!isOAuthProvider(provider)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported sign-in provider.' },
        { status: 400 }
      );
    }

    return startOAuthFlow(request, provider, returnTo, 'redirect');
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to start social sign-in right now.',
      },
      { status: 500 }
    );
  }
}
