import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { getManagedPageContent } from '@/lib/cms';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Delivery & Returns',
  description:
    'Delivery timing, inspection, returns, replacements, and custom-order rules for TuloPots.',
  alternates: {
    canonical: '/delivery-returns',
  },
  openGraph: {
    title: `Delivery & Returns | ${BRAND.name}`,
    description:
      'Delivery timing, inspection, returns, replacements, and custom-order rules for TuloPots.',
    url: `${SITE_URL}/delivery-returns`,
  },
};

export default async function DeliveryReturnsPage() {
  const content = await getManagedPageContent('delivery-returns.page');

  return (
    <LegalPageShell
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      sections={content.sections}
    />
  );
}
