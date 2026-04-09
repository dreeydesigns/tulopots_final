import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { isSchemaCompatibilityError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

const orderItemSelect = {
  productSlug: true,
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
  displayCurrency: true,
  preferredLanguage: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  shippingCountry: true,
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

const compatibilityOrderSelect = {
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
  createdAt: true,
  items: {
    select: orderItemSelect,
  },
} satisfies Prisma.OrderSelect;

async function findOrderWithFallback(orderId: string) {
  try {
    return await prisma.order.findUnique({
      where: { id: orderId },
      select: modernOrderSelect,
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    try {
      return await prisma.order.findUnique({
        where: { id: orderId },
        select: compatibilityOrderSelect,
      });
    } catch (compatibilityError) {
      if (!isSchemaCompatibilityError(compatibilityError)) {
        throw compatibilityError;
      }

      return prisma.order.findUnique({
        where: { id: orderId },
        select: legacyOrderSelect,
      });
    }
  }
}

function toIsoDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : undefined;
}

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
    const order = await findOrderWithFallback(orderId);

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
      displayCurrency:
        'displayCurrency' in order && order.displayCurrency
          ? order.displayCurrency
          : undefined,
      preferredLanguage:
        'preferredLanguage' in order && order.preferredLanguage
          ? order.preferredLanguage
          : undefined,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone:
        'customerPhone' in order && order.customerPhone ? order.customerPhone : '',
      shippingCity:
        'shippingCity' in order && order.shippingCity ? order.shippingCity : undefined,
      shippingCountry:
        'shippingCountry' in order && order.shippingCountry
          ? order.shippingCountry
          : undefined,
      trackingCode:
        'trackingCode' in order && order.trackingCode ? order.trackingCode : '',
      isCustomOrder:
        'isCustomOrder' in order && typeof order.isCustomOrder === 'boolean'
          ? order.isCustomOrder
          : false,
      estimatedDispatchAt:
        'estimatedDispatchAt' in order && order.estimatedDispatchAt
          ? toIsoDate(order.estimatedDispatchAt)
          : undefined,
      estimatedDeliveryAt:
        'estimatedDeliveryAt' in order && order.estimatedDeliveryAt
          ? toIsoDate(order.estimatedDeliveryAt)
          : undefined,
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

    const response = NextResponse.json({
      ok: true,
      order: responseOrder,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('[api/orders/[orderId]] error fetching order:', error);

    return NextResponse.json(
      { error: 'Could not fetch order' },
      { status: 500 }
    );
  }
}
