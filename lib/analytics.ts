import { Prisma } from '@prisma/client';

export const ALLOWED_ANALYTICS_EVENTS = new Set([
  'page_view',
  'add_to_cart',
  'begin_checkout',
  'purchase',
  'product_share',
  'review_submit',
  'sign_in',
  'sign_up',
  'consent_update',
]);

const BLOCKED_KEY_PATTERNS = [
  /email/i,
  /phone/i,
  /password/i,
  /card/i,
  /pan/i,
  /cvc/i,
  /cvv/i,
  /secret/i,
  /token/i,
  /address/i,
  /message/i,
  /note/i,
];

function isBlockedKey(key: string) {
  return BLOCKED_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function sanitizeString(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 180);
}

function sanitizeValue(
  value: unknown,
  depth = 0
): Prisma.InputJsonValue | undefined {
  if (depth > 3 || value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return typeof value === 'string' ? sanitizeString(value) : value;
  }

  if (Array.isArray(value)) {
    const items = value
      .slice(0, 12)
      .map((entry) => sanitizeValue(entry, depth + 1))
      .filter((entry) => entry !== undefined);

    return items as Prisma.InputJsonArray;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !isBlockedKey(key))
      .slice(0, 16)
      .map(([key, entry]) => [key, sanitizeValue(entry, depth + 1)] as const)
      .filter(([, entry]) => entry !== undefined);

    return Object.fromEntries(entries) as Prisma.InputJsonObject;
  }

  return undefined;
}

export function sanitizeAnalyticsPayload(payload: unknown) {
  const sanitized = sanitizeValue(payload);

  if (
    !sanitized ||
    typeof sanitized !== 'object' ||
    Array.isArray(sanitized)
  ) {
    return undefined;
  }

  return sanitized as Prisma.InputJsonObject;
}

export function sanitizeAnalyticsText(value?: string | null, fallback = '') {
  const next = sanitizeString(String(value || ''));
  return next || fallback;
}
