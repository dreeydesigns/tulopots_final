import { NextRequest, NextResponse } from 'next/server';
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

function isValidPhone(v: string) {
  return /^\+?[0-9]{10,15}$/.test(v);
}

export async function POST(req: NextRequest) {
  try {
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

    if (!customerName?.trim()) return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    if (!customerEmail?.trim()) return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    if (!isValidPhone(customerPhone || '')) return NextResponse.json({ error: 'Valid customer phone is required' }, { status: 400 });
    if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    if (!['CARD', 'MPESA'].includes(paymentMethod)) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

    const sanitizedItems = items.map((i) => ({
      key: i.key,
      productSlug: i.slug,
      sku: i.sku || null,
      name: i.name,
      image: i.image || null,
      mode: i.mode,
      sizeLabel: i.sizeLabel || null,
      unitPrice: Number(i.unitPrice || 0),
      quantity: Number(i.quantity || 0),
      lineTotal: Number(i.unitPrice || 0) * Number(i.quantity || 0),
    }));

    const hasInvalidItem = sanitizedItems.some((i) => i.unitPrice <= 0 || i.quantity <= 0 || !i.productSlug || !i.name);
    if (hasInvalidItem) {
      return NextResponse.json({ error: 'Invalid cart item payload' }, { status: 400 });
    }

    const subtotal = sanitizedItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const deliveryFee = subtotal >= 5000 ? 0 : 350;
    const totalAmount = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        orderNumber: `TP-${Date.now()}`,
        paymentMethod,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddr1: shippingAddr1?.trim() || null,
        shippingAddr2: shippingAddr2?.trim() || null,
        shippingCity: shippingCity?.trim() || null,
        shippingNotes: shippingNotes?.trim() || null,
        subtotal,
        deliveryFee,
        totalAmount,
        items: {
          create: sanitizedItems.map((i) => ({
            productSlug: i.productSlug,
            sku: i.sku,
            name: i.name,
            image: i.image,
            mode: i.mode,
            sizeLabel: i.sizeLabel,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            lineTotal: i.lineTotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
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
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 500 });
  }
}
