import type { Metadata } from 'next';
import { HistoryPage } from '@/components/history/HistoryPage';
import { getManagedPageContent } from '@/lib/cms';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Our History',
  description:
    'The story of TuloPots, from the quiet feeling that shapes Kenyan homes to the handcrafted terracotta forms we place today.',
  alternates: {
    canonical: '/new',
  },
  openGraph: {
    title: `Our History | ${BRAND.name}`,
    description:
      'A long-form TuloPots story about Nairobi, clay, and the quiet presence that completes a room.',
    url: `${SITE_URL}/new`,
    images: [imageByKey.workshop],
  },
};

export default async function NewPage() {
  const content = await getManagedPageContent('new.page');

  return <HistoryPage content={content} />;
}
