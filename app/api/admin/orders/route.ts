import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { isSchemaCompatibilityError } from '@/lib/auth';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

function toCsvCell(value: unknown) {
  const normalized = String(value ?? '').replace(/"/g, '""');
  return `"${normalized}"`;
}

const paymentSelect = {
  status: true,
  createdAt: true,
} satisfies Prisma.PaymentSelect;

const orderItemSelect = {
  id: true,
  name: true,
  quantity: true,
  mode: true,
  lineTotal: true,
} satisfies Prisma.OrderItemSelect;

const modernOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  trackingCode: true,
  isCustomOrder: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  shippingAddr1: true,
  subtotal: true,
  deliveryFee: true,
  totalAmount: true,
  currency: true,
  attributionSource: true,
  attributionMedium: true,
  attributionCampaign: true,
  landingPath: true,
  gclid: true,
  fbclid: true,
  estimatedDispatchAt: true,
  estimatedDeliveryAt: true,
  createdAt: true,
  items: {
    select: orderItemSelect,
  },
  payments: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    select: paymentSelect,
  },
} satisfies Prisma.OrderSelect;

const legacyOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  trackingCode: true,
  isCustomOrder: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  shippingAddr1: true,
  subtotal: true,
  deliveryFee: true,
  totalAmount: true,
  currency: true,
  createdAt: true,
  items: {
    select: orderItemSelect,
  },
  payments: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    select: paymentSelect,
  },
} satisfies Prisma.OrderSelect;

const minimalOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  shippingAddr1: true,
  subtotal: true,
  deliveryFee: true,
  totalAmount: true,
  currency: true,
  createdAt: true,
  items: {
    select: orderItemSelect,
  },
} satisfies Prisma.OrderSelect;

type AdminOrderRecord =
  | Prisma.OrderGetPayload<{ select: typeof modernOrderSelect }>
  | Prisma.OrderGetPayload<{ select: typeof legacyOrderSelect }>
  | Prisma.OrderGetPayload<{ select: typeof minimalOrderSelect }>;

async function findAdminOrders() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: modernOrderSelect,
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: legacyOrderSelect,
    });
  }
}

function toIsoDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : '';
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdminUser('orders.read');

    if (!adminUser) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const format = request.nextUrl.searchParams.get('format');
    let orders: AdminOrderRecord[];

    try {
      orders = await findAdminOrders();
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) {
        throw error;
      }

      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: minimalOrderSelect,
      });
    }

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
        'shippingAddr1',
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
            'payments' in order ? order.payments[0]?.status || '' : '',
            'trackingCode' in order ? order.trackingCode : '',
            'isCustomOrder' in order && order.isCustomOrder ? 'yes' : 'no',
            order.customerName,
            order.customerEmail,
            order.customerPhone,
            order.shippingCity || '',
            'shippingAddr1' in order ? order.shippingAddr1 || '' : '',
            order.subtotal,
            order.deliveryFee,
            order.totalAmount,
            order.currency,
            order.items
              .map((item) => `${item.name} x${item.quantity} (${item.mode})`)
              .join(' | '),
            ('attributionSource' in order ? order.attributionSource : '') || '',
            ('attributionMedium' in order ? order.attributionMedium : '') || '',
            ('attributionCampaign' in order ? order.attributionCampaign : '') || '',
            ('landingPath' in order ? order.landingPath : '') || '',
            ('gclid' in order ? order.gclid : '') || '',
            ('fbclid' in order ? order.fbclid : '') || '',
            ('estimatedDispatchAt' in order ? toIsoDate(order.estimatedDispatchAt) : ''),
            ('estimatedDeliveryAt' in order ? toIsoDate(order.estimatedDeliveryAt) : ''),
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
        paymentStatus: 'payments' in order ? order.payments[0]?.status || null : null,
        trackingCode: 'trackingCode' in order ? order.trackingCode : '',
        isCustomOrder: 'isCustomOrder' in order ? order.isCustomOrder : false,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingCity: order.shippingCity,
        shippingAddr1: 'shippingAddr1' in order ? order.shippingAddr1 : null,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        currency: order.currency,
        estimatedDispatchAt:
          'estimatedDispatchAt' in order ? toIsoDate(order.estimatedDispatchAt) || null : null,
        estimatedDeliveryAt:
          'estimatedDeliveryAt' in order ? toIsoDate(order.estimatedDeliveryAt) || null : null,
        createdAt: order.createdAt.toISOString(),
        attribution: {
          source: 'attributionSource' in order ? order.attributionSource : null,
          medium: 'attributionMedium' in order ? order.attributionMedium : null,
          campaign: 'attributionCampaign' in order ? order.attributionCampaign : null,
          landingPath: 'landingPath' in order ? order.landingPath : null,
          gclid: 'gclid' in order ? order.gclid : null,
          fbclid: 'fbclid' in order ? order.fbclid : null,
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
  } catch (error) {
    console.error('[api/admin/orders] error listing orders:', error);
    return NextResponse.json(
      { ok: false, error: 'Unable to load the orders workspace right now.' },
      { status: 500 }
    );
  }
}
