import { NextRequest, NextResponse } from 'next/server';
import { generateSku, requireAdminUser, slugify } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name || '').trim();
  const slugInput = String(body.slug || '').trim();
  const slug = slugify(slugInput || name);
  const category = String(body.category || 'pots').trim() || 'pots';
  const size = String(body.size || 'medium').trim() || 'medium';
  const gallery = Array.isArray(body.gallery)
    ? body.gallery.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
  const image = String(body.image || gallery[0] || '').trim();
  const description = String(body.description || '').trim();
  const short = String(body.short || name).trim() || name;
  const cardDescription = String(body.cardDescription || description || short).trim() || short;
  const sku = String(body.sku || generateSku({ category, size, name })).trim();
  const badge = String(body.badge || '').trim();
  const price = Number(body.price || 0);
  const potOnly = body.potOnly === '' || body.potOnly == null ? null : Number(body.potOnly);
  const visible = body.visible !== false;
  const available = body.available !== false;

  if (!name || !slug || !image || !description || price <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Name, slug, image, description, and price are required.' },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      sku,
      category,
      size,
      badge: badge || null,
      short,
      price,
      potOnly,
      description,
      cardDescription,
      image,
      gallery: gallery.length ? gallery : [image],
      visible,
      available,
      details: {
        material: '100% Natural Kenyan Clay',
        finish: 'Natural Terracotta',
      },
    },
  });

  return NextResponse.json({ ok: true, product });
}
