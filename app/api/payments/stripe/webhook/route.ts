import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { appendNotificationEntries, appendTrackingEntry, buildNotificationEntries } from '@/lib/fulfillment';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function readEnvValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  return '';
}

export async function POST(req: NextRequest) {
  const webhookSecret = readEnvValue(
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_SIGNING_SECRET'
  );

  try {
    const rawBody = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const signature = req.headers.get('stripe-signature') || '';
      const stripe = new Stripe(
        readEnvValue(
          'STRIPE_SECRET_KEY',
          'STRIPE_API_KEY',
          'STRIPE_SECRET',
          'STRIPE_TEST_SECRET_KEY',
          'STRIPE_LIVE_SECRET_KEY'
        ),
        {
        apiVersion: '2026-02-25.clover' as any,
        }
      );

      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true },
        });

        if (!order) {
          return NextResponse.json({ received: true });
        }

        await prisma.payment.updateMany({
          where: {
            provider: 'STRIPE',
            OR: [{ externalRef: session.id }, { orderId }],
          },
          data: {
            status: 'SUCCESS',
            providerResponseRaw: JSON.stringify(session),
          },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            trackingTimeline: appendTrackingEntry(
              order.trackingTimeline,
              'PAID',
              order.isCustomOrder
            ),
            notificationLog: appendNotificationEntries(
              order.notificationLog,
              buildNotificationEntries(
                {
                  orderNumber: order.orderNumber,
                  customerEmail: order.customerEmail,
                  customerPhone: order.customerPhone,
                  status: 'PAID',
                  isCustomOrder: order.isCustomOrder,
                },
                order.user
              )
            ),
          },
        });
      }
    }

    if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true },
        });

        if (!order) {
          return NextResponse.json({ received: true });
        }

        await prisma.payment.updateMany({
          where: {
            provider: 'STRIPE',
            OR: [{ externalRef: session.id }, { orderId }],
          },
          data: {
            status: 'FAILED',
            providerResponseRaw: JSON.stringify(session),
          },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'FAILED',
            trackingTimeline: appendTrackingEntry(
              order.trackingTimeline,
              'FAILED',
              order.isCustomOrder
            ),
            notificationLog: appendNotificationEntries(
              order.notificationLog,
              buildNotificationEntries(
                {
                  orderNumber: order.orderNumber,
                  customerEmail: order.customerEmail,
                  customerPhone: order.customerPhone,
                  status: 'FAILED',
                  isCustomOrder: order.isCustomOrder,
                },
                order.user
              )
            ),
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[stripe-webhook] error:', error);
    return NextResponse.json(
      { error: error?.message || 'Stripe webhook failed.' },
      { status: 500 }
    );
  }
}
