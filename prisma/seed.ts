import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { products } from '../lib/products';

const siteSections = [
  { key: 'home.logged_out', label: 'Logged-Out Homepage', route: '/' },
  { key: 'home.logged_in', label: 'Logged-In Homepage', route: '/' },
  { key: 'collections.indoor', label: 'For Interior Spaces', route: '/indoor' },
  { key: 'collections.outdoor', label: 'For Open Spaces', route: '/outdoor' },
  { key: 'collections.pots', label: 'Clay Forms', route: '/pots' },
  { key: 'studio.entry', label: 'Studio', route: '/studio' },
  { key: 'contact.entry', label: 'Contact', route: '/contact' },
  { key: 'faq.entry', label: 'FAQ', route: '/faq' },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        category: product.category,
        size: product.size,
        badge: product.badge || null,
        short: product.short,
        price: product.price,
        potOnly: product.potOnly,
        description: product.description,
        cardDescription: product.cardDescription,
        image: product.image,
        decorative: product.decorative ?? false,
        forcePotOnly: product.forcePotOnly ?? false,
        rating: product.rating,
        reviewCount: product.reviews,
        details: product.details,
        plantGuide: product.plantGuide ?? Prisma.JsonNull,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category: product.category,
        size: product.size,
        badge: product.badge || null,
        short: product.short,
        price: product.price,
        potOnly: product.potOnly,
        description: product.description,
        cardDescription: product.cardDescription,
        image: product.image,
        decorative: product.decorative ?? false,
        forcePotOnly: product.forcePotOnly ?? false,
        rating: product.rating,
        reviewCount: product.reviews,
        details: product.details,
        plantGuide: product.plantGuide ?? Prisma.JsonNull,
        visible: true,
        available: true,
      },
    });
  }

  for (const section of siteSections) {
    await prisma.siteSection.upsert({
      where: { key: section.key },
      update: {
        label: section.label,
        route: section.route,
      },
      create: {
        key: section.key,
        label: section.label,
        route: section.route,
        visible: true,
      },
    });
  }

  console.log(`Seeded ${products.length} products and ${siteSections.length} site sections.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
