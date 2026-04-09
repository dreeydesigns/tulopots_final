import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateMpesaStkPush, PaymentProviderError } from '@/lib/payments';
import { readPaymentOrderSnapshot } from '@/lib/payment-snapshot';
import { getRequestOrigin } from '@/lib/request';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { mpesaSchema } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';
import { isSchemaCompatibilityError } from '@/lib/auth';

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

    const { orderId, phone, paymentSnapshot } = parsed.data;

    if (!orderId || !phone) {
      return jsonError('orderId and phone are required', 400);
    }

    const snapshot = readPaymentOrderSnapshot(paymentSnapshot);

    if (paymentSnapshot && !snapshot) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/payments/mpesa',
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
        route: '/api/payments/mpesa',
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
    if (error instanceof PaymentProviderError) {
      return jsonError(error.message, error.status, {
        code: error.code,
        provider: error.provider,
      });
    }
    return jsonError(getSafeErrorMessage(error, 'Failed to initiate M-Pesa payment.'), 500, {
      code: 'MPESA_UNKNOWN',
      provider: 'MPESA',
    });
  }
}
