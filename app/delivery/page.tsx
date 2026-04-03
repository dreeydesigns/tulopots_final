import { DeliveryPageClient } from '@/components/DeliveryPageClient';
import { getManagedPageContent } from '@/lib/cms';

export default async function DeliveryPage() {
  const content = await getManagedPageContent('delivery.page');

  return <DeliveryPageClient content={content} />;
}
