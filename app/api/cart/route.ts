import { NextRequest, NextResponse } from 'next/server';
import { getDeliverySummary, resolveSupportedCountry } from '@/lib/customer-preferences';

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

function totals(items: CartItem[], shippingCountry?: string, shippingCity?: string) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
  const summary = getDeliverySummary({
    subtotalKes: subtotal,
    itemCount: items.length,
    shippingCountry,
    shippingCity,
  });
  return {
    subtotal: summary.subtotalKes,
    deliveryFee: summary.deliveryFeeKes,
    total: summary.totalKes,
    currency: 'KES',
    isInternational: summary.isInternational,
    isNairobiCbd: summary.isNairobiCbd,
    qualifiesForFreeNairobiCbdDelivery: summary.qualifiesForFreeNairobiCbdDelivery,
    requiresLocationQuote: summary.requiresLocationQuote,
    policyNote: summary.policyNote,
    shippingCountry: resolveSupportedCountry(shippingCountry),
  };
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
    const shippingCountry = resolveSupportedCountry(body?.shippingCountry);
    const shippingCity = String(body?.shippingCity || '').trim();
    return NextResponse.json({
      ok: true,
      items,
      ...totals(items, shippingCountry, shippingCity),
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 });
  }
}
