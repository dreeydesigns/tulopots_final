import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStripeCheckoutSession } from '@/lib/payments';
import { getRequestOrigin } from '@/lib/request';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { paymentOrderIdSchema } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';

export const runtime = 'nodejs';

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

    const { orderId } = parsed.data;

    if (!orderId) {
      return jsonError('orderId is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

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

    const response = NextResponse.json({
      ok: true,
      payment: {
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        checkoutUrl: payment.checkoutUrl,
      },
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    console.error('[stripe] error:', error);
    return jsonError(getSafeErrorMessage(error, 'Failed to initiate Stripe payment.'), 500);
  }
}
