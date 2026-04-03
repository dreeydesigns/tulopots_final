import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/CampaignLanding';
import { getManagedPageContent, resolveCmsImage } from '@/lib/cms';
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

export default async function LaunchPage() {
  const content = await getManagedPageContent('launch.page');

  return (
    <CampaignLanding
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      image={resolveCmsImage(content.image.src)}
      imageAlt={content.image.alt}
      facts={content.facts}
      primaryHref={content.primaryCta.href}
      primaryLabel={content.primaryCta.label}
      secondaryHref={content.secondaryCta.href}
      secondaryLabel={content.secondaryCta.label}
    />
  );
}
