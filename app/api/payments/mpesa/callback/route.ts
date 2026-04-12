// ─── M-Pesa STK Callback Handler ──────────────────────────────────────────────
// Safaricom calls this URL after the customer completes (or cancels) payment.
// Set MPESA_CALLBACK_URL=https://YOUR_DOMAIN/api/payments/mpesa/callback
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { isSchemaCompatibilityError } from '@/lib/auth';
import { appendNotificationEntries, appendTrackingEntry, buildNotificationEntries } from '@/lib/fulfillment';
import { prisma } from '@/lib/prisma';

const paymentCallbackOrderSelect = {
  id: true,
  orderNumber: true,
  trackingTimeline: true,
  notificationLog: true,
  isCustomOrder: true,
  customerEmail: true,
  customerPhone: true,
} satisfies Prisma.OrderSelect;

const compatibilityPaymentCallbackOrderSelect = {
  id: true,
  orderNumber: true,
  customerEmail: true,
  customerPhone: true,
} satisfies Prisma.OrderSelect;

async function findPaymentCallbackOrder(id: string) {
  try {
    return await prisma.order.findUnique({
      where: { id },
      select: paymentCallbackOrderSelect,
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    return prisma.order.findUnique({
      where: { id },
      select: compatibilityPaymentCallbackOrderSelect,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[mpesa-callback] received:', JSON.stringify(body));

    const stk = body?.Body?.stkCallback;
    if (!stk) {
      return NextResponse.json({ ok: false, error: 'Invalid callback body' }, { status: 400 });
    }

    const requestId: string = stk.CheckoutRequestID || '';
    const resultCode: number = stk.ResultCode;
    const resultDesc: string = stk.ResultDesc || '';

    // Find the payment record by requestId
    const payment = await prisma.payment.findFirst({
      where: { providerRequestId: requestId },
      select: {
        id: true,
        orderId: true,
        externalRef: true,
      },
    });

    if (!payment) {
      // Not found — log but return 200 so Safaricom doesn't retry
      console.warn('[mpesa-callback] payment not found for requestId:', requestId);
      return NextResponse.json({ ok: true });
    }

    const order = await findPaymentCallbackOrder(payment.orderId);

    if (!order) {
      console.warn('[mpesa-callback] order not found for payment:', payment.id);
      return NextResponse.json({ ok: true });
    }

    const isCustomOrder =
      'isCustomOrder' in order ? Boolean(order.isCustomOrder) : false;
    const trackingTimeline =
      'trackingTimeline' in order
        ? (order.trackingTimeline as Prisma.JsonValue | undefined)
        : undefined;
    const notificationLog =
      'notificationLog' in order
        ? (order.notificationLog as Prisma.JsonValue | undefined)
        : undefined;
    const wasCancelled = resultCode === 1032 || /cancel/i.test(resultDesc);

    if (resultCode === 0) {
      // ── Payment successful ──────────────────────────────────────────────
      const items = stk.CallbackMetadata?.Item as Array<{ Name: string; Value: any }> | undefined;
      const get = (name: string) => items?.find((i) => i.Name === name)?.Value;

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          providerResponseRaw: JSON.stringify(body),
          externalRef: String(get('MpesaReceiptNumber') || payment.externalRef),
        },
        select: { id: true },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          trackingTimeline: appendTrackingEntry(
            trackingTimeline,
            'PAID',
            isCustomOrder
          ),
          notificationLog: appendNotificationEntries(
            notificationLog,
            buildNotificationEntries(
              {
                orderNumber: order.orderNumber,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                status: 'PAID',
                isCustomOrder,
              }
            )
          ),
        },
        select: { id: true },
      });

      console.log('[mpesa-callback] payment SUCCESS for order:', order.orderNumber);
    } else {
      // ── Payment failed / cancelled ──────────────────────────────────────
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          providerResponseRaw: JSON.stringify(body),
        },
        select: { id: true },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: wasCancelled ? 'CANCELLED' : 'FAILED',
          trackingTimeline: appendTrackingEntry(
            trackingTimeline,
            wasCancelled ? 'CANCELLED' : 'FAILED',
            isCustomOrder
          ),
          notificationLog: appendNotificationEntries(
            notificationLog,
            buildNotificationEntries(
              {
                orderNumber: order.orderNumber,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                status: wasCancelled ? 'CANCELLED' : 'FAILED',
                isCustomOrder,
              }
            )
          ),
        },
        select: { id: true },
      });

      console.log(
        `[mpesa-callback] payment ${wasCancelled ? 'CANCELLED' : 'FAILED'}:`,
        resultDesc
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[mpesa-callback] error:', error);
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}
