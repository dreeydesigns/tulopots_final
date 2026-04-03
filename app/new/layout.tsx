import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Our History',
  description: 'The long-form TuloPots story, rooted in Nairobi and shaped in clay.',
};

export default function NewLayout({ children }: { children: ReactNode }) {
  return children;
}
