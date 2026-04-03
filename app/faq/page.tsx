import { notFound } from 'next/navigation';
import { FaqPageClient } from '@/components/FaqPageClient';
import { getEditorialArticles } from '@/lib/editorial-articles';
import { isSiteSectionVisible } from '@/lib/catalog';
import { getManagedPageContent } from '@/lib/cms';
import { getCatalogProducts } from '@/lib/catalog';

export default async function Page() {
  const isVisible = await isSiteSectionVisible('faq.entry');

  if (!isVisible) {
    notFound();
  }

  const content = await getManagedPageContent('faq.page');
  const products = await getCatalogProducts({ visibleOnly: true });
  const articles = await getEditorialArticles(products);

  return (
    <FaqPageClient
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      items={content.items}
      articles={articles.map((article) => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        href: `/journal/${article.slug}`,
        keywords: article.keywords,
      }))}
    />
  );
}
