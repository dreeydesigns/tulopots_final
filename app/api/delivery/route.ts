import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      orderNumber?: string;
      email?: string;
      trackingCode?: string;
    };

    const orderNumber = String(body.orderNumber || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const trackingCode = String(body.trackingCode || '').trim();

    if ((!orderNumber || !email) && !trackingCode) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Provide the order number and customer email, or a tracking code.',
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: trackingCode
        ? { trackingCode }
        : {
            orderNumber,
            customerEmail: email,
          },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: 'We could not find a paid order with those details.' },
        { status: 404 }
      );
    }

    if (!['CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            order.status === 'PENDING'
              ? 'This order exists, but payment has not been confirmed yet. Return to the confirmation page and try again once payment succeeds.'
              : 'This order is not in an active delivery state yet.',
        },
        { status: 409 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        trackingCode: order.trackingCode,
        status: order.status,
        isCustomOrder: order.isCustomOrder,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        estimatedDispatchAt: order.estimatedDispatchAt?.toISOString() || null,
        estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() || null,
        trackingTimeline: order.trackingTimeline || [],
        notificationLog: order.notificationLog || [],
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          mode: item.mode,
          image: item.image,
        })),
      },
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to look up this order right now.',
      },
      { status: 500 }
    );
  }
}
