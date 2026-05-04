'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowUpRight, Check, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { money } from '@/lib/utils';
import { useStore } from './Providers';

function getUseTag(product: any) {
  const name = `${product?.name || ''} ${product?.short || ''}`.toLowerCase();
  const category = `${product?.category || ''}`.toLowerCase();

  if (name.includes('peace lily')) return 'Calm Presence';
  if (name.includes('snake plant')) return 'Corner Calm';
  if (name.includes('succulent')) return 'Table Calm';
  if (name.includes('pothos')) return 'Soft Movement';
  if (name.includes('monstera')) return 'Room Presence';
  if (name.includes('bamboo')) return 'Entry Rhythm';
  if (name.includes('bougainvillea')) return 'Patio Presence';
  if (name.includes('palm')) return 'Open-Space Anchor';
  if (name.includes('fiddle')) return 'Vertical Presence';
  if (name.includes('aloe')) return 'Light-Filled Calm';
  if (name.includes('bird of paradise')) return 'Bold Presence';

  if (category === 'outdoor') return 'Open-Space Piece';
  if (category === 'indoor') return 'Interior Piece';
  if (category === 'pots') {
    if (name.includes('bowl')) return 'Table Presence';
    if (name.includes('jug')) return 'Shelf Presence';
    if (name.includes('cylinder')) return 'Vertical Presence';
    if (name.includes('globe')) return 'Rounded Presence';
    if (name.includes('wide rim')) return 'Entry Presence';
    if (name.includes('set')) return 'Layered Placement';
    return 'Placement Ready';
  }

  return 'Placed Piece';
}

export function ProductCard({ product }: any) {
  const { addToCart, toggleWishlist, wishlist, theme, user } = useStore();

  const inWishlist = wishlist.includes(product.slug);
  const [added, setAdded] = useState(false);

  const useTag = useMemo(() => getUseTag(product), [product]);
  const isLight = theme === 'light';
  const displayCurrency = user?.preferredCurrency || 'KES';
  const displayLanguage = user?.preferredLanguage || 'en';
  const displayPrice = money(product.price, {
    currency: displayCurrency,
    language: displayLanguage,
  });
  const basePrice = displayCurrency === 'KES' ? null : money(product.price);
  const displayBadge =
    product.category === 'pots' && String(product.badge || '').toLowerCase() === 'clay form'
      ? ''
      : product.badge;

  function handleAdd() {
    addToCart(product, { quantity: 1 });
    setAdded(true);
  }

  const topChipBg = isLight ? 'rgba(255,255,255,0.88)' : 'rgba(20,12,8,0.82)';
  const topChipText = isLight ? 'var(--tp-heading)' : 'var(--tp-heading)';
  const topChipBorder = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.18)';
  const topChipShadow = isLight
    ? '0 6px 16px rgba(0,0,0,0.08)'
    : '0 8px 20px rgba(0,0,0,0.28)';

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border tp-border tp-card tp-shadow-soft transition duration-500 hover:-translate-y-2 hover:tp-shadow">
      {/* ── IMAGE AREA ─────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition duration-700 group-hover:scale-110 group-hover:blur-[3px]"
        />

        {/* dark scrim — stronger on hover */}
        <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/45" />

        {/* bottom gradient for name readout */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/65 via-black/18 to-transparent transition duration-500 group-hover:from-black/30 group-hover:via-transparent" />

        {/* ── HOVER: centred VIEW button ──────────────────────────────── */}
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100"
          aria-label={`View ${product.name}`}
          tabIndex={-1}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-lg transition duration-300 group-hover:scale-100 scale-90"
            style={{
              background: 'var(--tp-accent)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.30)',
            }}
          >
            View Item
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* wishlist button */}
        <button
          onClick={() => toggleWishlist(product.slug)}
          aria-label="Toggle wishlist"
          className="absolute right-4 top-4 z-30 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 transition hover:scale-105"
          style={{
            background: 'var(--tp-surface)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          <Heart
            className="h-4 w-4"
            style={{
              color: inWishlist ? 'var(--tp-accent)' : 'var(--tp-text-muted)',
              fill: inWishlist ? 'var(--tp-accent)' : 'none',
            }}
          />
        </button>

        {/* top chips */}
        <div className="pointer-events-none absolute left-5 top-5 z-10 flex flex-wrap gap-2">
          {displayBadge ? (
            <span
              className="inline-flex rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: topChipBg,
                color: topChipText,
                borderColor: topChipBorder,
                backdropFilter: 'blur(10px)',
                boxShadow: topChipShadow,
              }}
            >
              {displayBadge}
            </span>
          ) : null}

          <span
            className="inline-flex rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: topChipBg,
              color: topChipText,
              borderColor: topChipBorder,
              backdropFilter: 'blur(10px)',
              boxShadow: topChipShadow,
            }}
          >
            {useTag}
          </span>
        </div>

        {/* bottom name strip */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 transition duration-500 group-hover:opacity-0">
          <div className="serif-display text-[1.5rem] leading-none text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
            {product.name}
          </div>
          {product.short ? (
            <p className="mt-2 max-w-[85%] text-xs italic text-white/80">
              {product.short}
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
              {product.reviews || 0} review{product.reviews === 1 ? '' : 's'} ·{' '}
              {Number(product.rating || 0).toFixed(1)} rating
            </div>
            <p className="mt-3 serif-display text-[1.9rem] leading-none tp-heading">
              {displayPrice}
            </p>
            {basePrice ? <p className="mt-2 text-xs tp-text-muted">{basePrice}</p> : null}
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold tp-border tp-surface">
            <Star className="h-3.5 w-3.5 fill-[var(--tp-accent-strong)] text-[var(--tp-accent-strong)]" />
            <span className="tp-heading">{Number(product.rating || 0).toFixed(1)}</span>
            <span className="tp-text-muted">({product.reviews || 0})</span>
          </div>
        </div>

        {!added ? (
          <div className="mt-5 grid gap-3">
            <Link
              href={`/product/${product.slug}`}
              className="btn-primary cursor-hover inline-flex min-h-[46px] items-center justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
            >
              View Item
            </Link>

            <button
              onClick={handleAdd}
              className="btn-secondary cursor-hover min-h-[46px] justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
            >
              Add to Cart
            </button>
          </div>
        ) : (
          <>
            <div
              className="mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm"
              style={{
                background: 'var(--tp-surface)',
                color: 'var(--tp-text-soft)',
              }}
            >
              <Check className="h-4 w-4 tp-accent" />
              Added to cart
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setAdded(false)}
                className="btn-secondary cursor-hover inline-flex min-h-[46px] items-center justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
              >
                Remove
              </button>

              <Link
                href="/cart"
                className="btn-primary cursor-hover inline-flex min-h-[46px] items-center justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
