import type { Metadata } from 'next';
import { LearnPage } from '@/components/learn/LearnPage';

export const metadata: Metadata = {
  title: 'Learn with Clay — TuloPots Studio Classes',
  description:
    'Wheel throwing, hand-building, couples sessions, kids workshops, and 8-week courses. All at TuloPots studio in Nairobi. Book your first class today.',
};

export default function Learn() {
  return <LearnPage />;
}
