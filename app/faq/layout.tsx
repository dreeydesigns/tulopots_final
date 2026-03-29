import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about TuloPots orders, delivery, clay care, Studio requests, and handcrafted terracotta forms.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: `FAQ | ${BRAND.name}`,
    description:
      'Frequently asked questions about TuloPots orders, delivery, clay care, Studio requests, and handcrafted terracotta forms.',
    url: `${SITE_URL}/faq`,
  },
};

export default function FaqLayout({ children }: { children: ReactNode }) {
  return children;
}
