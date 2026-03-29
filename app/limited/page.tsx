import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/CampaignLanding';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Limited Edition',
  description:
    'A campaign-ready landing page for limited runs, exclusive edits, and short-quantity TuloPots releases.',
  alternates: {
    canonical: '/limited',
  },
  openGraph: {
    title: `Limited Edition | ${BRAND.name}`,
    description:
      'A campaign-ready landing page for limited runs, exclusive edits, and short-quantity releases.',
    url: `${SITE_URL}/limited`,
    images: [imageByKey.productStudio],
  },
};

export default function LimitedPage() {
  return (
    <CampaignLanding
      eyebrow="Limited Edition"
      title="Reserved for short runs and rare forms."
      intro="This route is ready for exclusive edits, studio-first releases, or smaller drops where scarcity needs to feel intentional rather than loud."
      image={imageByKey.productStudio}
      imageAlt="Limited edition TuloPots terracotta forms"
      facts={['Short Run', 'Editorial Drop', 'Quiet Scarcity']}
      primaryHref="/pots"
      primaryLabel="View Clay Forms"
      secondaryHref="/studio"
      secondaryLabel="Open Studio"
    />
  );
}
