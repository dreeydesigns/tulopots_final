'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowUpRight, Minus, Plus, Check, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from './Providers';

function formatPrice(price: number | string) {
  return `KSh ${Number(price).toLocaleString('en-KE')}`;
}

function getUseTag(product: any) {
  const name = `${product?.name || ''} ${product?.short || ''}`.toLowerCase();
  const category = `${product?.category || ''}`.toLowerCase();

  if (name.includes('peace lily')) return 'Desk Green';
  if (name.includes('snake plant')) return 'Corner Calm';
  if (name.includes('succulent')) return 'Shelf Style';
  if (name.includes('pothos')) return 'Easy Green';
  if (name.includes('monstera')) return 'Statement Pot';
  if (name.includes('bamboo')) return 'Entry Style';
  if (name.includes('bougainvillea')) return 'Patio Piece';
  if (name.includes('palm')) return 'Corner Piece';
  if (name.includes('fiddle')) return 'Room Lift';
  if (name.includes('aloe')) return 'Calm Accent';
  if (name.includes('bird of paradise')) return 'Patio Green';

  if (category === 'outdoor') return 'Patio Piece';
  if (category === 'indoor') return 'Desk Green';
  if (category === 'pots') {
    if (name.includes('bowl')) return 'Table Centre';
    if (name.includes('jug')) return 'Shelf Accent';
    if (name.includes('cylinder')) return 'Corner Height';
    if (name.includes('globe')) return 'Rounded Presence';
    if (name.includes('wide rim')) return 'Entry Presence';
    if (name.includes('set')) return 'Layered Styling';
    return 'Placement Ready';
  }

  return 'Home Piece';
}

export function ProductCard({ product }: any) {
  const { addToCart, toggleWishlist, wishlist, theme } = useStore();

  const inWishlist = wishlist.includes(product.slug);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const useTag = useMemo(() => getUseTag(product), [product]);
  const isLight = theme === 'light';
  const displayBadge =
    product.category === 'pots' && String(product.badge || '').toLowerCase() === 'pot only'
      ? ''
      : product.badge;

  function handleAdd() {
    addToCart(product, { quantity: qty });
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
      <div className="relative h-[390px] overflow-hidden tp-surface-soft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-black/10 opacity-0 transition duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/55 via-black/12 to-transparent opacity-70 transition duration-500 group-hover:opacity-100" />

        <button
          onClick={() => toggleWishlist(product.slug)}
          aria-label="Toggle wishlist"
          className="absolute right-4 top-4 z-20 rounded-full p-2.5 transition hover:scale-105"
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

        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="serif-display text-[1.5rem] leading-none text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                {product.name}
              </div>

              {product.short ? (
                <p className="mt-2 max-w-[85%] text-xs italic text-white/80">
                  {product.short}
                </p>
              ) : null}
            </div>

            <Link
              href={`/product/${product.slug}`}
              className="cursor-hover inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
              style={{
                background: 'rgba(255,255,255,0.14)',
                borderColor: 'rgba(255,255,255,0.24)',
                color: 'var(--tp-btn-primary-text)',
                backdropFilter: 'blur(8px)',
              }}
              aria-label={`View ${product.name}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
              Handcrafted terracotta
            </div>
            <p className="mt-3 serif-display text-[1.9rem] leading-none tp-heading">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold tp-border tp-surface">
            <Star className="h-3.5 w-3.5 fill-[var(--tp-accent-strong)] text-[var(--tp-accent-strong)]" />
            <span className="tp-heading">{Number(product.rating || 0).toFixed(1)}</span>
            <span className="tp-text-muted">({product.reviews || 0})</span>
          </div>
        </div>

        {!added ? (
          <>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-full border tp-border tp-surface px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full tp-text-muted transition hover:tp-heading"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="text-xs font-semibold uppercase tracking-[0.16em] tp-heading">
                Qty {qty}
              </div>

              <button
                onClick={() => setQty((q) => q + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full tp-text-muted transition hover:tp-heading"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleAdd}
                className="btn-primary cursor-hover justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
              >
                Add to Cart
              </button>

              <Link
                href={`/product/${product.slug}`}
                className="btn-secondary cursor-hover inline-flex items-center justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
              >
                View Item
              </Link>
            </div>
          </>
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

            <div className="mt-4 flex items-center justify-between gap-3 rounded-full border tp-border tp-surface px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full tp-text-muted transition hover:tp-heading"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="text-xs font-semibold uppercase tracking-[0.16em] tp-heading">
                Qty {qty}
              </div>

              <button
                onClick={() => setQty((q) => q + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full tp-text-muted transition hover:tp-heading"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setAdded(false)}
                className="btn-secondary cursor-hover inline-flex items-center justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
              >
                Remove
              </button>

              <Link
                href="/cart"
                className="btn-primary cursor-hover inline-flex items-center justify-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
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
