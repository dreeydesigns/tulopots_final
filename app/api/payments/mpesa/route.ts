import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateMpesaStkPush } from '@/lib/payments';
import { getRequestOrigin } from '@/lib/request';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { mpesaSchema } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/payments/mpesa',
      limit: 8,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many M-Pesa attempts were started from this connection. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = mpesaSchema.safeParse(await req.json());

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/payments/mpesa',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('orderId and a valid phone number are required', 400);
    }

    const { orderId, phone } = parsed.data;

    if (!orderId || !phone) {
      return jsonError('orderId and phone are required', 400);
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
        route: '/api/payments/mpesa',
        identifier: order.orderNumber,
        ip,
        metadata: {
          status: order.status,
          provider: 'MPESA',
        },
      });
      return jsonError('This order has already been paid.', 409);
    }

    const stk = await initiateMpesaStkPush({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      phone,
      baseUrl: getRequestOrigin(req),
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'MPESA',
        status: 'INITIATED',
        amount: order.totalAmount,
        currency: 'KES',
        externalRef: stk.requestId,
        providerRequestId: stk.requestId,
        providerResponseRaw: JSON.stringify(stk.response),
      },
    });

    const response = NextResponse.json({
      ok: true,
      mocked: stk.mocked,
      payment: {
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        requestId: payment.providerRequestId,
      },
      message: stk.mocked
        ? 'M-Pesa credentials are not loaded here, so a mock STK request was returned.'
        : 'M-Pesa STK push sent. Complete payment on your phone.',
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    console.error('[mpesa] error:', error);
    const message = error instanceof Error ? error.message : '';
    if (
      message.startsWith('M-Pesa is not configured.') ||
      message.startsWith('M-Pesa rejected the saved setup.') ||
      message.startsWith('Enter a valid M-Pesa number') ||
      message.startsWith('Failed to authenticate with the M-Pesa API.')
    ) {
      return jsonError(message, 500);
    }
    return jsonError(getSafeErrorMessage(error, 'Failed to initiate M-Pesa payment.'), 500);
  }
}
