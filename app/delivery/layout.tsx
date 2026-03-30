import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order',
  description:
    'Check paid order progress, delivery timing, and tracking updates for TuloPots.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
