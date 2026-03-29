import { notFound } from 'next/navigation';
import { CollectionTemplate } from '@/components/Templates';
import { getCatalogProducts, isSiteSectionVisible } from '@/lib/catalog';

export const metadata = {
  title: 'Outdoor Plants | TuloPots',
  description: 'Weather-ready outdoor terracotta pots with curated hardy plant pairings.',
};

export default async function Page() {
  const isVisible = await isSiteSectionVisible('collections.outdoor');

  if (!isVisible) {
    notFound();
  }

  const products = await getCatalogProducts({ category: 'outdoor' });

  return (
    <CollectionTemplate
      route="outdoor"
      title="Outdoor Plants"
      intro="Robust terracotta forms built for patios, balconies, and open spaces where craft should still feel calm and composed."
      facts={['Weather-ready', 'Double-fired clay', 'Nairobi crafted']}
      filters={['all', 'medium', 'large', 'decorative', 'new arrivals']}
      products={products}
      showing={`Showing ${products.length} of ${products.length} products`}
    />
  );
}
