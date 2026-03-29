import { products, studioCard } from '@/lib/products';
import { CollectionTemplate } from '@/components/Templates';

const potsProducts = products.filter((p) => p.category === 'pots');

export const metadata = {
  title: 'Best Sellers | TuloPots',
  description:
    'Explore the most chosen terracotta pieces from TuloPots. Handcrafted forms selected for their ease of placement, visual balance, and everyday appeal.',
};

export default function Page() {
  return (
    <CollectionTemplate
      route="pots"
      title="Best Sellers"
      intro="Our most chosen terracotta pieces. A clear starting point for forms that feel easy to place, easy to choose, and easy to live with."
      facts={['Most Chosen', 'Handcrafted', 'Nairobi Made']}
      filters={['all', 'most chosen', 'small', 'medium', 'large', 'statement', 'sets']}
      products={potsProducts}
      showing={`Showing ${potsProducts.length} of ${potsProducts.length} products`}
      studioCard={studioCard}
    />
  );
}