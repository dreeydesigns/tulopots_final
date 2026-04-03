import { SearchPageClient } from '@/components/SearchPageClient';
import { getCatalogProducts } from '@/lib/catalog';
import { getKnowledgeBaseEntries } from '@/lib/knowledge-base';

export default async function SearchPage() {
  const products = await getCatalogProducts({ visibleOnly: true });
  const entries = await getKnowledgeBaseEntries(products);

  return <SearchPageClient entries={entries} />;
}
