import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionTemplate } from '@/components/Templates';
import { getCatalogProducts, isSiteSectionVisible } from '@/lib/catalog';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'For Interior Spaces',
  description:
    'Handcrafted terracotta forms and curated plant pairings from Nairobi, Kenya, selected for shelves, corners, desks, and calm interior living.',
  alternates: {
    canonical: '/indoor',
  },
  openGraph: {
    title: `For Interior Spaces | ${BRAND.name}`,
    description:
      'Handcrafted terracotta forms and curated plant pairings selected for calm interior spaces.',
    url: `${SITE_URL}/indoor`,
    images: [
      {
        url: imageByKey.indoor1,
        width: 1200,
        height: 1200,
        alt: `${BRAND.name} terracotta collection for interior spaces`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `For Interior Spaces | ${BRAND.name}`,
    description:
      'Handcrafted terracotta forms and curated plant pairings selected for calm interior spaces.',
    images: [imageByKey.indoor1],
  },
};

export default async function Page() {
  const isVisible = await isSiteSectionVisible('collections.indoor');

  if (!isVisible) {
    notFound();
  }

  const products = await getCatalogProducts({ category: 'indoor' });

  return (
    <CollectionTemplate
      route="indoor"
      title="For Interior Spaces"
      intro="Handcrafted terracotta forms paired for shelves, corners, entry tables, and rooms that ask for warmth, calm, and quiet presence."
      facts={['Curated Forms', '3 Sizes', 'Free delivery over KSh 5,000']}
      filters={['all', 'small', 'medium', 'large', 'new arrivals']}
      products={products}
      showing={`Showing ${products.length} of ${products.length} products`}
    />
  );
}
