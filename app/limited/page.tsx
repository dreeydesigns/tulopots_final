import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/CampaignLanding';
import { getManagedPageContent, resolveCmsImage } from '@/lib/cms';
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

export default async function LimitedPage() {
  const content = await getManagedPageContent('limited.page');

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
