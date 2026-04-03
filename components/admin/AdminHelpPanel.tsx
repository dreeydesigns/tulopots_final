'use client';

import Link from 'next/link';
import { ArrowRight, LifeBuoy, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ManagedPageRecord } from '@/lib/cms';
import { getAdminHelpEntries } from '@/lib/admin-help';
import { searchEntries } from '@/lib/search-utils';

const quickPrompts = [
  'add product',
  'change product image',
  'order status',
  'edit about page',
  'newsletter',
  'studio brief',
  'hide a section',
  'export csv',
];

const featuredHelpIds = [
  'admin-help:add-product',
  'admin-help:orders',
  'admin-help:content',
  'admin-help:newsletter',
];

export function AdminHelpPanel({
  managedPages,
}: {
  managedPages: ManagedPageRecord[];
}) {
  const [query, setQuery] = useState('');

  const entries = useMemo(() => getAdminHelpEntries(managedPages), [managedPages]);
  const featuredEntries = useMemo(
    () => entries.filter((entry) => featuredHelpIds.includes(entry.id)),
    [entries]
  );

  const searchState = useMemo(() => {
    if (!query.trim()) {
      return {
        suggestedQuery: null as string | null,
        appliedQuery: '',
        results: [] as typeof entries,
      };
    }

    const state = searchEntries(query, entries, 18);
    return {
      suggestedQuery: state.suggestedQuery,
      appliedQuery: state.appliedQuery,
      results: state.results.slice(0, 6),
    };
  }, [entries, query]);

  return (
    <div
      className="mb-6 rounded-[2rem] border p-6 md:p-7"
      style={{
        background: 'color-mix(in srgb, var(--tp-surface) 92%, black 8%)',
        borderColor: 'color-mix(in srgb, var(--tp-border) 68%, transparent 32%)',
      }}
    >
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: 'var(--tp-accent)' }}
          >
            Admin Help Search
          </div>
          <div
            className="mt-2 text-sm leading-7"
            style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}
          >
            Type what you are trying to do. Spelling does not need to be perfect. The search will
            point you to the right place and explain the steps simply.
          </div>
        </div>

        <div className="rounded-full border px-4 py-2 text-xs" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}>
          For data entry, social media, operations, and admin support
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try: add product, chnage image, where is newsletter, order status..."
          className="w-full rounded-[1rem] border px-4 py-3 pl-11 text-sm outline-none"
          style={{
            borderColor: 'var(--tp-border)',
            background: 'var(--tp-card)',
            color: 'var(--tp-heading)',
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setQuery(prompt)}
            className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{
              borderColor: 'var(--tp-border)',
              background: 'var(--tp-card)',
              color: 'var(--tp-heading)',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {!query.trim() ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {featuredEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[1.5rem] border p-5"
              style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: 'var(--tp-accent)' }}
                  >
                    {entry.destination}
                  </div>
                  <div
                    className="mt-2 text-lg font-semibold"
                    style={{ color: 'var(--tp-heading)' }}
                  >
                    {entry.title}
                  </div>
                </div>
                <Sparkles className="h-5 w-5" style={{ color: 'var(--tp-accent)' }} />
              </div>
              <div className="mt-3 text-sm leading-7 tp-text-soft">{entry.summary}</div>
              <Link
                href={entry.href}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
              >
                {entry.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : searchState.results.length ? (
        <div className="mt-6 space-y-4">
          <div
            className="text-sm"
            style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}
          >
            {searchState.results.length} result{searchState.results.length === 1 ? '' : 's'} for
            {' '}
            “{query}”
            {searchState.suggestedQuery ? (
              <span style={{ color: 'var(--tp-heading)' }}>
                . Showing the closest match for “{searchState.suggestedQuery}”.
              </span>
            ) : null}
          </div>

          {searchState.results.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[1.5rem] border p-5"
              style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: 'var(--tp-accent)' }}
                  >
                    {entry.destination}
                  </div>
                  <div
                    className="mt-2 text-xl font-semibold"
                    style={{ color: 'var(--tp-heading)' }}
                  >
                    {entry.title}
                  </div>
                  <div className="mt-3 text-sm leading-7 tp-text-soft">{entry.summary}</div>
                </div>

                <Link
                  href={entry.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                >
                  {entry.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 grid gap-2">
                {entry.steps.map((step, index) => (
                  <div
                    key={`${entry.id}-${index}`}
                    className="flex gap-3 rounded-[1rem] border px-4 py-3 text-sm"
                    style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}
                  >
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                      style={{ background: 'var(--tp-accent-soft)', color: 'var(--tp-accent)' }}
                    >
                      {index + 1}
                    </div>
                    <div className="leading-7" style={{ color: 'var(--tp-heading)' }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="mt-6 rounded-[1.5rem] border p-6"
          style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
        >
          <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--tp-heading)' }}>
            <LifeBuoy className="h-5 w-5" style={{ color: 'var(--tp-accent)' }} />
            No clear match yet
          </div>
          <div className="mt-3 text-sm leading-7 tp-text-soft">
            Try a shorter phrase like “product image”, “newsletter”, “order status”, or “edit
            page”. The search will correct small spelling mistakes, so simple words work best.
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin?tab=overview"
              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
            >
              Go to Overview
            </Link>
            <Link
              href="/admin/content"
              className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: 'var(--tp-border)',
                background: 'var(--tp-surface)',
                color: 'var(--tp-heading)',
              }}
            >
              Open Content Workspace
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
