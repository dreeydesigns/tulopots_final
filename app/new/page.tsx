import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/CampaignLanding';
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

export default function NewPage() {
  return (
    <CampaignLanding
      eyebrow="New Arrivals"
      title="A dedicated stage for new clay forms."
      intro="Use this page for fresh arrivals, new edits, or a short-run release that deserves a tighter story than the main collection pages."
      image={imageByKey.indoor2}
      imageAlt="New TuloPots clay forms"
      facts={['Fresh Edit', 'Story-led Entry', 'Social-ready']}
      primaryHref="/indoor"
      primaryLabel="For Interior Spaces"
      secondaryHref="/outdoor"
      secondaryLabel="For Open Spaces"
    />
  );
}
