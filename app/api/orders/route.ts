import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { isSchemaCompatibilityError } from '@/lib/auth';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

// GET /api/orders
//
// Returns a list of recent orders.  Intended for internal use (e.g. the
// admin dashboard) to display order history.  We limit the number of
// returned orders to avoid long responses.  Each order includes its items
// and basic customer metadata.  If no orders exist, an empty array is
// returned.  Errors are surfaced via 500 responses with a generic message.

const orderItemSelect = {
  name: true,
  mode: true,
  quantity: true,
  unitPrice: true,
  lineTotal: true,
  image: true,
  sizeLabel: true,
} satisfies Prisma.OrderItemSelect;

const modernOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  totalAmount: true,
  subtotal: true,
  deliveryFee: true,
  currency: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  trackingCode: true,
  isCustomOrder: true,
  estimatedDispatchAt: true,
  estimatedDeliveryAt: true,
  trackingTimeline: true,
  notificationLog: true,
  attributionSource: true,
  attributionMedium: true,
  attributionCampaign: true,
  landingPath: true,
  createdAt: true,
  items: {
    select: orderItemSelect,
  },
} satisfies Prisma.OrderSelect;

const legacyOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  totalAmount: true,
  subtotal: true,
  deliveryFee: true,
  currency: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  trackingCode: true,
  isCustomOrder: true,
  createdAt: true,
  items: {
    select: orderItemSelect,
  },
} satisfies Prisma.OrderSelect;

async function findOrdersWithFallback() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: modernOrderSelect,
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: legacyOrderSelect,
    });
  }
}

function toIsoDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : undefined;
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const adminUser = await requireAdminUser('orders.read');

    if (!adminUser) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await findOrdersWithFallback();

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
        customerPhone: order.customerPhone,
        shippingCity: order.shippingCity || undefined,
        trackingCode: order.trackingCode,
        isCustomOrder: order.isCustomOrder,
        estimatedDispatchAt:
          'estimatedDispatchAt' in order ? toIsoDate(order.estimatedDispatchAt) : undefined,
        estimatedDeliveryAt:
          'estimatedDeliveryAt' in order ? toIsoDate(order.estimatedDeliveryAt) : undefined,
        trackingTimeline:
          'trackingTimeline' in order && Array.isArray(order.trackingTimeline)
            ? order.trackingTimeline
            : [],
        notificationLog:
          'notificationLog' in order && Array.isArray(order.notificationLog)
            ? order.notificationLog
            : [],
        attribution: {
          source:
            'attributionSource' in order && order.attributionSource
              ? order.attributionSource
              : undefined,
          medium:
            'attributionMedium' in order && order.attributionMedium
              ? order.attributionMedium
              : undefined,
          campaign:
            'attributionCampaign' in order && order.attributionCampaign
              ? order.attributionCampaign
              : undefined,
          landingPath:
            'landingPath' in order && order.landingPath ? order.landingPath : undefined,
        },
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
