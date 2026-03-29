import { notFound } from 'next/navigation';
import { CollectionTemplate } from '@/components/Templates';
import { getCatalogProducts, isSiteSectionVisible, studioCard } from '@/lib/catalog';

export const metadata = {
  title: 'Best Sellers | TuloPots',
  description:
    'Explore the most chosen terracotta pieces from TuloPots. Handcrafted forms selected for their ease of placement, visual balance, and everyday appeal.',
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
      title="Best Sellers"
      intro="Our most chosen clay forms. A clear starting point for presence that feels easy to place, easy to choose, and easy to live with."
      facts={['Most Chosen', 'Handcrafted', 'Nairobi Made']}
      filters={['all', 'most chosen', 'small', 'medium', 'large', 'statement', 'sets']}
      products={products}
      showing={`Showing ${products.length} of ${products.length} products`}
      studioCard={studioCard}
    />
  );
}
