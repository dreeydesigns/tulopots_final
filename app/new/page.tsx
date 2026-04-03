import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/CampaignLanding';
import { getManagedPageContent, resolveCmsImage } from '@/lib/cms';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'New Arrivals',
  description:
    'A focused landing page for newly introduced TuloPots forms, ready for seasonal edits, new arrivals, and social traffic.',
  alternates: {
    canonical: '/new',
  },
  openGraph: {
    title: `New Arrivals | ${BRAND.name}`,
    description:
      'A focused landing page for newly introduced TuloPots forms, seasonal edits, and social traffic.',
    url: `${SITE_URL}/new`,
    images: [imageByKey.indoor2],
  },
};

export default async function NewPage() {
  const content = await getManagedPageContent('new.page');

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
