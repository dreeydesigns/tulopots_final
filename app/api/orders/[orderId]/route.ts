import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const responseOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      currency: order.currency,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingCity: order.shippingCity || undefined,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        productSlug: item.productSlug,
        name: item.name,
        mode: item.mode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        image: item.image || undefined,
        sizeLabel: item.sizeLabel || undefined,
      })),
    };

    return NextResponse.json({
      ok: true,
      order: responseOrder,
    });
  } catch (error) {
    console.error('[api/orders/[orderId]] error fetching order:', error);

    return NextResponse.json(
      { error: 'Could not fetch order' },
      { status: 500 }
    );
  }
}
