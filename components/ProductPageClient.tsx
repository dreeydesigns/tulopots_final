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
        className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-[#8b7c6f] transition hover:text-[#5A3422]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {product.category}
      </Link>

      <section className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT */}
        <div>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#efe3d6] shadow-[0_18px_50px_rgba(90,52,34,0.08)]">
            {product.badge && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-[#e9f3ea] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5b6f60]">
                {product.badge}
              </span>
            )}

            <button
              onClick={() => (isLoggedIn ? toggleWishlist(product.slug) : setIsLoggedIn(true))}
              className="absolute right-4 top-4 z-10 rounded-full bg-white p-3 shadow-md transition hover:scale-110"
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
                    : 'border-[#eaded3] hover:border-[#c9b8aa]'
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
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#9a8a7d]">
            {product.sku}
          </div>

          <h1 className="mt-4 serif-display text-5xl leading-[0.95] text-[#4a3428] md:text-6xl">
            {product.name}
          </h1>

          <div className="mt-4 text-base italic text-[#B66A3C]">{product.short}</div>

          <div className="mt-5 flex items-center gap-3">
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
            <div className="text-sm text-[#8a7a6d]">
              {product.rating.toFixed(1)} ({product.reviews} reviews)
            </div>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <div className="serif-display text-5xl text-[#3d2a20]">{money(unit)}</div>
            {canToggleModes && mode === 'plant' && product.potOnly && (
              <div className="pb-1 text-sm text-[#9a8a7d]">
                Pot only: {money(Math.round(product.potOnly * size.multiplier))}
              </div>
            )}
          </div>

          <p className="mt-7 max-w-xl text-sm leading-8 text-[#74665b]">{product.description}</p>

          {canToggleModes && (
            <div className="mt-8">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b7a6e]">
                Purchase option
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('plant')}
                  className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    mode === 'plant'
                      ? 'bg-[#cf7c47] text-white'
                      : 'border border-[#eaded3] bg-white text-[#6f6157]'
                  }`}
                >
                  With Plant
                </button>
                <button
                  onClick={() => setMode('pot')}
                  className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    mode === 'pot'
                      ? 'bg-[#5A3422] text-white'
                      : 'border border-[#eaded3] bg-white text-[#6f6157]'
                  }`}
                >
                  Pot Only
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b7a6e]">
              Pot size
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sizes.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSelected(s.key)}
                  className={`rounded-[1rem] border px-4 py-3 text-left transition ${
                    selected === s.key
                      ? 'border-[#B66A3C] bg-[#fff7f0] shadow-[0_10px_22px_rgba(182,106,60,0.08)]'
                      : 'border-[#eaded3] bg-white hover:border-[#cfb39e]'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#3d2a20]">{s.label}</div>
                  <div className="mt-1 text-xs text-[#9a8a7d]">{s.helper}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-[#e6d9cd] bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-[#7f6d60] transition hover:text-[#3d2a20]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="min-w-[3rem] text-center text-sm font-medium text-[#3d2a20]">
                {qty}
              </div>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-3 text-[#7f6d60] transition hover:text-[#3d2a20]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() =>
                addToCart(product, {
                  mode,
                  quantity: qty,
                  unitPrice: unit,
                  sizeLabel: size.label,
                })
              }
              className="flex-1 rounded-full bg-[#4a2d1f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#5A3422] hover:scale-[1.01]"
            >
              Add to Cart — {money(total)}
            </button>
          </div>

          <div className="mt-7 flex flex-wrap gap-6 border-t border-[#eaded3] pt-6 text-sm text-[#7a6e64]">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#B66A3C]" />
              Free delivery in Nairobi
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#B66A3C]" />
              30-day guarantee
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-[#B66A3C]" />
              Handcrafted
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#eaded3] bg-white">
            <button
              onClick={() => setDetailsOpen((s) => !s)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f5147]">
                Product Details
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#7f6d60] transition ${
                  detailsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {detailsOpen && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[#f2e8df] px-5 py-5 text-sm">
                <div className="text-[#9a8a7d]">Material</div>
                <div>100% Natural Kenyan Clay</div>

                <div className="text-[#9a8a7d]">Shape</div>
                <div>{size.label}</div>

                <div className="text-[#9a8a7d]">SKU</div>
                <div>{product.sku}</div>

                <div className="text-[#9a8a7d]">Finish</div>
                <div>Natural Terracotta</div>
              </div>
            )}
          </div>

          {!!product.plantGuide && (
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#eaded3] bg-white">
              <button
                onClick={() => setCareOpen((s) => !s)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f5147]">
                  Plant Care Guide
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#7f6d60] transition ${
                    careOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {careOpen && (
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[#f2e8df] px-5 py-5 text-sm">
                  {Object.entries(product.plantGuide).map(([k, v]) => (
                    <div key={k} className="contents">
                      <div className="capitalize text-[#9a8a7d]">{k}</div>
                      <div>{String(v)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 rounded-[1.75rem] border border-[#eaded3] bg-white p-6">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b7a6e]">
              Reviews
            </div>

            {reviewGate ? (
              isLoggedIn ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#F7F2EA] p-4 text-sm leading-7 text-[#6b5d53]">
                    Beautiful weight and finish. It feels handmade in the best way.
                  </div>
                  <div className="rounded-2xl bg-[#F7F2EA] p-4 text-sm leading-7 text-[#6b5d53]">
                    The clay tone is even richer in person and the plant pairing was spot on.
                  </div>
                  <textarea
                    className="mt-2 min-h-[110px] w-full rounded-3xl border border-[#e6d9cd] bg-[#fffdfb] p-4 outline-none"
                    placeholder="Leave a review"
                  />
                  <button className="rounded-full bg-[#5A3422] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Post Review
                  </button>
                </div>
              ) : (
                <div className="text-sm leading-7 text-[#716257]">
                  Sign in to read and leave reviews on this product.
                </div>
              )
            ) : (
              <div className="text-sm leading-7 text-[#716257]">
                Reviews are currently disabled by admin settings.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="text-center">
          <h2 className="serif-display text-5xl text-[#4a3428]">You May Also Like</h2>
          <p className="mt-3 text-sm text-[#8a7a6d]">
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