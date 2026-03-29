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

export default async function Page() {
  const isVisible = await isSiteSectionVisible('collections.pots');

  if (!isVisible) {
    notFound();
  }

  const products = await getCatalogProducts({ category: 'pots' });

  return (
    <CollectionTemplate
      route="pots"
      title="Clay Forms"
      intro="Standalone terracotta objects chosen for visual balance, versatile placement, and the quiet confidence of natural clay."
      facts={['Most Chosen', 'Handcrafted', 'Nairobi Made']}
      filters={['all', 'most chosen', 'small', 'medium', 'large', 'statement', 'sets']}
      products={products}
      showing={`Showing ${products.length} of ${products.length} products`}
      studioCard={studioCard}
    />
  );
}
