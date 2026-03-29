import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This API endpoint returns details about a single order including its items.  It
// is used by the order confirmation page to display a summary of what the
// customer purchased and the current status of the order.  Without this
// endpoint the order confirmation page cannot fetch the order and will always
// show an error.  We include the necessary fields expected by the frontend
// and map Prisma's `Order` and `OrderItem` fields into the shape defined
// in `app/order-confirmation/page.tsx`.

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
): Promise<NextResponse> {
  const { orderId } = params;

  // If no orderId was provided in the URL, return a 400.  This check is
  // defensive: the router should not call this file without a param but it
  // avoids misusing the endpoint.
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    // Fetch the order by its primary key.  We include the related items so
    // that we can map them into the response.  Payments are not included
    // because the confirmation page only needs the order status, which is
    // stored directly on the order record.
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Assemble the response object expected by the frontend.  We expose only
    // the fields that the order confirmation page uses.  Additional fields
    // (like payment or shipping notes) can be added here later if needed.
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
        name: item.name,
        mode: item.mode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        image: item.image || undefined,
        sizeLabel: item.sizeLabel || undefined,
      })),
    };

    return NextResponse.json({ ok: true, order: responseOrder });
  } catch (error: any) {
    console.error('[api/orders] error fetching order:', error);
    return NextResponse.json({ error: 'Could not fetch order' }, { status: 500 });
  }
}