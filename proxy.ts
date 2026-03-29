import { NextResponse, type NextRequest } from 'next/server';
import { isSameOriginRequest } from '@/lib/request';

const EXEMPT_MUTATION_PREFIXES = [
  '/api/payments/stripe/webhook',
  '/api/payments/mpesa/callback',
  '/api/auth/oauth/callback',
];

function isMutation(method: string) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function isExemptPath(pathname: string) {
  return EXEMPT_MUTATION_PREFIXES.some(
    (value) => pathname === value || pathname.startsWith(value)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/') || !isMutation(request.method)) {
    return NextResponse.next();
  }

  if (isExemptPath(pathname)) {
    return NextResponse.next();
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Cross-origin request blocked.',
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
