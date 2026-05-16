/**
 * scripts/sync-and-populate.ts
 *
 * 1. Upserts every product in lib/products.ts into Neon (including gallerySlots).
 * 2. Reports what changed.
 *
 *   npx tsx scripts/sync-and-populate.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { products as staticProducts } from '../lib/products';
import { buildStoredProductFields } from '../lib/product-variants';

const prisma = new PrismaClient();

async function run() {
  console.log(`\nSyncing ${staticProducts.length} products to DB…\n`);

  let created = 0;
  let updated = 0;

  for (const p of staticProducts) {
    const storedFields = buildStoredProductFields(p);

    const gallerySlots: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      p.gallerySlots && Object.keys(p.gallerySlots).length
        ? (Object.fromEntries(
            Object.entries(p.gallerySlots).filter(([, v]) => typeof v === 'string')
          ) as Prisma.InputJsonValue)
        : Prisma.JsonNull;

    const data = {
      name: storedFields.name,
      sku: p.sku,
      category: p.category,
      size: p.size,
      badge: p.badge || null,
      short: storedFields.short,
      price: storedFields.price,
      potOnly: storedFields.potOnly,
      description: storedFields.description,
      cardDescription: storedFields.cardDescription,
      image: storedFields.image,
      gallery: storedFields.gallery,
      gallerySlots,
      availableSizes: storedFields.availableSizes,
      modeContent: storedFields.modeContent,
      decorative: p.decorative ?? false,
      forcePotOnly: p.forcePotOnly ?? false,
      rating: p.rating,
      reviewCount: p.reviews,
      details: p.details as Prisma.InputJsonValue,
      plantGuide: (p.plantGuide ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
      visible: true,
      available: true,
    };

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });

    if (existing) {
      await prisma.product.update({ where: { slug: p.slug }, data });
      const slots = p.gallerySlots ? Object.keys(p.gallerySlots).length : 0;
      const imgs = Array.isArray(p.gallery) ? p.gallery.length : 0;
      console.log(`  update  ${p.slug}  (${imgs} gallery, ${slots} slots)`);
      updated++;
    } else {
      await prisma.product.create({ data: { ...data, slug: p.slug } });
      console.log(`  create  ${p.slug}`);
      created++;
    }
  }

  console.log(`\nDone. ${created} created, ${updated} updated.\n`);
}

run()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
