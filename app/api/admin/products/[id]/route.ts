import { NextRequest, NextResponse } from 'next/server';
import {
  ensureUniqueProductSku,
  ensureUniqueProductSlug,
  generateSku,
  requireAdminUser,
} from '@/lib/admin';
import { buildStoredProductFields } from '@/lib/product-variants';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser('products.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Product not found.' }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const nextName = body.name == null ? existing.name : String(body.name).trim();
  const nextSlugRaw = body.slug == null ? existing.slug : String(body.slug).trim();
  const nextSlug = await ensureUniqueProductSlug(nextSlugRaw || nextName, existing.id);
  const nextCategory =
    body.category == null ? existing.category : String(body.category).trim() || existing.category;
  const nextSize =
    body.size == null ? existing.size : String(body.size).trim() || existing.size;
  const nextGallery =
    body.gallery == null
      ? (Array.isArray(existing.gallery) ? existing.gallery : [existing.image])
      : Array.isArray(body.gallery)
        ? body.gallery.map((entry) => String(entry || '').trim()).filter(Boolean)
        : [existing.image];
  const nextImage =
    body.image == null
      ? String(nextGallery[0] || existing.image)
      : String(body.image).trim() || String(nextGallery[0] || existing.image);
  const nextDescription =
    body.description == null
      ? existing.description
      : String(body.description).trim() || existing.description;
  const nextShort =
    body.short == null ? existing.short : String(body.short).trim() || existing.short;
  const nextCardDescription =
    body.cardDescription == null
      ? existing.cardDescription
      : String(body.cardDescription).trim() || existing.cardDescription;
  const nextSkuBase =
    body.sku == null
      ? existing.sku
      : String(body.sku).trim() ||
        generateSku({ category: nextCategory, size: nextSize, name: nextName });
  const nextSku = await ensureUniqueProductSku(nextSkuBase, existing.id);
  const nextDecorative =
    body.decorative == null ? existing.decorative : Boolean(body.decorative);
  const nextForcePotOnly =
    body.forcePotOnly == null
      ? nextCategory === 'pots'
        ? true
        : existing.forcePotOnly
      : Boolean(body.forcePotOnly) || nextCategory === 'pots';
  const nextDetails =
    existing.details && typeof existing.details === 'object' && !Array.isArray(existing.details)
      ? (existing.details as Record<string, unknown>)
      : {};
  const storedFields = buildStoredProductFields({
    category: nextCategory,
    size: nextSize,
    name: nextName,
    short: nextShort,
    description: nextDescription,
    cardDescription: nextCardDescription,
    image: nextImage,
    gallery: nextGallery.map((entry) => String(entry)),
    price: body.price == null ? existing.price : Number(body.price),
    potOnly:
      body.potOnly == null || body.potOnly === ''
        ? body.potOnly === '' ? null : existing.potOnly
        : Number(body.potOnly),
    forcePotOnly: nextForcePotOnly,
    decorative: nextDecorative,
    details: nextDetails,
    availableSizes: body.availableSizes == null ? existing.availableSizes : body.availableSizes,
    modeContent: body.modeContent == null ? existing.modeContent : body.modeContent,
  });

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: storedFields.name,
      slug: nextSlug,
      sku: nextSku,
      category: nextCategory,
      size: nextSize,
      badge:
        body.badge == null
          ? existing.badge
          : String(body.badge).trim() || null,
      short: storedFields.short,
      price: storedFields.price,
      potOnly: storedFields.potOnly,
      description: storedFields.description,
      cardDescription: storedFields.cardDescription,
      image: storedFields.image,
      gallery: storedFields.gallery,
      availableSizes: storedFields.availableSizes,
      modeContent: storedFields.modeContent,
      decorative: nextDecorative,
      forcePotOnly: nextForcePotOnly,
      visible: body.visible == null ? existing.visible : Boolean(body.visible),
      available: body.available == null ? existing.available : Boolean(body.available),
    },
  });

  return NextResponse.json({ ok: true, product });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser('products.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
