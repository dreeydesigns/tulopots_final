import type { NextRequest } from 'next/server';
import { recordSecurityEvent } from '@/lib/security/audit';

type RateLimitOptions = {
  key: string;
  route: string;
  limit: number;
  windowMs: number;
  userId?: string | null;
  identifier?: string | null;
  ip?: string | null;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const buckets = new Map<string, { count: number; expiresAt: number }>();

export function getRequestIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function enforceRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const bucketKey = `${options.route}:${options.key}`;
  const current = buckets.get(bucketKey);

  if (!current || current.expiresAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      expiresAt: now + options.windowMs,
    });
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  current.count += 1;
  buckets.set(bucketKey, current);

  if (current.count <= options.limit) {
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil((current.expiresAt - now) / 1000),
    };
  }

  await recordSecurityEvent({
    type: 'RATE_LIMIT_HIT',
    severity: 'WARNING',
    route: options.route,
    userId: options.userId || null,
    identifier: options.identifier || null,
    ip: options.ip || null,
    metadata: {
      key: options.key,
      count: current.count,
      limit: options.limit,
      windowMs: options.windowMs,
    },
  }).catch(() => undefined);

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
  };
}
