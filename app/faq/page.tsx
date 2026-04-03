import { notFound } from 'next/navigation';
import { FaqPageClient } from '@/components/FaqPageClient';
import { isSiteSectionVisible } from '@/lib/catalog';
import { getManagedPageContent } from '@/lib/cms';

export default async function Page() {
  const isVisible = await isSiteSectionVisible('faq.entry');

  if (!isVisible) {
    notFound();
  }

  const content = await getManagedPageContent('faq.page');

  return (
    <FaqPageClient
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      items={content.items}
    />
  );
}
