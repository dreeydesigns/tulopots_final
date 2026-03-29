import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Limited',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LimitedLayout({ children }: { children: ReactNode }) {
  return children;
}
