import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isValidEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type CheckoutItem = {
  key: string;
  slug: string;
  sku?: string;
  name: string;
  image?: string;
  mode: 'plant' | 'pot';
  sizeLabel?: string;
  unitPrice: number;
  quantity: number;
};

function isValidPhone(value: string) {
  return /^\+?[0-9]{10,15}$/.test(value);
}

function createOrderNumber() {
  return `TP-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddr1,
      shippingAddr2,
      shippingCity,
      shippingNotes,
      paymentMethod,
      items,
    } = body as {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddr1?: string;
      shippingAddr2?: string;
      shippingCity?: string;
      shippingNotes?: string;
      paymentMethod: 'CARD' | 'MPESA';
      items: CheckoutItem[];
    };

    if (!customerName?.trim()) {
      return NextResponse.json(
        { error: 'Customer name is required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(String(customerEmail || '').trim())) {
      return NextResponse.json(
        { error: 'A valid customer email is required.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(String(customerPhone || '').trim())) {
      return NextResponse.json(
        { error: 'A valid customer phone is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required.' },
        { status: 400 }
      );
    }

    if (!['CARD', 'MPESA'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method.' },
        { status: 400 }
      );
    }

    const sanitizedItems = items.map((item) => ({
      key: item.key,
      productSlug: item.slug,
      sku: item.sku || null,
      name: item.name,
      image: item.image || null,
      mode: item.mode,
      sizeLabel: item.sizeLabel || null,
      unitPrice: Number(item.unitPrice || 0),
      quantity: Number(item.quantity || 0),
      lineTotal: Number(item.unitPrice || 0) * Number(item.quantity || 0),
    }));
    const hasInvalidItem = sanitizedItems.some(
      (item) =>
        item.unitPrice <= 0 ||
        item.quantity <= 0 ||
        !item.productSlug ||
        !item.name
    );

    if (hasInvalidItem) {
      return NextResponse.json(
        { error: 'Invalid cart item payload.' },
        { status: 400 }
      );
    }

    const subtotal = sanitizedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const deliveryFee = subtotal >= 5000 ? 0 : 350;
    const totalAmount = subtotal + deliveryFee;
    const order = await prisma.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId: currentUser?.id || null,
        paymentMethod,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        shippingAddr1: shippingAddr1?.trim() || null,
        shippingAddr2: shippingAddr2?.trim() || null,
        shippingCity: shippingCity?.trim() || null,
        shippingNotes: shippingNotes?.trim() || null,
        subtotal,
        deliveryFee,
        totalAmount,
        items: {
          create: sanitizedItems.map((item) => ({
            productSlug: item.productSlug,
            sku: item.sku,
            name: item.name,
            image: item.image,
            mode: item.mode,
            sizeLabel: item.sizeLabel,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const response = NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        status: order.status,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        currency: order.currency,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create order.' },
      { status: 500 }
    );
  }
}
