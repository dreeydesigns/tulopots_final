/**
 * scripts/populate-all-galleries.ts
 *
 * Pushes gallery[] and gallerySlots for every product in lib/products.ts
 * directly to Neon via Prisma. Run once after updating lib/products.ts.
 *
 *   npx tsx scripts/populate-all-galleries.ts
 */

import { PrismaClient } from '@prisma/client';
import { products as staticProducts } from '../lib/products';

const prisma = new PrismaClient();

async function run() {
  console.log(`\nPopulating galleries for ${staticProducts.length} products…\n`);

  let updated = 0;
  let skipped = 0;

  for (const p of staticProducts) {
    // Only update if the product has gallery data or gallerySlots to push.
    const hasGallery = Array.isArray(p.gallery) && p.gallery.length > 0;
    const hasSlots = p.gallerySlots && Object.keys(p.gallerySlots).length > 0;

    if (!hasGallery && !hasSlots) {
      console.log(`  skip  ${p.slug}  (no gallery or slots defined)`);
      skipped++;
      continue;
    }

    const row = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!row) {
      console.log(`  miss  ${p.slug}  (not in DB — run Sync Catalog first)`);
      skipped++;
      continue;
    }

    const gallerySlotsSerialized =
      hasSlots
        ? Object.fromEntries(
            Object.entries(p.gallerySlots!).filter(([, v]) => typeof v === 'string')
          )
        : undefined;

    await prisma.product.update({
      where: { slug: p.slug },
      data: {
        image: p.image || row.image,
        gallery: hasGallery ? p.gallery : undefined,
        gallerySlots: hasSlots ? gallerySlotsSerialized : undefined,
      },
    });

    console.log(
      `  ok    ${p.slug}  gallery=${hasGallery ? p.gallery!.length : 0}  slots=${hasSlots ? Object.keys(p.gallerySlots!).length : 0}`
    );
    updated++;
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.\n`);
}

run()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
