import { Prisma } from '@prisma/client';
import type { Product as DbProduct, SiteSection as DbSiteSection } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  faqItems,
  productBySlug as fallbackProductBySlug,
  products as fallbackProducts,
  studioCard,
  type Product as CatalogProduct,
} from '@/lib/products';

type ProductRecord = DbProduct & {
  reviews?: { id: string }[];
};

export type CatalogSiteSection = {
  key: string;
  label: string;
  route?: string;
  visible: boolean;
};

export const defaultSiteSections: CatalogSiteSection[] = [
  { key: 'home.logged_out', label: 'Logged-Out Homepage', route: '/', visible: true },
  { key: 'home.logged_in', label: 'Logged-In Homepage', route: '/', visible: true },
  { key: 'collections.indoor', label: 'For Interior Spaces', route: '/indoor', visible: true },
  { key: 'collections.outdoor', label: 'For Open Spaces', route: '/outdoor', visible: true },
  { key: 'collections.pots', label: 'Clay Forms', route: '/pots', visible: true },
  { key: 'studio.entry', label: 'Studio', route: '/studio', visible: true },
  { key: 'contact.entry', label: 'Contact', route: '/contact', visible: true },
  { key: 'faq.entry', label: 'FAQ', route: '/faq', visible: true },
];

function asStringRecord(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, Prisma.JsonValue>).map(([key, entry]) => [
      key,
      String(entry),
    ])
  );
}

function asStringArray(value: Prisma.JsonValue | null | undefined) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.map((entry) => String(entry)).filter(Boolean);
}

function toDbSeedProduct(product: CatalogProduct): Prisma.ProductCreateInput {
  return {
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
    gallery: product.gallery ? product.gallery : [product.image],
    decorative: product.decorative ?? false,
    forcePotOnly: product.forcePotOnly ?? false,
    rating: product.rating,
    reviewCount: product.reviews,
    details: product.details,
    plantGuide: product.plantGuide ?? Prisma.JsonNull,
    visible: true,
    available: true,
  };
}

export function mapDbProductToCatalog(product: ProductRecord): CatalogProduct {
  return {
    slug: product.slug,
    category: product.category as CatalogProduct['category'],
    size: product.size,
    badge: product.badge || undefined,
    sku: product.sku || `TP-${product.slug.toUpperCase()}`,
    name: product.name,
    short: product.short,
    rating: product.rating,
    reviews:
      typeof product.reviewCount === 'number'
        ? product.reviewCount
        : product.reviews?.length || 0,
    price: product.price,
    potOnly: product.potOnly,
    description: product.description,
    cardDescription: product.cardDescription,
    image: product.image,
    gallery: asStringArray(product.gallery) || [product.image],
    decorative: product.decorative,
    forcePotOnly: product.forcePotOnly,
    details: asStringRecord(product.details) || {},
    plantGuide: asStringRecord(product.plantGuide),
  };
}

export async function getCatalogProducts(options?: {
  category?: CatalogProduct['category'];
  visibleOnly?: boolean;
}) {
  const { category, visibleOnly = true } = options || {};

  try {
    const rows = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(visibleOnly ? { visible: true } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    if (rows.length) {
      return rows.map(mapDbProductToCatalog);
    }
  } catch {
    // Fall back to static products if the table is not yet available.
  }

  return fallbackProducts.filter((product) => (category ? product.category === category : true));
}

export async function getCatalogProductBySlug(slug: string) {
  try {
    const row = await prisma.product.findUnique({
      where: { slug },
    });

    if (row && row.visible) {
      return mapDbProductToCatalog(row);
    }
  } catch {
    // Fall back to static products if the table is not yet available.
  }

  return fallbackProductBySlug[slug] || null;
}

export async function getCatalogSlugs() {
  try {
    const rows = await prisma.product.findMany({
      where: { visible: true },
      select: { slug: true },
      orderBy: { createdAt: 'asc' },
    });

    if (rows.length) {
      return rows.map((row) => row.slug);
    }
  } catch {
    // Fall back to static products if the table is not yet available.
  }

  return Object.keys(fallbackProductBySlug);
}

export async function syncCatalogToDatabase() {
  const upserts = fallbackProducts.map((product) =>
    prisma.product.upsert({
      where: { slug: product.slug },
      update: toDbSeedProduct(product),
      create: toDbSeedProduct(product),
    })
  );

  const sectionUpserts = defaultSiteSections.map((section) =>
    prisma.siteSection.upsert({
      where: { key: section.key },
      update: {
        label: section.label,
        route: section.route || null,
      },
      create: {
        key: section.key,
        label: section.label,
        route: section.route || null,
        visible: section.visible,
      },
    })
  );

  await prisma.$transaction([...upserts, ...sectionUpserts]);
}

export async function getSiteSections() {
  try {
    const rows = await prisma.siteSection.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (rows.length) {
      return rows.map((row: DbSiteSection) => ({
        key: row.key,
        label: row.label,
        route: row.route || undefined,
        visible: row.visible,
      }));
    }
  } catch {
    // Fall back to default site sections if the table is not yet available.
  }

  return defaultSiteSections;
}

export async function isSiteSectionVisible(key: string) {
  const sections = await getSiteSections();
  const match = sections.find((section) => section.key === key);
  return match ? match.visible : true;
}

export { faqItems, studioCard };
