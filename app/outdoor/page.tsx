import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionTemplate } from '@/components/Templates';
import { getCatalogProducts, isSiteSectionVisible } from '@/lib/catalog';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export const metadata: Metadata = {
  title: 'For Open Spaces',
  description:
    'Weather-ready terracotta forms from Nairobi, Kenya, selected for patios, balconies, gardens, and open spaces that still ask for restraint.',
  alternates: {
    canonical: '/outdoor',
  },
  openGraph: {
    title: `For Open Spaces | ${BRAND.name}`,
    description:
      'Weather-ready terracotta forms from Nairobi, Kenya, shaped for patios, balconies, and open spaces.',
    url: `${SITE_URL}/outdoor`,
    images: [
      {
        url: imageByKey.outdoor1,
        width: 1200,
        height: 1200,
        alt: `${BRAND.name} terracotta collection for open spaces`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `For Open Spaces | ${BRAND.name}`,
    description:
      'Weather-ready terracotta forms from Nairobi, Kenya, shaped for patios, balconies, and open spaces.',
    images: [imageByKey.outdoor1],
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const isVisible = await isSiteSectionVisible('collections.outdoor');

  if (!isVisible) {
    notFound();
  }

  const products = await getCatalogProducts({ category: 'outdoor' });
  const resolvedSearchParams = await searchParams;
  const requestedFilter = firstParam(resolvedSearchParams.filter)
    ?.toLowerCase()
    .replace(/-/g, ' ');
  const initialFilter =
    requestedFilter === 'decorative' || requestedFilter === 'new arrivals'
      ? requestedFilter
      : requestedFilter === 'medium' || requestedFilter === 'large'
        ? requestedFilter
        : undefined;

  return (
    <CollectionTemplate
      route="outdoor"
      title="For Open Spaces"
      intro="Robust terracotta forms for patios, balconies, and garden edges where craft should feel grounded, calm, and visually composed."
      facts={['Weather-ready', 'Double-fired clay', 'Nairobi crafted']}
      filters={['all', 'medium', 'large', 'decorative', 'new arrivals']}
      products={products}
      showing={`Showing ${products.length} of ${products.length} products`}
      initialFilter={initialFilter}
    />
  );
}
