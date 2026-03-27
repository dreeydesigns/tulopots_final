import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import { Providers } from '../components/Providers';
import Cursor from '../components/Cursor';
import { AuthModal } from '../components/AuthModal';
import { Chatbot } from '../components/Chatbot';

export const metadata: Metadata = {
  title: 'TuloPots - Handcrafted Terracotta from Kenya',
  description: 'Premium handcrafted terracotta pots, plant pairings, and custom studio commissions from Nairobi.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="cursor-halo-on">
        <Providers>
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