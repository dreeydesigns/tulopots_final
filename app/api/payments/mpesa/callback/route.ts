// ─── M-Pesa STK Callback Handler ──────────────────────────────────────────────
// Safaricom calls this URL after the customer completes (or cancels) payment.
// Set MPESA_CALLBACK_URL=https://YOUR_DOMAIN/api/payments/mpesa/callback
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { appendNotificationEntries, appendTrackingEntry, buildNotificationEntries } from '@/lib/fulfillment';
import { prisma } from '@/lib/prisma';

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
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      // Not found — log but return 200 so Safaricom doesn't retry
      console.warn('[mpesa-callback] payment not found for requestId:', requestId);
      return NextResponse.json({ ok: true });
    }

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
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          trackingTimeline: appendTrackingEntry(
            payment.order.trackingTimeline,
            'PAID',
            payment.order.isCustomOrder
          ),
          notificationLog: appendNotificationEntries(
            payment.order.notificationLog,
            buildNotificationEntries(
              {
                orderNumber: payment.order.orderNumber,
                customerEmail: payment.order.customerEmail,
                customerPhone: payment.order.customerPhone,
                status: 'PAID',
                isCustomOrder: payment.order.isCustomOrder,
              },
              payment.order.user
            )
          ),
        },
      });

      console.log('[mpesa-callback] payment SUCCESS for order:', payment.order.orderNumber);
    } else {
      // ── Payment failed / cancelled ──────────────────────────────────────
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          providerResponseRaw: JSON.stringify(body),
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'FAILED',
          trackingTimeline: appendTrackingEntry(
            payment.order.trackingTimeline,
            'FAILED',
            payment.order.isCustomOrder
          ),
          notificationLog: appendNotificationEntries(
            payment.order.notificationLog,
            buildNotificationEntries(
              {
                orderNumber: payment.order.orderNumber,
                customerEmail: payment.order.customerEmail,
                customerPhone: payment.order.customerPhone,
                status: 'FAILED',
                isCustomOrder: payment.order.isCustomOrder,
              },
              payment.order.user
            )
          ),
        },
      });

      console.log('[mpesa-callback] payment FAILED:', resultDesc);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[mpesa-callback] error:', error);
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}
