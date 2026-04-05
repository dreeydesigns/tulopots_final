import { Suspense } from 'react';
import { DeliveryPageClient } from '@/components/DeliveryPageClient';
import { getManagedPageContent } from '@/lib/cms';

export default async function DeliveryPage() {
  const content = await getManagedPageContent('delivery.page');

  return (
    <Suspense fallback={null}>
      <DeliveryPageClient content={content} />
    </Suspense>
  );
}
