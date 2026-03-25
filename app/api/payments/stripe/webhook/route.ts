// ─── Stripe Webhook Handler ────────────────────────────────────────────────────
// Stripe calls this when a payment is completed or fails.
// In Railway: add STRIPE_WEBHOOK_SECRET from your Stripe dashboard
// Stripe CLI (local test): stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    const rawBody = await req.text();

    if (webhookSecret) {
      // Verify Stripe signature to prevent spoofed callbacks
      const sig = req.headers.get('stripe-signature') || '';

      // Dynamically import stripe only when secret is present
      // (avoids build errors if stripe npm package isn't installed)
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2024-06-20' as any,
        });
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error('[stripe-webhook] signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // No secret — parse raw body directly (dev/sandbox mode)
      event = JSON.parse(rawBody);
    }

    console.log('[stripe-webhook] event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId: string = session.metadata?.orderId;

      if (orderId) {
        await prisma.payment.updateMany({
          where: { orderId, provider: 'STRIPE' },
          data: {
            status: 'SUCCESS',
            providerResponseRaw: JSON.stringify(session),
          },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });

        console.log('[stripe-webhook] order PAID:', orderId);
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId: string = session.metadata?.orderId;

      if (orderId) {
        await prisma.payment.updateMany({
          where: { orderId, provider: 'STRIPE' },
          data: { status: 'FAILED' },
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
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
