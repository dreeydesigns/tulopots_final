import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionTemplate } from '@/components/Templates';
import { getCatalogProducts, isSiteSectionVisible, studioCard } from '@/lib/catalog';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Clay Forms',
  description:
    'Standalone terracotta forms from Nairobi, Kenya, selected for placement flexibility, sculptural balance, and everyday living.',
  alternates: {
    canonical: '/pots',
  },
  openGraph: {
    title: `Clay Forms | ${BRAND.name}`,
    description:
      'Standalone terracotta forms from Nairobi, Kenya, selected for sculptural balance and placement flexibility.',
    url: `${SITE_URL}/pots`,
    images: [
      {
        url: imageByKey.productStudio,
        width: 1200,
        height: 1200,
        alt: `${BRAND.name} clay forms collection`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Clay Forms | ${BRAND.name}`,
    description:
      'Standalone terracotta forms from Nairobi, Kenya, selected for sculptural balance and placement flexibility.',
    images: [imageByKey.productStudio],
  },
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const isVisible = await isSiteSectionVisible('collections.pots');

  if (!isVisible) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const products = await getCatalogProducts({ category: 'pots' });
  const guideEnabled = firstParam(resolvedSearchParams.guide) === 'true';
  const guideSelection = guideEnabled
    ? {
        enabled: true,
        placement: firstParam(resolvedSearchParams.placement) || undefined,
        intent: firstParam(resolvedSearchParams.intent) || undefined,
        forWhom: firstParam(resolvedSearchParams.for) || undefined,
      }
    : undefined;

  return (
    <CollectionTemplate
      route="pots"
      title="Clay Forms"
      intro="Standalone terracotta forms for shelves, consoles, entry tables, and grounded corners where shape carries the whole mood of the space."
      facts={['Most Chosen', 'Own-Plant Ready', 'Nairobi Crafted']}
      filters={['all', 'most chosen', 'small', 'medium', 'large', 'statement', 'sets']}
      products={products}
      showing={`Showing ${products.length} of ${products.length} products`}
      studioCard={studioCard}
      guideSelection={guideSelection}
    />
  );
}
