import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser, slugify } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser();

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
  const nextSlug = slugify(nextSlugRaw || nextName);
  const nextCategory =
    body.category == null ? existing.category : String(body.category).trim() || existing.category;
  const nextSize =
    body.size == null ? existing.size : String(body.size).trim() || existing.size;
  const nextImage =
    body.image == null ? existing.image : String(body.image).trim() || existing.image;
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
  const nextSku =
    body.sku == null ? existing.sku : String(body.sku).trim() || existing.sku;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: nextName,
      slug: nextSlug,
      sku: nextSku,
      category: nextCategory,
      size: nextSize,
      badge:
        body.badge == null
          ? existing.badge
          : String(body.badge).trim() || null,
      short: nextShort,
      price: body.price == null ? existing.price : Number(body.price),
      potOnly:
        body.potOnly == null || body.potOnly === ''
          ? body.potOnly === '' ? null : existing.potOnly
          : Number(body.potOnly),
      description: nextDescription,
      cardDescription: nextCardDescription,
      image: nextImage,
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
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
