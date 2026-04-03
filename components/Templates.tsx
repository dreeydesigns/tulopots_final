'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Product, studioCard as studioCardDef } from '@/lib/products';
import { Breadcrumbs } from './Breadcrumbs';
import { ProductCard } from './ProductCard';
import { useStore } from './Providers';

type GuideSelection = {
  enabled: boolean;
  placement?: string;
  intent?: string;
  forWhom?: string;
};

function scoreGuideMatch(product: Product, guide?: GuideSelection) {
  if (!guide?.enabled) {
    return 0;
  }

  const text = [
    product.name,
    product.short,
    product.description,
    product.cardDescription,
    product.details?.shape,
    product.size,
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;

  switch (guide.placement) {
    case 'living':
      if (['small', 'medium'].includes(product.size)) score += 2;
      if (/round|globe|bowl|belly|wide rim|wide-set/.test(text)) score += 3;
      break;
    case 'office':
      if (['small', 'medium'].includes(product.size)) score += 2;
      if (/cylinder|column|vertical|tapered|jug/.test(text)) score += 3;
      break;
    case 'outdoor':
      if (['large', 'decorative', 'sets'].includes(product.size)) score += 2;
      if (/outdoor|patio|terrace|garden|hut|studio|ribbed/.test(text)) score += 4;
      break;
    default:
      score += 1;
  }

  switch (guide.intent) {
    case 'grounds':
      if (['medium', 'large'].includes(product.size)) score += 2;
      if (/grounded|rounded|belly|globe|wide/.test(text)) score += 3;
      break;
    case 'statement':
      if (['large', 'decorative', 'sets'].includes(product.size)) score += 2;
      if (/statement|sculptural|hut|column|tall|ribbed|pedestal/.test(text)) score += 4;
      break;
    case 'plants':
      if (!product.decorative) score += 3;
      if (/planter|bowl|globe|wide rim|deep|ready/.test(text)) score += 2;
      break;
    default:
      score += 1;
  }

  switch (guide.forWhom) {
    case 'designer':
      if ((product.reviews || 0) >= 18) score += 2;
      if ((product.rating || 0) >= 4.5) score += 2;
      if (['large', 'decorative', 'sets'].includes(product.size)) score += 1;
      break;
    case 'workplace':
      if (/cylinder|column|vertical|clean|studio/.test(text)) score += 3;
      if (['small', 'medium'].includes(product.size)) score += 1;
      break;
    case 'gift':
      if (['small', 'medium'].includes(product.size)) score += 2;
      if ((product.reviews || 0) >= 14) score += 2;
      if (product.price <= 2200) score += 1;
      break;
    default:
      score += 1;
  }

  score += Math.min(Math.round((product.reviews || 0) / 12), 3);
  return score;
}

export function CollectionTemplate({
  route,
  title,
  intro,
  facts,
  filters,
  products,
  studioCard,
  guideSelection,
}: {
  route: string;
  title: string;
  intro: string;
  facts: string[];
  filters: string[];
  products: Product[];
  showing: string;
  studioCard?: typeof studioCardDef;
  guideSelection?: GuideSelection;
}) {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [sort, setSort] = useState('featured');
  const [guideActive, setGuideActive] = useState(Boolean(guideSelection?.enabled));
  const { isLoggedIn } = useStore();

  useEffect(() => {
    if (!guideSelection?.enabled || route !== 'pots') {
      return;
    }

    setGuideActive(true);

    if (guideSelection.intent === 'statement') {
      setActiveFilter('statement');
      setSort('guide');
      return;
    }

    if (guideSelection.placement === 'outdoor') {
      setActiveFilter('large');
      setSort('guide');
      return;
    }

    if (guideSelection.forWhom === 'gift') {
      setActiveFilter('small');
      setSort('guide');
      return;
    }

    setSort('guide');
  }, [guideSelection, route]);

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
      if (filter === 'most chosen') {
        list = list
          .filter((p) => (p.reviews || 0) >= 18 || (p.rating || 0) >= 4.5)
          .sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      }
      if (['small', 'medium', 'large'].includes(filter)) {
        list = list.filter((p) => p.size === filter);
      }
      if (filter === 'statement') {
        list = list.filter(
          (p) =>
            p.size === 'large' ||
            p.decorative ||
            /column|pedestal|wide|ribbed|hut/i.test(`${p.name} ${p.short}`)
        );
      }
      if (filter === 'decorative') {
        list = list.filter((p) => p.decorative);
      }
      if (filter === 'sets') {
        list = list.filter((p) => p.size === 'sets');
      }
    }

    if (guideActive && route === 'pots' && guideSelection?.enabled) {
      const scored = list
        .map((product) => ({
          product,
          score: scoreGuideMatch(product, guideSelection),
        }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            (b.product.reviews || 0) - (a.product.reviews || 0) ||
            (b.product.rating || 0) - (a.product.rating || 0)
        );

      const strongMatches = scored
        .filter((entry) => entry.score >= 5)
        .map((entry) => entry.product);

      list = strongMatches.length >= 3 ? strongMatches : scored.map((entry) => entry.product);
    }

    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    if (sort === 'newest') {
      list.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));
    }
    if (sort === 'guide' && guideSelection?.enabled) {
      list.sort(
        (a, b) =>
          scoreGuideMatch(b, guideSelection) - scoreGuideMatch(a, guideSelection) ||
          (b.reviews || 0) - (a.reviews || 0)
      );
    }

    return studioCard && isLoggedIn ? [studioCard as any, ...list] : list;
  }, [products, activeFilter, sort, route, studioCard, isLoggedIn, guideActive, guideSelection]);

  const titleFirst = title.split(' ')[0];
  const titleRest = title.split(' ').slice(1).join(' ');
  const visibleCount = visible.filter(
    (item: any) => item.slug !== 'studio-collection-request'
  ).length;

  return (
    <main className="tp-page min-h-screen">
      <section className="relative overflow-hidden border-b tp-border tp-surface pb-8 pt-28">
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
                {facts.map((fact) => (
                  <span key={fact} className="chip">
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 tp-nav-surface">
        <div className="container-shell py-4">
          {guideActive && guideSelection?.enabled && route === 'pots' ? (
            <div className="mb-4 flex flex-col gap-3 rounded-[1.35rem] border border-[var(--tp-border-strong)] bg-[var(--tp-card)] px-4 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm leading-7 tp-text-soft">
                Showing results based on your space. Not right? Browse everything.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGuideActive(false);
                  setActiveFilter(filters[0]);
                  setSort('featured');
                }}
                className="w-full rounded-full border border-[var(--tp-border-strong)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] tp-text transition hover:bg-[var(--tp-accent-soft)] md:w-auto"
              >
                Browse everything
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`min-h-[44px] rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    activeFilter === filter
                      ? 'border-[var(--tp-heading)] bg-[var(--tp-heading)] text-[var(--tp-bg)]'
                      : 'tp-border tp-surface text-[var(--tp-text-muted)] hover:border-[var(--tp-border-strong)] hover:bg-[var(--tp-accent-soft)]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 text-sm tp-text-muted sm:flex-row sm:items-center sm:gap-4">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="tp-input min-h-[44px] appearance-none rounded-full border px-4 py-2 text-xs font-medium"
                  style={{ borderWidth: '1px', paddingRight: '2rem' }}
                >
                  {guideActive && guideSelection?.enabled ? (
                    <option value="guide">Sort: Your Match</option>
                  ) : null}
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product: any) =>
            product.slug === 'studio-collection-request' ? (
              <StudioCard key={product.slug} />
            ) : (
              <ProductCard key={product.slug} product={product} />
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
