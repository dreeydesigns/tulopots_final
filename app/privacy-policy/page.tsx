import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { getManagedPageContent } from '@/lib/cms';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How TuloPots collects, uses, stores, and protects personal data across orders, accounts, Studio briefs, and marketing.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: `Privacy Policy | ${BRAND.name}`,
    description:
      'How TuloPots collects, uses, stores, and protects personal data across orders, accounts, Studio briefs, and marketing.',
    url: `${SITE_URL}/privacy-policy`,
  },
};

export default async function PrivacyPolicyPage() {
  const content = await getManagedPageContent('privacy-policy.page');

  return (
    <LegalPageShell
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      sections={content.sections}
    />
  );
}
