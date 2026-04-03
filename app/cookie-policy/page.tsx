import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { getManagedPageContent } from '@/lib/cms';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How TuloPots uses cookies and local storage for sessions, cart continuity, analytics, and future advertising measurement.',
  alternates: {
    canonical: '/cookie-policy',
  },
  openGraph: {
    title: `Cookie Policy | ${BRAND.name}`,
    description:
      'How TuloPots uses cookies and local storage for sessions, cart continuity, analytics, and future advertising measurement.',
    url: `${SITE_URL}/cookie-policy`,
  },
};

export default async function CookiePolicyPage() {
  const content = await getManagedPageContent('cookie-policy.page');

  return (
    <LegalPageShell
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      sections={content.sections}
    />
  );
}
