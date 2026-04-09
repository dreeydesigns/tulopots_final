import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStripeCheckoutSession, PaymentProviderError } from '@/lib/payments';
import { readPaymentOrderSnapshot } from '@/lib/payment-snapshot';
import { getRequestOrigin } from '@/lib/request';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { paymentOrderIdSchema } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';
import { isSchemaCompatibilityError } from '@/lib/auth';

export const runtime = 'nodejs';

type StripePaymentResponse = {
  id: string | null;
  provider: 'STRIPE';
  status: 'INITIATED';
  checkoutUrl: string;
  persistenceDeferred?: boolean;
};

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/payments/stripe',
      limit: 8,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many payment attempts were started from this connection. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = paymentOrderIdSchema.safeParse(await req.json());

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/payments/stripe',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('orderId is required', 400);
    }

    const { orderId, paymentSnapshot } = parsed.data;

    if (!orderId) {
      return jsonError('orderId is required', 400);
    }

    const snapshot = readPaymentOrderSnapshot(paymentSnapshot);

    if (paymentSnapshot && !snapshot) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/payments/stripe',
        identifier: orderId,
        ip,
        metadata: {
          reason: 'invalid_payment_snapshot',
        },
      });
      return jsonError('The saved checkout session expired. Please try again.', 400);
    }

    if (snapshot && snapshot.orderId !== orderId) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/payments/stripe',
        identifier: orderId,
        ip,
        metadata: {
          reason: 'payment_snapshot_mismatch',
        },
      });
      return jsonError('The saved checkout session did not match this order.', 400);
    }

    let order:
      | {
          id: string;
          orderNumber: string;
          totalAmount: number;
          customerEmail: string;
          status: string;
        }
      | null = null;

    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          customerEmail: true,
          status: true,
        },
      });
    } catch (error) {
      const code =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: unknown }).code || '').toUpperCase()
          : '';
      const message = String((error as Error | null | undefined)?.message || '').toLowerCase();

      if (
        snapshot &&
        (isSchemaCompatibilityError(error) ||
          code === 'P1001' ||
          message.includes("can't reach database server") ||
          message.includes('server has closed the connection'))
      ) {
        order = {
          id: snapshot.orderId,
          orderNumber: snapshot.orderNumber,
          totalAmount: snapshot.totalAmount,
          customerEmail: snapshot.customerEmail,
          status: 'PENDING',
        };
      } else {
        throw error;
      }
    }

    if (!order && snapshot) {
      order = {
        id: snapshot.orderId,
        orderNumber: snapshot.orderNumber,
        totalAmount: snapshot.totalAmount,
        customerEmail: snapshot.customerEmail,
        status: 'PENDING',
      };
    }

    if (!order) {
      return jsonError('Order not found', 404);
    }

    if (order.status === 'PAID') {
      await recordSecurityEvent({
        type: 'PAYMENT_ANOMALY',
        severity: 'WARNING',
      route: '/api/payments/stripe',
      identifier: order.orderNumber,
      ip,
        metadata: {
          status: order.status,
          provider: 'STRIPE',
        },
      });
      return jsonError('This order has already been paid.', 409);
    }

    const session = await createStripeCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountKES: order.totalAmount,
      customerEmail: order.customerEmail,
      baseUrl: getRequestOrigin(req),
    });

    let paymentPayload: StripePaymentResponse = {
      id: null,
      provider: 'STRIPE',
      status: 'INITIATED',
      checkoutUrl: session.url,
      persistenceDeferred: true,
    };

    try {
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'STRIPE',
          status: 'INITIATED',
          amount: order.totalAmount,
          currency: 'KES',
          externalRef: session.id,
          checkoutUrl: session.url,
          providerResponseRaw: JSON.stringify(session.raw),
        },
      });

      paymentPayload = {
        id: payment.id,
        provider: 'STRIPE',
        status: 'INITIATED',
        checkoutUrl: payment.checkoutUrl || session.url,
      };
    } catch (paymentError: any) {
      console.error('[stripe] payment log fallback:', paymentError);
      await recordSecurityEvent({
        type: 'PAYMENT_ANOMALY',
        severity: 'WARNING',
        route: '/api/payments/stripe',
        identifier: order.orderNumber,
        ip,
        metadata: {
          phase: 'payment_log_create_failed',
          sessionId: session.id,
          message:
            paymentError instanceof Error
              ? paymentError.message.slice(0, 240)
              : 'unknown',
        },
      }).catch(() => undefined);
    }

    const response = NextResponse.json({
      ok: true,
      payment: paymentPayload,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    console.error('[stripe] error:', error);
    if (error instanceof PaymentProviderError) {
      return jsonError(error.message, error.status, {
        code: error.code,
        provider: error.provider,
      });
    }
    return jsonError(getSafeErrorMessage(error, 'Failed to initiate Stripe payment.'), 500, {
      code: 'STRIPE_UNKNOWN',
      provider: 'STRIPE',
    });
  }
}
