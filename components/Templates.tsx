'use client';
import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Product, studioCard as studioCardDef } from '@/lib/products';
import { Breadcrumbs } from './Breadcrumbs';
import { ProductCard } from './ProductCard';
import { useStore } from './Providers';
import Link from 'next/link';

export function CollectionTemplate({
  route, title, intro, facts, filters, products, showing, studioCard,
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
      if (['small', 'medium', 'large'].includes(filter)) list = list.filter((p) => p.size === filter);
      if (filter === 'new arrivals') list = list.filter((p) => p.badge?.toLowerCase() === 'new');
    }
    if (route === 'outdoor') {
      if (['medium', 'large'].includes(filter)) list = list.filter((p) => p.size === filter);
      if (filter === 'decorative') list = list.filter((p) => p.decorative);
      if (filter === 'new arrivals') list = list.filter((p) => p.badge?.toLowerCase() === 'new');
    }
    if (route === 'pots') {
      if (['small', 'medium', 'large'].includes(filter)) list = list.filter((p) => p.size === filter);
      if (filter === 'decorative') list = list.filter((p) => p.decorative);
      if (filter === 'sets') list = list.filter((p) => p.size === 'sets');
    }

    if (sort === 'low')    list.sort((a, b) => a.price - b.price);
    if (sort === 'high')   list.sort((a, b) => b.price - a.price);
    if (sort === 'newest') list.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));

    return studioCard && isLoggedIn ? [studioCard as any, ...list] : list;
  }, [products, activeFilter, sort, route, studioCard, isLoggedIn]);

  const titleFirst = title.split(' ')[0];
  const titleRest  = title.split(' ').slice(1).join(' ');
  const visibleCount = visible.filter((item: any) => item.slug !== 'studio-collection-request').length;

  return (
    <main className="min-h-screen bg-[#faf7f4]">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-[#e8dccf] bg-white pb-8 pt-28">
        <div className="container-shell">
          <Breadcrumbs items={[['Home', '/'], [title, `/${route}`]]} />

          <div className="relative mt-6">
            {/* Ghost watermark */}
            <div
              className="pointer-events-none absolute -right-4 -top-8 hidden select-none serif-display leading-none text-[#f0e8e0] lg:block"
              style={{ fontSize: 'clamp(7rem, 13vw, 11rem)' }}
            >
              {titleFirst}
            </div>

            {/* Title + intro */}
            <div className="relative max-w-2xl">
              <h1 className="serif-display text-5xl leading-tight text-[#2d1e16] md:text-6xl">
                {titleFirst}{' '}
                <span className="italic text-[#B66A3C]">{titleRest}</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-8 text-[#7a6b5f]">{intro}</p>

              {/* Fact chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {facts.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[#e4d5c5] bg-[#fdf8f4] px-4 py-1.5 text-xs text-[#7a6d60]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter + sort bar */}
      <section className="sticky top-16 z-30 border-b border-[#e8dccf] bg-white/95 backdrop-blur-sm">
        <div className="container-shell py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    activeFilter === filter
                      ? 'border-[#3d2a1e] bg-[#3d2a1e] text-white'
                      : 'border-[#e0d0c2] bg-white text-[#8a7a6d] hover:border-[#c4a98a] hover:bg-[#faf5f0]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Sort + count */}
            <div className="flex items-center gap-4 text-sm text-[#8a7a6d]">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-full border border-[#e0d0c2] bg-white py-2 pl-4 pr-8 text-xs font-medium text-[#5a4a3f] outline-none"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a7a6d]" />
              </div>
              <span className="text-xs">
                Showing {visibleCount} of {products.length} products
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
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
    <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-dashed border-[#c9ad93] bg-[#fff7f0] p-8 shadow-sm">
      <div className="w-fit rounded-full bg-[#5A3422] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
        Members Only
      </div>
      <h3 className="mt-5 serif-display text-4xl text-[#4a3428]">Studio Collection</h3>
      <p className="mt-4 flex-1 text-sm leading-7 text-[#735f51]">
        Upload inspirations, choose quantities, and begin a guided custom-order conversation that sends your brief to the studio team.
      </p>
      <Link href="/studio" className="btn-primary mt-8 inline-flex">
        Open Studio Collection
      </Link>
    </div>
  );
}
