import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStripeCheckoutSession } from '@/lib/payments';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = (await req.json()) as { orderId: string };

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // FIX: pass amountKES — the lib converts to USD cents internally
    const session = await createStripeCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountKES: order.totalAmount,      // KES shillings stored in DB
      customerEmail: order.customerEmail,
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'STRIPE',
        status: 'INITIATED',
        amount: order.totalAmount,
        currency: 'KES',                  // display currency stays KES
        externalRef: session.id,
        checkoutUrl: session.url,
        providerResponseRaw: JSON.stringify(session.raw),
      },
    });

    return NextResponse.json({
      ok: true,
      payment: {
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        checkoutUrl: payment.checkoutUrl,
      },
    });
  } catch (error: any) {
    console.error('[stripe] error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initiate Stripe payment' },
      { status: 500 }
    );
  }
}
