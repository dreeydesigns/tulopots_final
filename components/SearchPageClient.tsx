'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, LifeBuoy } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import type { KnowledgeCategory, KnowledgeEntry } from '@/lib/knowledge-base';

const filterOptions: Array<{ key: KnowledgeCategory; label: string }> = [
  { key: 'products', label: 'Products' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'care', label: 'Care' },
  { key: 'account', label: 'Account' },
  { key: 'studio', label: 'Studio' },
  { key: 'policies', label: 'Policies' },
  { key: 'contact', label: 'Contact' },
];

const quickPrompts = [
  'delivery time',
  'change currency',
  'sign in help',
  'peace lily',
  'M-Pesa checkout',
  'custom order',
  'returns',
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueTokens(value: string) {
  return Array.from(new Set(normalizeText(value).split(' ').filter((token) => token.length > 1)));
}

function levenshtein(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const matrix = Array.from({ length: right.length + 1 }, (_, row) =>
    Array.from({ length: left.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0))
  );

  for (let row = 1; row <= right.length; row += 1) {
    for (let col = 1; col <= left.length; col += 1) {
      const cost = left[col - 1] === right[row - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[right.length][left.length];
}

function entryScore(query: string, entry: KnowledgeEntry) {
  const normalizedQuery = normalizeText(query);
  const queryTokens = uniqueTokens(query);
  const searchable = normalizeText(
    [entry.title, entry.summary, entry.keywords.join(' '), entry.label].join(' ')
  );
  const keywordSet = uniqueTokens([entry.title, entry.keywords.join(' '), entry.summary].join(' '));

  let score = 0;

  if (searchable.includes(normalizedQuery)) {
    score += 120;
  }

  queryTokens.forEach((token) => {
    if (searchable.includes(token)) {
      score += 24;
    }

    const bestDistance = keywordSet.reduce((best, keyword) => {
      const nextDistance = levenshtein(token, keyword);
      return nextDistance < best ? nextDistance : best;
    }, Number.POSITIVE_INFINITY);

    if (bestDistance === 0) {
      score += 18;
    } else if (bestDistance === 1) {
      score += 12;
    } else if (bestDistance === 2 && token.length > 4) {
      score += 7;
    }
  });

  if (entry.kind === 'answer') {
    score += 6;
  }

  return score;
}

function suggestQuery(query: string, entries: KnowledgeEntry[]) {
  const queryTokens = uniqueTokens(query);
  const vocabulary = Array.from(
    new Set(
      entries.flatMap((entry) =>
        uniqueTokens([entry.title, entry.keywords.join(' ')].join(' ')).filter(
          (token) => token.length > 2
        )
      )
    )
  );

  if (!queryTokens.length || !vocabulary.length) {
    return null;
  }

  const nextTokens = queryTokens.map((token) => {
    const bestMatch = vocabulary.reduce(
      (best, candidate) => {
        const distance = levenshtein(token, candidate);
        if (distance < best.distance) {
          return { candidate, distance };
        }

        return best;
      },
      { candidate: token, distance: Number.POSITIVE_INFINITY }
    );

    if (bestMatch.distance > 0 && bestMatch.distance <= Math.min(2, Math.floor(token.length / 3))) {
      return bestMatch.candidate;
    }

    return token;
  });

  const suggestion = nextTokens.join(' ');
  return suggestion !== normalizeText(query) ? suggestion : null;
}

function resultTone(category: KnowledgeCategory) {
  switch (category) {
    case 'products':
      return {
        bg: 'var(--tp-accent-soft)',
        text: 'var(--tp-accent)',
      };
    case 'delivery':
      return {
        bg: 'color-mix(in srgb, var(--tp-accent-soft) 58%, var(--tp-card) 42%)',
        text: 'var(--tp-heading)',
      };
    default:
      return {
        bg: 'var(--tp-surface)',
        text: 'var(--tp-heading)',
      };
  }
}

export function SearchPageClient({
  products,
  entries,
}: {
  products: Product[];
  entries: KnowledgeEntry[];
}) {
  const [query, setQuery] = useState('');
  const [helpOnly, setHelpOnly] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<KnowledgeCategory[]>(
    filterOptions.map((option) => option.key)
  );
  const [showContactFallback, setShowContactFallback] = useState(false);

  const searchState = useMemo(() => {
    const normalized = normalizeText(query);

    if (!normalized) {
      return {
        suggestedQuery: null as string | null,
        appliedQuery: '',
        results: [] as KnowledgeEntry[],
      };
    }

    const availableEntries = entries.filter((entry) => {
      if (!selectedFilters.includes(entry.category)) {
        return false;
      }

      if (helpOnly && entry.category === 'products') {
        return false;
      }

      return true;
    });
    const directMatches = availableEntries
      .map((entry) => ({
        entry,
        score: entryScore(normalized, entry),
      }))
      .filter((item) => item.score >= 20)
      .sort((left, right) => right.score - left.score)
      .map((item) => item.entry);

    if (directMatches.length) {
      return {
        suggestedQuery: null,
        appliedQuery: normalized,
        results: directMatches.slice(0, 18),
      };
    }

    const suggestedQuery = suggestQuery(normalized, availableEntries);

    if (!suggestedQuery) {
      return {
        suggestedQuery: null,
        appliedQuery: normalized,
        results: [] as KnowledgeEntry[],
      };
    }

    const suggestedMatches = availableEntries
      .map((entry) => ({
        entry,
        score: entryScore(suggestedQuery, entry),
      }))
      .filter((item) => item.score >= 18)
      .sort((left, right) => right.score - left.score)
      .map((item) => item.entry)
      .slice(0, 18);

    return {
      suggestedQuery,
      appliedQuery: suggestedQuery,
      results: suggestedMatches,
    };
  }, [entries, helpOnly, query, selectedFilters]);

  const resultCountLabel = searchState.results.length
    ? `${searchState.results.length} result${searchState.results.length === 1 ? '' : 's'}`
    : 'No direct matches yet';

  function toggleFilter(filter: KnowledgeCategory) {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== filter)
        : [...current, filter]
    );
  }

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Search and Help
          </div>
          <h1 className="mt-4 serif-display text-5xl tp-heading md:text-6xl">
            Find what you need, simply.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 tp-text-soft">
            Search products, delivery guidance, care answers, account help, Studio support,
            and policy basics in one place. The results are written to feel clear, not technical.
          </p>
        </div>

        <div className="mt-8 rounded-[2rem] border tp-card p-5 md:p-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 tp-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try: delivery time, sign in, snake plant, M-Pesa, returns..."
              className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] py-5 pl-14 pr-5 text-[var(--tp-heading)] shadow-[var(--tp-shadow-soft)] outline-none transition focus:border-[var(--tp-accent)]"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2.5 text-sm tp-heading">
              <input
                type="checkbox"
                checked={helpOnly}
                onChange={(event) => setHelpOnly(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--tp-border)]"
              />
              Show help answers first
            </label>

            {filterOptions.map((option) => {
              const active = selectedFilters.includes(option.key);

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleFilter(option.key)}
                  className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{
                    background: active ? 'var(--tp-accent)' : 'var(--tp-surface)',
                    color: active ? 'var(--tp-btn-primary-text)' : 'var(--tp-heading)',
                    border: active ? 'none' : '1px solid var(--tp-border)',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuery(prompt)}
                className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-2 text-xs tp-text-soft transition hover:border-[var(--tp-accent)] hover:text-[var(--tp-heading)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm tp-text-soft">
            {query ? (
              <>
                {resultCountLabel} for “{query}”
                {searchState.suggestedQuery ? (
                  <span className="tp-heading">. Showing the closest match for “{searchState.suggestedQuery}”.</span>
                ) : null}
              </>
            ) : (
              'Search the whole website or use the help-first checkbox when you want plain-language answers.'
            )}
          </p>

          <button
            type="button"
            onClick={() => setShowContactFallback((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] tp-heading"
          >
            <LifeBuoy className="h-3.5 w-3.5 tp-accent" />
            {showContactFallback ? 'Hide direct help' : 'Still need help?'}
          </button>
        </div>

        {showContactFallback ? (
          <div className="mt-6 grid gap-4 rounded-[2rem] border tp-card p-6 md:grid-cols-3">
            <Link href="/contact" className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4 transition hover:border-[var(--tp-accent)]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-accent">
                Contact
              </div>
              <div className="mt-3 text-lg font-semibold tp-heading">Speak to the team</div>
              <p className="mt-2 text-sm leading-6 tp-text-soft">
                Use the contact page when the search results do not answer what you need.
              </p>
            </Link>
            <Link href="/care-guide" className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4 transition hover:border-[var(--tp-accent)]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-accent">
                Care
              </div>
              <div className="mt-3 text-lg font-semibold tp-heading">Upload a plant challenge</div>
              <p className="mt-2 text-sm leading-6 tp-text-soft">
                If the issue is visual, the care guide lets you upload a photo and explain the problem.
              </p>
            </Link>
            <Link href="/studio" className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4 transition hover:border-[var(--tp-accent)]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-accent">
                Studio
              </div>
              <div className="mt-3 text-lg font-semibold tp-heading">Ask for guided sourcing</div>
              <p className="mt-2 text-sm leading-6 tp-text-soft">
                Use Studio when you need help choosing the right form for a specific room or project.
              </p>
            </Link>
          </div>
        ) : null}

        <div className="mt-8">
          {!query ? (
            <div className="rounded-[2rem] border tp-card p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <Sparkles className="h-6 w-6 tp-accent" />
              </div>
              <div className="mt-5 serif-display text-4xl tp-heading">Start with a simple question</div>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 tp-text-soft">
                You can search by product name, plant, delivery question, sign-in problem, payment method, or care issue. If you only want guidance, switch on help-first before you search.
              </p>
            </div>
          ) : searchState.results.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {searchState.results.map((entry) => {
                const tone = resultTone(entry.category);

                return (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className="group rounded-[2rem] border tp-card p-5 transition hover:-translate-y-1 hover:border-[var(--tp-accent)]"
                  >
                    {entry.image ? (
                      <div className="relative mb-4 h-48 overflow-hidden rounded-[1.5rem] bg-[var(--tp-surface)]">
                        <Image
                          src={entry.image}
                          alt={entry.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                        style={{ background: tone.bg, color: tone.text }}
                      >
                        {entry.label}
                      </span>
                      <ArrowRight className="h-4 w-4 tp-text-muted transition group-hover:translate-x-1 group-hover:text-[var(--tp-accent)]" />
                    </div>

                    <div className="mt-4 serif-display text-3xl leading-tight tp-heading">
                      {entry.title}
                    </div>
                    <p className="mt-3 text-sm leading-7 tp-text-soft">{entry.summary}</p>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] tp-accent">
                      Open answer
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border tp-card p-10 text-center">
              <div className="serif-display text-4xl tp-heading">No direct answer yet</div>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 tp-text-soft">
                Try a simpler phrase, switch on help-first, or open direct help below if you want us to guide you personally.
              </p>
              <button
                type="button"
                onClick={() => setShowContactFallback(true)}
                className="btn-primary mt-6"
              >
                Show direct help
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
