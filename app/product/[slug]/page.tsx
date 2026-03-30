import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/ProductPageClient';
import {
  getCatalogProductBySlug,
  getCatalogProducts,
  getCatalogSlugs,
} from '@/lib/catalog';
import { BRAND, SITE_URL } from '@/lib/site';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function getCategoryLabel(category: 'indoor' | 'outdoor' | 'pots') {
  if (category === 'indoor') return 'For Interior Spaces';
  if (category === 'outdoor') return 'For Open Spaces';
  return 'Clay Forms';
}

export async function generateStaticParams() {
  const slugs = await getCatalogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) return {};

  const categoryLabel = getCategoryLabel(product.category);
  const title = `${product.name} · ${categoryLabel}`;
  const description = `${product.name} by ${BRAND.name}. Handcrafted terracotta form from Nairobi, Kenya, shaped for calm placement, lasting presence, and thoughtful living.`;
  const image = product.image;
  const gallery = product.gallery?.length ? product.gallery : [product.image];

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${slug}`,
      siteName: BRAND.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 1200,
          alt: `${product.name} handcrafted terracotta form by ${BRAND.name}`,
        },
      ],
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    keywords: [
      'terracotta Kenya',
      'handcrafted clay pots Nairobi',
      'clay forms Kenya',
      'interior decor Kenya',
      'open space planters Kenya',
      'terracotta planters Nairobi',
      product.name.toLowerCase(),
      categoryLabel.toLowerCase(),
    ],
  };
}

export default async function Page({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) notFound();

  const gallery = product.gallery?.length ? product.gallery : [product.image];

  const relatedProducts = (await getCatalogProducts({ category: product.category }))
    .filter((item) => item.slug !== product.slug)
    .slice(0, 2);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: gallery,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: BRAND.name,
    },
    category: getCategoryLabel(product.category),
    aggregateRating:
      product.reviews > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(product.rating.toFixed(1)),
            reviewCount: product.reviews,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: product.price,
      url: `${SITE_URL}/product/${product.slug}`,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <ProductPageClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
