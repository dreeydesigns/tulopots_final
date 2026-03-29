import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders
//
// Returns a list of recent orders.  Intended for internal use (e.g. the
// admin dashboard) to display order history.  We limit the number of
// returned orders to avoid long responses.  Each order includes its items
// and basic customer metadata.  If no orders exist, an empty array is
// returned.  Errors are surfaced via 500 responses with a generic message.

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { items: true },
    });

    return NextResponse.json({
      ok: true,
      count: orders.length,
      orders: orders.map((order) => ({
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
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          name: item.name,
          mode: item.mode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          image: item.image || undefined,
          sizeLabel: item.sizeLabel || undefined,
        })),
      })),
    });
  } catch (error: any) {
    console.error('[api/orders] error listing orders:', error);
    return NextResponse.json({ error: 'Could not fetch orders' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { ok: false, error: 'Use /api/checkout to create orders' },
    { status: 405 }
  );
}