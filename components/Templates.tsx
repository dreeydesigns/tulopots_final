'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Product, studioCard as studioCardDef } from '@/lib/products';
import { Breadcrumbs } from './Breadcrumbs';
import { ProductCard } from './ProductCard';
import { useStore } from './Providers';
import Link from 'next/link';

export function CollectionTemplate({
  route,
  title,
  intro,
  facts,
  filters,
  products,
  showing,
  studioCard,
}: {
  route: string;
  title: string;
  intro: string;
  facts: string[];
  filters: string[];
  products: Product[];
  showing: string;
  studioCard?: typeof studioCardDef;
}) {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [sort, setSort] = useState('featured');
  const { isLoggedIn } = useStore();

  const visible = useMemo(() => {
    let list = [...products];
    const filter = activeFilter.toLowerCase();

    if (route === 'indoor') {
      if (['small', 'medium', 'large'].includes(filter)) {
        list = list.filter((p) => p.size === filter);
      }
      if (filter === 'new arrivals') {
        list = list.filter((p) => p.badge?.toLowerCase() === 'new');
      }
    }

    if (route === 'outdoor') {
      if (['medium', 'large'].includes(filter)) {
        list = list.filter((p) => p.size === filter);
      }
      if (filter === 'decorative') {
        list = list.filter((p) => p.decorative);
      }
      if (filter === 'new arrivals') {
        list = list.filter((p) => p.badge?.toLowerCase() === 'new');
      }
    }

    if (route === 'pots') {
      if (['small', 'medium', 'large'].includes(filter)) {
        list = list.filter((p) => p.size === filter);
      }
      if (filter === 'decorative') {
        list = list.filter((p) => p.decorative);
      }
      if (filter === 'sets') {
        list = list.filter((p) => p.size === 'sets');
      }
    }

    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    if (sort === 'newest') {
      list.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));
    }

    return studioCard && isLoggedIn ? [studioCard as any, ...list] : list;
  }, [products, activeFilter, sort, route, studioCard, isLoggedIn]);

  const titleFirst = title.split(' ')[0];
  const titleRest = title.split(' ').slice(1).join(' ');
  const visibleCount = visible.filter(
    (item: any) => item.slug !== 'studio-collection-request'
  ).length;

  return (
    <main className="tp-page min-h-screen">
      <section className="relative overflow-hidden tp-surface border-b tp-border pb-8 pt-28">
        <div className="container-shell">
          <Breadcrumbs items={[['Home', '/'], [title, `/${route}`]]} />

          <div className="relative mt-6">
            <div
              className="pointer-events-none absolute -right-4 -top-8 hidden select-none serif-display leading-none lg:block"
              style={{ color: 'var(--tp-border)', fontSize: 'clamp(7rem, 13vw, 11rem)' }}
            >
              {titleFirst}
            </div>

            <div className="relative max-w-2xl">
              <h1 className="serif-display text-5xl leading-tight tp-heading md:text-6xl">
                {titleFirst} <span className="italic tp-accent">{titleRest}</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 tp-text-soft">{intro}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {facts.map((f) => (
                  <span key={f} className="chip">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 tp-nav-surface">
        <div className="container-shell py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    activeFilter === filter
                      ? 'border-[var(--tp-heading)] bg-[var(--tp-heading)] text-[var(--tp-bg)]'
                      : 'tp-border tp-surface text-[var(--tp-text-muted)] hover:bg-[var(--tp-accent-soft)] hover:border-[var(--tp-border-strong)]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm tp-text-muted">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="tp-input appearance-none rounded-full border px-4 py-2 text-xs font-medium"
                  style={{ borderWidth: '1px', paddingRight: '2rem' }}
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5"
                  style={{ transform: 'translateY(-50%)', color: 'var(--tp-text-muted)' }}
                />
              </div>

              <span className="text-xs">
                Showing {visibleCount} of {products.length} products
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product: any) =>
            product.slug === 'studio-collection-request' ? (
              <StudioCard key={product.slug} />
            ) : (
              <ProductCard key={product.slug} product={product} collection />
            )
          )}
        </div>
      </section>
    </main>
  );
}

function StudioCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-dashed tp-border tp-card p-8 shadow-sm">
      <div
        className="w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{ background: 'var(--tp-heading)', color: 'var(--tp-bg)' }}
      >
        Members Only
      </div>

      <h3 className="mt-5 serif-display text-4xl tp-heading">Studio Collection</h3>

      <p className="mt-4 flex-1 text-sm leading-7 tp-text-soft">
        Upload inspirations, choose quantities, and begin a guided custom-order
        conversation that sends your brief to the studio team.
      </p>

      <Link href="/studio" className="btn-primary mt-8 inline-flex">
        Open Studio Collection
      </Link>
    </div>
  );
}