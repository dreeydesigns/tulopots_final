'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Newspaper, Search, ArrowRight } from 'lucide-react';
import { useStore } from '@/components/Providers';
import { searchEntries } from '@/lib/search-utils';

type FaqItem = {
  question: string;
  answer: string;
  linkText?: string;
  linkHref?: string;
};

type ArticleEntry = {
  id: string;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
};

export function FaqPageClient({
  eyebrow,
  title,
  intro,
  items,
  articles,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  items: FaqItem[];
  articles: ArticleEntry[];
}) {
  const router = useRouter();
  const { isSectionVisible } = useStore();
  const [open, setOpen] = useState(0);
  const [query, setQuery] = useState('');
  const visible = isSectionVisible('faq.entry');

  useEffect(() => {
    if (!visible) {
      router.replace('/');
    }
  }, [router, visible]);

  const searchState = useMemo(() => {
    const faqEntries = items.map((item, index) => ({
      id: `faq:${index}`,
      category: 'faq',
      kind: 'faq',
      title: item.question,
      summary: item.answer,
      label: 'FAQ',
      keywords: [item.question, item.answer, item.linkText, item.linkHref]
        .filter(Boolean)
        .map((value) => String(value)),
    }));

    const articleEntries = articles.map((article) => ({
      id: article.id,
      category: 'article',
      kind: 'article',
      title: article.title,
      summary: article.summary,
      label: 'Article',
      keywords: article.keywords,
    }));

    const combined = searchEntries(query, [...faqEntries, ...articleEntries], 18);
    const faqResults = combined.results
      .filter((entry) => entry.kind === 'faq')
      .map((entry) => items[Number(entry.id.split(':')[1])])
      .filter(Boolean);
    const articleResults = combined.results
      .filter((entry) => entry.kind === 'article')
      .map((entry) => articles.find((article) => article.id === entry.id))
      .filter(Boolean) as ArticleEntry[];

    return {
      suggestedQuery: combined.suggestedQuery,
      faqResults,
      articleResults,
    };
  }, [articles, items, query]);

  if (!visible) {
    return null;
  }

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
          {eyebrow}
        </div>
        <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--tp-text)]/72">
          {intro}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5 md:p-6">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--tp-text)]/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a question, article, delivery answer, or care topic..."
            className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] py-5 pl-14 pr-5 text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {['delivery time', 'care guide', 'pot only', 'custom order', 'peace lily'].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setQuery(prompt)}
              className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 text-xs text-[var(--tp-text)]/70 transition hover:border-[var(--tp-accent)] hover:text-[var(--tp-heading)]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {query ? (
          <p className="mt-4 text-sm text-[var(--tp-text)]/68">
            {searchState.faqResults.length + searchState.articleResults.length} matching result
            {searchState.faqResults.length + searchState.articleResults.length === 1 ? '' : 's'}
            {searchState.suggestedQuery ? (
              <span className="text-[var(--tp-heading)]">
                {' '}
                shown for the closest match: “{searchState.suggestedQuery}”.
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--tp-text)]/68">
            Search the FAQ and the TuloPots articles in one place. If the quick answer is not enough, the article results go deeper.
          </p>
        )}
      </div>

      {query ? (
        <div className="mx-auto mt-10 max-w-5xl space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                  FAQ answers
                </div>
                <div className="mt-2 text-lg text-[var(--tp-heading)]">
                  Simple answers first
                </div>
              </div>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
              >
                Full help search
                <ArrowRight className="h-3.5 w-3.5 text-[var(--tp-accent)]" />
              </Link>
            </div>

            <div className="space-y-4">
              {searchState.faqResults.length ? (
                searchState.faqResults.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6"
                  >
                    <div className="serif-display text-3xl text-[var(--tp-heading)] md:text-4xl">
                      {item.question}
                    </div>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--tp-text)]/75">
                      {item.answer}
                      {item.linkText && item.linkHref ? (
                        <>
                          {' '}
                          <Link href={item.linkHref} className="text-[var(--tp-accent)] underline">
                            {item.linkText}
                          </Link>
                          .
                        </>
                      ) : null}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 text-sm leading-7 text-[var(--tp-text)]/72">
                  No FAQ answer matched yet. Try a shorter phrase, or use the article results below for a fuller explanation.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                From the journal
              </div>
              <div className="mt-2 text-lg text-[var(--tp-heading)]">
                Longer reads when you want context
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {searchState.articleResults.length ? (
                searchState.articleResults.map((article) => (
                  <Link
                    key={article.id}
                    href={article.href}
                    className="group rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 transition hover:-translate-y-1 hover:border-[var(--tp-accent)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[var(--tp-accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                        Article
                      </span>
                      <Newspaper className="h-4 w-4 text-[var(--tp-text)]/55 transition group-hover:text-[var(--tp-accent)]" />
                    </div>
                    <div className="mt-4 serif-display text-3xl leading-tight text-[var(--tp-heading)]">
                      {article.title}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--tp-text)]/72">
                      {article.summary}
                    </p>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                      Read article
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 text-sm leading-7 text-[var(--tp-text)]/72 md:col-span-2">
                  No article matched that search yet. Try the full help search for wider results, or contact us if you need a human answer.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className="mt-10 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.question}
                className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6"
              >
                <button
                  onClick={() => setOpen(open === index ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  type="button"
                >
                  <span className="serif-display text-3xl text-[var(--tp-heading)] md:text-4xl">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[var(--tp-text)]/60 transition ${
                      open === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {open === index ? (
                  <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--tp-text)]/75">
                    {item.answer}
                    {item.linkText && item.linkHref ? (
                      <>
                        {' '}
                        <Link href={item.linkHref} className="text-[var(--tp-accent)] underline">
                          {item.linkText}
                        </Link>
                        .
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <section className="mt-12">
            <div className="mb-5 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                From the journal
              </div>
              <div className="mt-3 serif-display text-4xl text-[var(--tp-heading)]">
                Articles for the questions behind the questions
              </div>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--tp-text)]/72">
                These longer reads explain the room logic, care thinking, delivery rhythm, and Studio guidance behind the quick answers.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={article.href}
                  className="group rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 transition hover:-translate-y-1 hover:border-[var(--tp-accent)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[var(--tp-accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                      Article
                    </span>
                    <Newspaper className="h-4 w-4 text-[var(--tp-text)]/55 transition group-hover:text-[var(--tp-accent)]" />
                  </div>
                  <div className="mt-4 serif-display text-3xl leading-tight text-[var(--tp-heading)]">
                    {article.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--tp-text)]/72">
                    {article.summary}
                  </p>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                    Read article
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
