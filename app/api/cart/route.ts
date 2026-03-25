import { NextRequest, NextResponse } from 'next/server';

type CartItem = {
  key: string;
  slug: string;
  name: string;
  image?: string;
  mode: 'plant' | 'pot';
  sizeLabel?: string;
  unitPrice: number;
  quantity: number;
};

function totals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
  const deliveryFee = subtotal >= 5000 ? 0 : items.length ? 350 : 0;
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total, currency: 'KES' };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    items: [],
    ...totals([]),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? (body.items as CartItem[]) : [];
    return NextResponse.json({
      ok: true,
      items,
      ...totals(items),
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 });
  }
}
