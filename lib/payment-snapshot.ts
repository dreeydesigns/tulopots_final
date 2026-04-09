import { createHmac, timingSafeEqual } from 'node:crypto';

export type PaymentOrderSnapshot = {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  customerEmail: string;
  issuedAt: string;
};

const PAYMENT_SNAPSHOT_MAX_AGE_MS = 1000 * 60 * 60 * 6;

function getPaymentSnapshotSecret() {
  return (
    process.env.PAYMENT_SNAPSHOT_SECRET ||
    process.env.OPERATIONS_AUTOMATION_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    ''
  );
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function createSignature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function createPaymentOrderSnapshot(
  input: Omit<PaymentOrderSnapshot, 'issuedAt'>
) {
  const secret = getPaymentSnapshotSecret();

  if (!secret) {
    return null;
  }

  const payload = JSON.stringify({
    ...input,
    issuedAt: new Date().toISOString(),
  } satisfies PaymentOrderSnapshot);
  const encodedPayload = toBase64Url(payload);
  const signature = createSignature(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function readPaymentOrderSnapshot(
  token?: string | null
): PaymentOrderSnapshot | null {
  const secret = getPaymentSnapshotSecret();

  if (!secret || !token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = createSignature(encodedPayload, secret);

  try {
    if (
      !timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as PaymentOrderSnapshot;
    const issuedAt = new Date(payload.issuedAt).getTime();

    if (
      !payload.orderId ||
      !payload.orderNumber ||
      !payload.customerEmail ||
      !Number.isFinite(payload.totalAmount) ||
      !issuedAt ||
      Date.now() - issuedAt > PAYMENT_SNAPSHOT_MAX_AGE_MS
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
