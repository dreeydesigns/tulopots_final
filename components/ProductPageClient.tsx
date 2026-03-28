'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Minus,
  Plus,
  Star,
  ChevronDown,
  ChevronLeft,
  Leaf,
  Shield,
  Truck,
  Check,
} from 'lucide-react';
import { Product, products, sizeOptionsFor } from '@/lib/products';
import { money } from '@/lib/utils';
import { Breadcrumbs } from './Breadcrumbs';
import { ProductCard } from './ProductCard';
import { useStore } from './Providers';

export function ProductPageClient({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, isLoggedIn, setIsLoggedIn } = useStore();

  const defaultMode = product.forcePotOnly || product.decorative ? 'pot' : 'plant';
  const [mode, setMode] = useState<'plant' | 'pot'>(defaultMode);

  const sizes = sizeOptionsFor(product);
  const [selected, setSelected] = useState(
    sizes[Math.min(1, sizes.length - 1)]?.key || sizes[0].key
  );

  const [qty, setQty] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(!!product.plantGuide);
  const [justAdded, setJustAdded] = useState(false);

  const gallery = [product.image, product.image, product.image, product.image];
  const [activeImage, setActiveImage] = useState(gallery[0]);

  const size = sizes.find((s) => s.key === selected) || sizes[0];
  const unit = Math.round(
    (mode === 'plant' ? product.price : product.potOnly || product.price) * size.multiplier
  );
  const total = unit * qty;

  const related = useMemo(
    () => products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 2),
    [product]
  );

  const canToggleModes = !product.forcePotOnly && !product.decorative && !!product.potOnly;
  const reviewGate = true;

  const sizeSummary =
    mode === 'plant'
      ? `${size.label} · styled ready for display`
      : `${size.label} · pot-only option`;

  function handleAddToCart() {
    addToCart(product, {
      mode,
      quantity: qty,
      unitPrice: unit,
      sizeLabel: size.label,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  }

  return (
    <main className="container-shell py-10 md:py-16">
      <Breadcrumbs
        items={[
          ['Home', '/'],
          [
            product.category === 'indoor'
              ? 'Indoor Plants'
              : product.category === 'outdoor'
              ? 'Outdoor Plants'
              : 'Pots Only',
            `/${product.category}`,
          ],
          [product.name, `/product/${product.slug}`],
        ]}
      />

      <Link
        href={`/${product.category}`}
        className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-[var(--tp-text)]/65 transition hover:text-[var(--tp-heading)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {product.category}
      </Link>

      <section className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT */}
        <div>
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] shadow-[0_18px_50px_rgba(90,52,34,0.08)]">
            {product.badge && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-[#e9f3ea] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5b6f60]">
                {product.badge}
              </span>
            )}

            <button
              onClick={() => (isLoggedIn ? toggleWishlist(product.slug) : setIsLoggedIn(true))}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/95 p-3 shadow-md transition hover:scale-110"
              aria-label="Add to wishlist"
            >
              <Heart
                className={`h-5 w-5 ${
                  wishlist.includes(product.slug)
                    ? 'fill-[#B66A3C] text-[#B66A3C]'
                    : 'text-[#9b8575]'
                }`}
              />
            </button>

            <div className="relative">
              <Image
                src={activeImage}
                alt={product.name}
                width={1000}
                height={1200}
                className="h-[32rem] w-full object-cover transition duration-500 md:h-[40rem]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`overflow-hidden rounded-[1.25rem] border transition ${
                  activeImage === img
                    ? 'border-[#B66A3C] shadow-[0_10px_25px_rgba(182,106,60,0.16)]'
                    : 'border-[var(--tp-border)] hover:border-[#c9b8aa]'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  width={400}
                  height={400}
                  className="h-24 w-full object-cover transition duration-500 hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="h-fit lg:sticky lg:top-28">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--tp-text)]/60">
            {product.sku}
          </div>

          <h1 className="mt-4 serif-display text-5xl leading-[0.95] text-[var(--tp-heading)] md:text-6xl">
            {product.name}
          </h1>

          <div className="mt-4 max-w-xl text-base italic text-[#B66A3C]">{product.short}</div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(product.rating)
                      ? 'fill-[#f0b400] text-[#f0b400]'
                      : 'text-[#dfd2c8]'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-[var(--tp-text)]/65">
              {product.rating.toFixed(1)} ({product.reviews} reviews)
            </div>
            <div className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tp-text)]/70">
              Handmade in Kenya
            </div>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <div className="serif-display text-5xl text-[var(--tp-heading)]">{money(unit)}</div>
            {canToggleModes && mode === 'plant' && product.potOnly && (
              <div className="pb-1 text-sm text-[var(--tp-text)]/60">
                Pot only: {money(Math.round(product.potOnly * size.multiplier))}
              </div>
            )}
          </div>

          <p className="mt-3 text-sm leading-7 text-[var(--tp-text)]/72">
            {sizeSummary}
          </p>

          <p className="mt-7 max-w-xl text-sm leading-8 text-[var(--tp-text)]/75">
            {product.description}
          </p>

          {canToggleModes && (
            <div className="mt-8">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/60">
                Purchase option
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('plant')}
                  className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    mode === 'plant'
                      ? 'bg-[#cf7c47] text-white'
                      : 'border border-[var(--tp-border)] bg-[var(--tp-card)] text-[var(--tp-text)]/75'
                  }`}
                >
                  With Plant
                </button>
                <button
                  onClick={() => setMode('pot')}
                  className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    mode === 'pot'
                      ? 'bg-[#5A3422] text-white'
                      : 'border border-[var(--tp-border)] bg-[var(--tp-card)] text-[var(--tp-text)]/75'
                  }`}
                >
                  Pot Only
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/60">
              Pot size
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sizes.map((s) => {
                const previewPrice = Math.round(
                  (mode === 'plant' ? product.price : product.potOnly || product.price) * s.multiplier
                );

                return (
                  <button
                    key={s.key}
                    onClick={() => setSelected(s.key)}
                    className={`rounded-[1rem] border px-4 py-3 text-left transition ${
                      selected === s.key
                        ? 'border-[#B66A3C] bg-[#fff7f0] shadow-[0_10px_22px_rgba(182,106,60,0.08)]'
                        : 'border-[var(--tp-border)] bg-[var(--tp-card)] hover:border-[#cfb39e]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[var(--tp-heading)]">{s.label}</div>
                    <div className="mt-1 text-xs text-[var(--tp-text)]/55">{s.helper}</div>
                    <div className="mt-2 text-xs font-semibold text-[#B66A3C]">
                      {money(previewPrice)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5 shadow-[0_10px_28px_rgba(90,52,34,0.06)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="inline-flex items-center self-start rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-[var(--tp-text)]/70 transition hover:text-[var(--tp-heading)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-[3rem] text-center text-sm font-medium text-[var(--tp-heading)]">
                  {qty}
                </div>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-4 py-3 text-[var(--tp-text)]/70 transition hover:text-[var(--tp-heading)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/55">
                  Total
                </div>
                <div className="mt-1 serif-display text-3xl text-[var(--tp-heading)]">
                  {money(total)}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                onClick={handleAddToCart}
                className="rounded-full bg-[#4a2d1f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:scale-[1.01] hover:bg-[#5A3422]"
              >
                {justAdded ? 'Added to Cart' : `Add to Cart — ${money(total)}`}
              </button>

              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-heading)] transition hover:border-[#c9b8aa] hover:bg-[var(--tp-card)]"
              >
                View Cart
              </Link>
            </div>

            {justAdded && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#f3ede6] px-4 py-3 text-sm text-[#5f5147]">
                <Check className="h-4 w-4 text-[#B66A3C]" />
                Added successfully. Your selection is ready in cart.
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-6 border-t border-[var(--tp-border)] pt-6 text-sm text-[var(--tp-text)]/72">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#B66A3C]" />
              Free delivery in Nairobi over KES 5,000
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#B66A3C]" />
              Secure checkout
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-[#B66A3C]" />
              Handcrafted terracotta
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
              Why customers choose this
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--tp-text)]/75 sm:grid-cols-3">
              <div className="rounded-2xl bg-[var(--tp-surface)] px-4 py-4">
                Editorial finish that elevates interiors instantly
              </div>
              <div className="rounded-2xl bg-[var(--tp-surface)] px-4 py-4">
                Crafted to feel warm, weighty, and authentically handmade
              </div>
              <div className="rounded-2xl bg-[var(--tp-surface)] px-4 py-4">
                Flexible choice between full styling or pot-only purchase
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
            <button
              onClick={() => setDetailsOpen((s) => !s)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
                Product Details
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--tp-text)]/65 transition ${
                  detailsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {detailsOpen && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[var(--tp-border)] px-5 py-5 text-sm">
                <div className="text-[var(--tp-text)]/55">Material</div>
                <div className="text-[var(--tp-heading)]">100% Natural Kenyan Clay</div>

                <div className="text-[var(--tp-text)]/55">Shape</div>
                <div className="text-[var(--tp-heading)]">{size.label}</div>

                <div className="text-[var(--tp-text)]/55">SKU</div>
                <div className="text-[var(--tp-heading)]">{product.sku}</div>

                <div className="text-[var(--tp-text)]/55">Finish</div>
                <div className="text-[var(--tp-heading)]">Natural Terracotta</div>
              </div>
            )}
          </div>

          {!!product.plantGuide && (
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
              <button
                onClick={() => setCareOpen((s) => !s)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
                  Plant Care Guide
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--tp-text)]/65 transition ${
                    careOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {careOpen && (
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[var(--tp-border)] px-5 py-5 text-sm">
                  {Object.entries(product.plantGuide).map(([k, v]) => (
                    <div key={k} className="contents">
                      <div className="capitalize text-[var(--tp-text)]/55">{k}</div>
                      <div className="text-[var(--tp-heading)]">{String(v)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/60">
              Reviews
            </div>

            {reviewGate ? (
              isLoggedIn ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[var(--tp-surface)] p-4 text-sm leading-7 text-[var(--tp-text)]/75">
                    Beautiful weight and finish. It feels handmade in the best way.
                  </div>
                  <div className="rounded-2xl bg-[var(--tp-surface)] p-4 text-sm leading-7 text-[var(--tp-text)]/75">
                    The clay tone is even richer in person and the plant pairing was spot on.
                  </div>
                  <textarea
                    className="mt-2 min-h-[110px] w-full rounded-3xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4 text-[var(--tp-heading)] outline-none transition focus:border-[#B66A3C]"
                    placeholder="Leave a review"
                  />
                  <button className="rounded-full bg-[#5A3422] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Post Review
                  </button>
                </div>
              ) : (
                <div className="text-sm leading-7 text-[var(--tp-text)]/75">
                  Sign in to read and leave reviews on this product.
                </div>
              )
            ) : (
              <div className="text-sm leading-7 text-[var(--tp-text)]/75">
                Reviews are currently disabled by admin settings.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="text-center">
          <h2 className="serif-display text-5xl text-[var(--tp-heading)]">You May Also Like</h2>
          <p className="mt-3 text-sm text-[var(--tp-text)]/65">
            Handpicked pots that complement your selection
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} collection />
          ))}
        </div>
      </section>
    </main>
  );
}