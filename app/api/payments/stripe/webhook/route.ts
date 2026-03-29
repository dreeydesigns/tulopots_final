import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const rawBody = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const signature = req.headers.get('stripe-signature') || '';
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-02-25.clover' as any,
      });

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
          data: { status: 'PAID' },
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
          data: { status: 'FAILED' },
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
