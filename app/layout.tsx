import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import { Providers } from '../components/Providers';
import Cursor from '../components/Cursor';
import { AuthModal } from '../components/AuthModal';
import { Chatbot } from '../components/Chatbot';
import { getCurrentUser } from '@/lib/auth';
import { getSiteSections } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'TuloPots - Handcrafted Terracotta from Kenya',
  description: 'Premium handcrafted terracotta pots, plant pairings, and custom studio commissions from Nairobi.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [user, siteSections] = await Promise.all([
    getCurrentUser(),
    getSiteSections(),
  ]);

  return (
    <html lang="en">
      <body className="cursor-halo-on">
        <Providers initialUser={user} initialSiteSections={siteSections}>
          <Cursor />
          <Nav />
          <AuthModal />
          <Chatbot />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
