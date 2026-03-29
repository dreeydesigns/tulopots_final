import type { NextRequest } from 'next/server';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getSiteUrlFallback() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://tulopots.com'
  );
}

export function getRequestOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol =
    forwardedProto ||
    request.nextUrl.protocol.replace(':', '') ||
    'https';
  const host = forwardedHost || request.nextUrl.host;

  return trimTrailingSlash(`${protocol}://${host}`);
}

export function resolveBaseUrl(value?: string | null) {
  if (!value) {
    return getSiteUrlFallback();
  }

  return trimTrailingSlash(value);
}

export function getSafeReturnPath(value?: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/';
  }

  if (value.startsWith('//')) {
    return '/';
  }

  return value;
}
