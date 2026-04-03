import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getEditorialArticles } from '@/lib/editorial-articles';
import { getCatalogProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Journal | TuloPots',
  description:
    'Editorial articles from TuloPots on placement, care, delivery clarity, Studio guidance, and the quieter logic of clay forms.',
};

export default async function JournalPage() {
  const products = await getCatalogProducts({ visibleOnly: true });
  const articles = await getEditorialArticles(products);

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
            TuloPots Journal
          </div>
          <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
            Articles that explain the room behind the choice.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[var(--tp-text)]/72">
            Clear reads on clay forms, placement, care, delivery, and Studio guidance. Each article stays easy to follow, easy to share, and easy to revisit from search.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              className="group overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] transition hover:-translate-y-1 hover:border-[var(--tp-accent)]"
            >
              <div className="relative h-64 bg-[var(--tp-surface)]">
                <Image
                  src={article.heroImage}
                  alt={article.heroAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--tp-accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                    {article.eyebrow}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--tp-text)]/55 transition group-hover:translate-x-1 group-hover:text-[var(--tp-accent)]" />
                </div>
                <div className="mt-4 serif-display text-3xl leading-tight text-[var(--tp-heading)]">
                  {article.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--tp-text)]/72">
                  {article.summary}
                </p>
                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                  Read article
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
