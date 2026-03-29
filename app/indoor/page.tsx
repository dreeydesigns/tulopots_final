import { notFound } from 'next/navigation';
import { CollectionTemplate } from '@/components/Templates';
import { getCatalogProducts, isSiteSectionVisible } from '@/lib/catalog';

export const metadata = {
  title: 'Indoor Plants | TuloPots',
  description: 'Handcrafted indoor terracotta pots with curated plant pairings from Nairobi.',
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
      title="Indoor Plants"
      intro="Handcrafted terracotta pots paired with curated plant pairings for spaces that ask for calm, warmth, and presence."
      facts={['Curated Forms', '3 Sizes', 'Free delivery over KSh 5,000']}
      filters={['all', 'small', 'medium', 'large', 'new arrivals']}
      products={products}
      showing={`Showing ${products.length} of ${products.length} products`}
    />
  );
}
