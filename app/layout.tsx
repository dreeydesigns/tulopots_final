import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import CursorHalo from '@/components/CursorHalo';
import { AuthModal } from '@/components/AuthModal';
import { Chatbot } from '@/components/Chatbot';

export const metadata = {
  title: 'TuloPots - Handcrafted Terracotta from Kenya',
  description: 'Premium handcrafted terracotta pots, plant pairings, and custom studio commissions from Nairobi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CursorHalo />
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
