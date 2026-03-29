import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Build Progress',
  description: 'Internal build progress tracker for TuloPots.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProgressLayout({ children }: { children: ReactNode }) {
  return children;
}
