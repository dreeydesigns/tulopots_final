import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

function toCsvCell(value: unknown) {
  const normalized = String(value ?? '').replace(/"/g, '""');
  return `"${normalized}"`;
}

export async function GET(request: NextRequest) {
  const adminUser = await requireAdminUser('orders.read');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get('format');
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    take: 500,
  });

  if (format === 'csv') {
    const headers = [
      'orderNumber',
      'status',
      'paymentMethod',
      'paymentStatus',
      'trackingCode',
      'isCustomOrder',
      'customerName',
      'customerEmail',
      'customerPhone',
      'shippingCity',
      'subtotal',
      'deliveryFee',
      'totalAmount',
      'currency',
      'items',
      'attributionSource',
      'attributionMedium',
      'attributionCampaign',
      'landingPath',
      'gclid',
      'fbclid',
      'estimatedDispatchAt',
      'estimatedDeliveryAt',
      'createdAt',
    ];

    const csv = [
      headers.join(','),
      ...orders.map((order) =>
        [
          order.orderNumber,
          order.status,
          order.paymentMethod,
          order.payments[0]?.status || '',
          order.trackingCode,
          order.isCustomOrder ? 'yes' : 'no',
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.shippingCity || '',
          order.subtotal,
          order.deliveryFee,
          order.totalAmount,
          order.currency,
          order.items
            .map((item) => `${item.name} x${item.quantity} (${item.mode})`)
            .join(' | '),
          order.attributionSource || '',
          order.attributionMedium || '',
          order.attributionCampaign || '',
          order.landingPath || '',
          order.gclid || '',
          order.fbclid || '',
          order.estimatedDispatchAt?.toISOString() || '',
          order.estimatedDeliveryAt?.toISOString() || '',
          order.createdAt.toISOString(),
        ]
          .map(toCsvCell)
          .join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="tulopots-orders.csv"',
        'cache-control': 'no-store',
      },
    });
  }

  const response = NextResponse.json({
    ok: true,
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payments[0]?.status || null,
      trackingCode: order.trackingCode,
      isCustomOrder: order.isCustomOrder,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingCity: order.shippingCity,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      totalAmount: order.totalAmount,
      currency: order.currency,
      estimatedDispatchAt: order.estimatedDispatchAt?.toISOString() || null,
      estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      attribution: {
        source: order.attributionSource,
        medium: order.attributionMedium,
        campaign: order.attributionCampaign,
        landingPath: order.landingPath,
        gclid: order.gclid,
        fbclid: order.fbclid,
      },
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        mode: item.mode,
        lineTotal: item.lineTotal,
      })),
    })),
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
