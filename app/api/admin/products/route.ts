import { NextRequest, NextResponse } from 'next/server';
import {
  ensureUniqueProductSku,
  ensureUniqueProductSlug,
  generateSku,
  requireAdminUser,
} from '@/lib/admin';
import { buildStoredProductFields } from '@/lib/product-variants';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name || '').trim();
  const slugInput = String(body.slug || '').trim();
  const slug = await ensureUniqueProductSlug(slugInput || name);
  const category = String(body.category || 'pots').trim() || 'pots';
  const size = String(body.size || 'medium').trim() || 'medium';
  const gallery = Array.isArray(body.gallery)
    ? body.gallery.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
  const image = String(body.image || gallery[0] || '').trim();
  const description = String(body.description || '').trim();
  const short = String(body.short || name).trim() || name;
  const cardDescription = String(body.cardDescription || description || short).trim() || short;
  const sku = await ensureUniqueProductSku(
    String(body.sku || generateSku({ category, size, name })).trim()
  );
  const badge = String(body.badge || '').trim();
  const price = Number(body.price || 0);
  const potOnly = body.potOnly === '' || body.potOnly == null ? null : Number(body.potOnly);
  const visible = body.visible !== false;
  const available = body.available !== false;
  const decorative = body.decorative === true;
  const forcePotOnly = body.forcePotOnly === true || category === 'pots';
  const details = {
    material: '100% Natural Kenyan Clay',
    finish: 'Natural Terracotta',
  };
  const storedFields = buildStoredProductFields({
    category,
    size,
    name,
    short,
    description,
    cardDescription,
    image,
    gallery,
    price,
    potOnly,
    forcePotOnly,
    decorative,
    details,
    availableSizes: body.availableSizes,
    modeContent: body.modeContent,
  });

  if (!name || !slug || !storedFields.image || !storedFields.description || storedFields.price <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Name, slug, image, description, and price are required.' },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name: storedFields.name,
      slug,
      sku,
      category,
      size,
      badge: badge || null,
      short: storedFields.short,
      price: storedFields.price,
      potOnly: storedFields.potOnly,
      description: storedFields.description,
      cardDescription: storedFields.cardDescription,
      image: storedFields.image,
      gallery: storedFields.gallery,
      availableSizes: storedFields.availableSizes,
      modeContent: storedFields.modeContent,
      decorative,
      forcePotOnly,
      visible,
      available,
      details,
    },
  });

  return NextResponse.json({ ok: true, product });
}
