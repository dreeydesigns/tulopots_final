import type { NextRequest } from 'next/server';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function asHttpsUrl(hostname?: string | null) {
  const value = String(hostname || '').trim();
  return value ? `https://${value.replace(/^https?:\/\//, '')}` : null;
}

function parseOrigin(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return trimTrailingSlash(new URL(value).origin);
  } catch {
    return null;
  }
}

export function getSiteUrlFallback() {
  const vercelProductionUrl =
    asHttpsUrl(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ||
    asHttpsUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);

  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ||
      vercelProductionUrl ||
      'https://tulopots-final.vercel.app'
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

export function isSameOriginRequest(request: NextRequest) {
  const currentOrigin = getRequestOrigin(request);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL)
    : null;

  const origin = parseOrigin(request.headers.get('origin'));
  const referer = parseOrigin(request.headers.get('referer'));

  function isAllowed(value: string) {
    return value === currentOrigin || (siteUrl !== null && value === siteUrl);
  }

  if (origin) {
    return isAllowed(origin);
  }

  if (referer) {
    return isAllowed(referer);
  }

  return false;
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
