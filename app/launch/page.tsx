import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/CampaignLanding';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Launch Collection',
  description:
    'A launch-ready editorial landing page for new TuloPots campaigns, shaped for brand storytelling, collection focus, and social sharing.',
  alternates: {
    canonical: '/launch',
  },
  openGraph: {
    title: `Launch Collection | ${BRAND.name}`,
    description:
      'A launch-ready editorial landing page for new TuloPots campaigns and collection storytelling.',
    url: `${SITE_URL}/launch`,
    images: [imageByKey.hero],
  },
};

export default function LaunchPage() {
  return (
    <CampaignLanding
      eyebrow="Campaign Landing"
      title="Launch-ready space for a new collection."
      intro="This route is ready for collection launches, studio drops, or editorial campaigns that need a focused story and a clear path into the storefront."
      image={imageByKey.hero}
      imageAlt="Editorial TuloPots launch campaign hero"
      facts={['Editorial Focus', 'Collection Story', 'Ready for Launch']}
      primaryHref="/pots"
      primaryLabel="Open Clay Forms"
      secondaryHref="/contact"
      secondaryLabel="Plan Campaign"
    />
  );
}
