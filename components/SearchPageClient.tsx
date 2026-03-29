'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export function SearchPageClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.short,
        product.sku,
        product.details?.shape,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [products, query]);

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
          Find a Form
        </div>
        <h1 className="mt-4 serif-display text-5xl tp-heading md:text-6xl">
          Search
        </h1>
        <div className="relative mx-auto mt-8 max-w-2xl">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 tp-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clay forms, plant pairings, SKUs, or shapes..."
            className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] py-5 pl-14 pr-5 text-[var(--tp-heading)] shadow-[var(--tp-shadow-soft)] outline-none transition focus:border-[var(--tp-accent)]"
          />
        </div>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 tp-text-soft">
          {query
            ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`
            : 'Start typing to search across all visible TuloPots forms.'}
        </p>
      </div>

      <div className="mt-10">
        {!query ? (
          <div className="rounded-[2rem] border tp-card p-10 text-center">
            <div className="serif-display text-4xl tp-heading">Start with a cue</div>
            <p className="mt-3 text-sm leading-7 tp-text-soft">
              Try a product name, plant type, shape, collection, or SKU such as
              <span className="tp-heading"> TP-GLOBE-SM-001</span>.
            </p>
          </div>
        ) : results.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} collection />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border tp-card p-10 text-center">
            <div className="serif-display text-4xl tp-heading">No results yet</div>
            <p className="mt-4 text-sm leading-7 tp-text-soft">
              Try another product name, plant type, shape, or collection cue.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
