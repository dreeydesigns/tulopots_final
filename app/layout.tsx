import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import { Providers } from '../components/Providers';
import { CookieBanner } from '../components/CookieBanner';
import Cursor from '../components/Cursor';
import { AuthModal } from '../components/AuthModal';
import { Chatbot } from '../components/Chatbot';
import { PolicyGate } from '../components/PolicyGate';
import { TrackingProvider } from '../components/TrackingProvider';
import { getCurrentUser } from '@/lib/auth';
import { getSiteSections } from '@/lib/catalog';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

const themeInitScript = `
(() => {
  const root = document.documentElement;
  let theme = 'dark';

  try {
    const raw = localStorage.getItem('tp-theme');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed === 'light' || parsed === 'dark') {
        theme = parsed;
      }
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    }
  } catch {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    }
  }

  root.setAttribute('data-theme', theme);
  root.classList.toggle('theme-light', theme === 'light');
  root.classList.toggle('theme-dark', theme !== 'light');
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    'Editorial terracotta forms, plant pairings, and Studio commissions from Nairobi, Kenya. Crafted for living with warmth, restraint, and calm presence.',
  keywords: [
    'terracotta Kenya',
    'terracotta pots Nairobi',
    'handcrafted clay pots Kenya',
    'clay forms Nairobi',
    'interior styling Kenya',
    'open space planters Kenya',
    'handcrafted decor Nairobi',
  ],
  openGraph: {
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description:
      'Editorial terracotta forms, plant pairings, and Studio commissions from Nairobi, Kenya.',
    url: SITE_URL,
    siteName: BRAND.name,
    images: [
      {
        url: imageByKey.hero,
        width: 1400,
        height: 933,
        alt: `${BRAND.name} handcrafted terracotta forms from Nairobi, Kenya`,
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description:
      'Editorial terracotta forms, plant pairings, and Studio commissions from Nairobi, Kenya.',
    images: [imageByKey.hero],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [user, siteSections] = await Promise.all([getCurrentUser(), getSiteSections()]);

  return (
    <html lang="en" data-theme="dark" className="theme-dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="cursor-halo-on">
        <Providers initialUser={user} initialSiteSections={siteSections}>
          <TrackingProvider />
          <Cursor />
          <Nav />
          <AuthModal />
          <PolicyGate />
          <Chatbot />
          {children}
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
