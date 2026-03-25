import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateMpesaStkPush } from '@/lib/payments';

export async function POST(req: NextRequest) {
  try {
    const { orderId, phone } = (await req.json()) as {
      orderId: string;
      phone: string;
    };

    if (!orderId || !phone) {
      return NextResponse.json(
        { error: 'orderId and phone are required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const stk = await initiateMpesaStkPush({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      phone,
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

    return NextResponse.json({
      ok: true,
      mocked: stk.mocked,
      payment: {
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        requestId: payment.providerRequestId,
      },
      message: stk.mocked
        ? 'M-Pesa mock initiated (add MPESA_* env vars in Railway for live payments).'
        : 'M-Pesa STK push sent. Complete payment on your phone.',
    });
  } catch (error: any) {
    console.error('[mpesa] error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initiate M-Pesa payment' },
      { status: 500 }
    );
  }
}
