import { NextRequest, NextResponse } from 'next/server';
import { completeOAuthFlow, type OAuthProvider } from '@/lib/oauth';
import { getRequestOrigin } from '@/lib/request';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ provider: string }>;
};

function isOAuthProvider(value: string): value is OAuthProvider {
  return value === 'google' || value === 'apple';
}

function invalidProviderRedirect(request: NextRequest) {
  const url = new URL('/', getRequestOrigin(request));
  url.searchParams.set('authError', 'provider_unavailable');
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return invalidProviderRedirect(request);
  }

  const url = request.nextUrl;
  return completeOAuthFlow({
    request,
    provider,
    code: url.searchParams.get('code'),
    state: url.searchParams.get('state'),
    providerError: url.searchParams.get('error'),
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return invalidProviderRedirect(request);
  }

  const form = await request.formData();
  const rawUser = String(form.get('user') || '').trim();
  const appleUserPayload = rawUser
    ? (JSON.parse(rawUser) as {
        email?: string;
        name?: { firstName?: string; lastName?: string };
      })
    : undefined;

  return completeOAuthFlow({
    request,
    provider,
    code: String(form.get('code') || ''),
    state: String(form.get('state') || ''),
    providerError: String(form.get('error') || ''),
    appleUserPayload,
  });
}
