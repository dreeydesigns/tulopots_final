'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';

import { products } from '../lib/products';
import { imageByKey } from '../lib/site';
import { useStore } from '../components/Providers';

export default function HomePage() {
  const { addToCart } = useStore();

  const featuredProducts = useMemo(() => {
    return products.slice(0, 3);
  }, []);

  return (
    <main className="bg-[#F7F2EA] text-[#222222]">
      {/* Hero */}
      <section className="container-shell pt-16 pb-12 md:pt-24 md:pb-20 xl:pt-32 xl:pb-24">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14 xl:gap-20">
          <div className="md:col-span-5">
            <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#8A4E2D]">
              Handcrafted in Kenya
            </p>

            <h1 className="serif-display max-w-xl text-5xl leading-[0.95] text-[#222222] md:text-6xl xl:text-7xl">
              Terracotta made to warm a home.
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5f564d] md:text-base">
              Thoughtfully shaped pots, plant pairings, and studio pieces designed to
              bring texture, calm, and character into everyday spaces.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pots" className="btn-primary text-center cursor-hover">
                Shop Collection
              </Link>
              <Link href="/studio" className="btn-secondary text-center cursor-hover">
                Explore Studio
              </Link>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-5 border-t border-[#dccdbf] pt-6">
              <div>
                <div className="text-xl font-semibold text-[#222222]">120+</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#7b6d60]">
                  Pot Styles
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold text-[#222222]">8 yrs</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#7b6d60]">
                  Craft Story
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold text-[#222222]">100%</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#7b6d60]">
                  Natural Clay
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="grid gap-4 md:grid-cols-[1fr_0.55fr]">
              <div className="card-shell overflow-hidden">
                <div className="relative aspect-[4/5] w-full bg-[#e9dccf]">
                  <Image
                    src={imageByKey.hero}
                    alt="Handcrafted terracotta hero"
                    fill
                    priority
                    className="object-cover transition duration-700 hover:scale-[1.03]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="card-shell overflow-hidden">
                  <div className="relative aspect-[4/4.6] w-full bg-[#e5d6c9]">
                    <Image
                      src={imageByKey.indoor1}
                      alt="Indoor terracotta styling"
                      fill
                      className="object-cover transition duration-700 hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-5 shadow-[0_4px_24px_rgba(90,52,34,0.07)]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A4E2D]">
                    Studio Note
                  </p>
                  <p className="mt-3 serif-display text-2xl leading-tight text-[#222222]">
                    Each piece is shaped with warmth, patience, and intention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="container-shell pb-12 md:pb-16 xl:pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/indoor"
            className="card-shell group overflow-hidden cursor-hover"
          >
            <div className="relative aspect-[4/4.2] bg-[#e8ddd0]">
              <Image
                src={imageByKey.indoor1}
                alt="Indoor pots"
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                  Collection
                </p>
                <h2 className="serif-display mt-2 text-3xl">Indoor</h2>
              </div>
            </div>
          </Link>

          <Link
            href="/outdoor"
            className="card-shell group overflow-hidden cursor-hover"
          >
            <div className="relative aspect-[4/4.2] bg-[#e8ddd0]">
              <Image
                src={imageByKey.outdoor2}
                alt="Outdoor pots"
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                  Collection
                </p>
                <h2 className="serif-display mt-2 text-3xl">Outdoor</h2>
              </div>
            </div>
          </Link>

          <Link
            href="/pots"
            className="card-shell group overflow-hidden cursor-hover"
          >
            <div className="relative aspect-[4/4.2] bg-[#e8ddd0]">
              <Image
                src={imageByKey.workshop}
                alt="Pots only collection"
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                  Collection
                </p>
                <h2 className="serif-display mt-2 text-3xl">Pots Only</h2>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-shell py-12 md:py-16 xl:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A4E2D]">
              Selected pieces
            </p>
            <h2 className="serif-display mt-3 text-4xl leading-tight md:text-5xl">
              A few favourites from the studio.
            </h2>
          </div>

          <Link
            href="/pots"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A3422] cursor-hover"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.slug} className="card-shell overflow-hidden">
              <Link href={`/product/${product.slug}`} className="block cursor-hover">
                <div className="relative aspect-[4/4.6] bg-[#eadfd2]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-700 hover:scale-[1.03]"
                  />
                </div>
              </Link>

              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8A4E2D]">
                  TuloPots
                </p>

                <Link href={`/product/${product.slug}`} className="cursor-hover">
                  <h3 className="serif-display mt-2 text-2xl leading-tight text-[#222222]">
                    {product.name}
                  </h3>
                </Link>

                <p className="mt-2 text-sm leading-6 text-[#6a5f56]">
                  {product.short}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-[#222222]">
                    KSh {Number(product.price).toLocaleString()}
                  </div>

                  <button
                    onClick={() => addToCart(product, { quantity: 1 })}
                   className="btn-secondary cursor-hover"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Story block */}
      <section className="container-shell py-12 md:py-16 xl:py-20">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-6">
            <div className="card-shell overflow-hidden">
              <div className="relative aspect-[5/6] w-full bg-[#e4d5c7]">
                <Image
                  src={imageByKey.clay}
                  alt="TuloPots story"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A4E2D]">
              Our story
            </p>

            <h2 className="serif-display mt-4 max-w-lg text-4xl leading-tight md:text-5xl">
              Still shaped by hand, still rooted in Nairobi.
            </h2>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5f564d]">
              Started in 2016 in a small workshop, TuloPots began as a simple love
              for clay, form, and natural living. Every pot still carries that same
              sense of care — honest materials, steady hands, and pieces made to
              feel timeless in a home.
            </p>

            <div className="mt-8">
              <Link href="/about" className="btn-primary cursor-hover">
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Studio commission CTA */}
      <section className="container-shell pb-16 pt-6 md:pb-24">
        <div className="rounded-[2rem] border border-[#dfd1c4] bg-white px-6 py-10 shadow-[0_8px_40px_rgba(90,52,34,0.06)] md:px-10 md:py-12">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A4E2D]">
                Studio collection
              </p>
              <h2 className="serif-display mt-3 text-4xl leading-tight md:text-5xl">
                Looking for something more personal?
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#5f564d]">
                Explore custom studio pieces and handcrafted commissions made for
                more intentional interiors, gifting, and statement spaces.
              </p>
            </div>

            <div className="flex md:justify-end">
              <Link href="/contact" className="btn-primary cursor-hover">
                Start a Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}