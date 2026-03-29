import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Launch',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LaunchLayout({ children }: { children: ReactNode }) {
  return children;
}
