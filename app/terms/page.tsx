import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { getManagedPageContent } from '@/lib/cms';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms governing purchases, account use, Studio requests, and content on TuloPots.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: `Terms of Use | ${BRAND.name}`,
    description:
      'Terms governing purchases, account use, Studio requests, and content on TuloPots.',
    url: `${SITE_URL}/terms`,
  },
};

export default async function TermsPage() {
  const content = await getManagedPageContent('terms.page');

  return (
    <LegalPageShell
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      sections={content.sections}
    />
  );
}
