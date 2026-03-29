import { SearchPageClient } from '@/components/SearchPageClient';
import { getCatalogProducts } from '@/lib/catalog';

export default async function SearchPage() {
  const products = await getCatalogProducts({ visibleOnly: true });

  return <SearchPageClient products={products} />;
}
