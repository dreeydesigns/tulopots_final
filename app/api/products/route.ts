import { NextResponse } from 'next/server';
import { getCatalogProducts } from '@/lib/catalog';

export async function GET() {
  const items = await getCatalogProducts();

  return NextResponse.json({
    ok: true,
    items,
    count: items.length,
    generatedAt: new Date().toISOString(),
  });
}
