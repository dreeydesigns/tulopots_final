import { ProfilePageClient } from '@/components/ProfilePageClient';
import { getCatalogProducts } from '@/lib/catalog';

export default async function ProfilePage() {
  const products = await getCatalogProducts({ visibleOnly: true });

  return <ProfilePageClient products={products} />;
}
