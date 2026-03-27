'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';

import { products } from '../../lib/products';
import { imageByKey } from '../../lib/site';
import { useStore } from '../Providers';

export default function LoggedOutHome() {
  const { addToCart } = useStore();

  const featuredProducts = useMemo(() => {
    return products.slice(0, 3);
  }, []);

  return (
    <main className="bg-[#F7F2EA] text-[#222222]">

      {/* HERO */}
      <section className="container-shell pt-24 pb-16 md:pt-32 md:pb-24 xl:pt-40 xl:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16 xl:gap-24">

          {/* LEFT */}
          <div className="md:col-span-5">
            <p className="mb-5 text-[11px] uppercase tracking-[0.24em] text-[#8A4E2D]">
              Handcrafted in Kenya
            </p>

            <h1 className="serif-display max-w-xl text-6xl leading-[0.92] md:text-7xl xl:text-[84px]">
              Terracotta made to warm a home.
            </h1>

            <p className="mt-7 max-w-md text-[16px] leading-7 text-[#5f564d]">
              Thoughtfully shaped pots, plant pairings, and studio pieces designed
              to bring texture, calm, and character into everyday spaces.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/pots" className="btn-primary text-center cursor-hover">
                Shop Collection
              </Link>
              <Link href="/studio" className="btn-secondary text-center cursor-hover">
                Explore Studio
              </Link>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-[#dccdbf] pt-7">
              <div>
                <div className="text-xl font-semibold">120+</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7b6d60]">
                  Pot Styles
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold">8 yrs</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7b6d60]">
                  Craft Story
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold">100%</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7b6d60]">
                  Natural Clay
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-7">
            <div className="grid gap-5 md:grid-cols-[1fr_0.55fr]">

              <div className="card-shell overflow-hidden">
                <div className="relative aspect-[4/5] bg-[#e9dccf]">
                  <Image
                    src={imageByKey.hero}
                    alt="Handcrafted terracotta hero"
                    fill
                    priority
                    className="object-cover transition duration-700 hover:scale-[1.04]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="card-shell overflow-hidden">
                  <div className="relative aspect-[4/4.6] bg-[#e5d6c9]">
                    <Image
                      src={imageByKey.indoor1}
                      alt="Indoor terracotta styling"
                      fill
                      className="object-cover transition duration-700 hover:scale-[1.04]"
                    />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6 shadow-[0_6px_28px_rgba(90,52,34,0.06)]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A4E2D]">
                    Studio Note
                  </p>
                  <p className="mt-3 serif-display text-[26px] leading-tight">
                    Each piece is shaped with warmth, patience, and intention.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION STRIP */}
      <section className="container-shell pb-16 md:pb-20 xl:pb-24">
        <div className="grid gap-5 md:grid-cols-3">

          {[
            ['Indoor', '/indoor', imageByKey.indoor1],
            ['Outdoor', '/outdoor', imageByKey.outdoor2],
            ['Pots Only', '/pots', imageByKey.workshop],
          ].map(([label, href, img]) => (
            <Link key={href} href={href} className="card-shell group overflow-hidden cursor-hover">
              <div className="relative aspect-[4/4.2] bg-[#e8ddd0]">
                <Image
                  src={img}
                  alt={label}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                    Collection
                  </p>
                  <h2 className="serif-display mt-2 text-3xl">{label}</h2>
                </div>
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* FEATURED */}
      <section className="container-shell py-16 md:py-20 xl:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A4E2D]">
              Selected pieces
            </p>
            <h2 className="serif-display mt-4 text-5xl leading-tight">
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

        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.slug} className="card-shell overflow-hidden">

              <Link href={`/product/${product.slug}`} className="block cursor-hover">
                <div className="relative aspect-[4/4.6] bg-[#eadfd2]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-700 hover:scale-[1.04]"
                  />
                </div>
              </Link>

              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A4E2D]">
                  TuloPots
                </p>

                <Link href={`/product/${product.slug}`} className="cursor-hover">
                  <h3 className="serif-display mt-2 text-[26px] leading-tight">
                    {product.name}
                  </h3>
                </Link>

                <p className="mt-3 text-sm leading-6 text-[#6a5f56]">
                  {product.short}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-lg font-semibold">
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

      {/* STORY */}
      <section className="container-shell py-16 md:py-20 xl:py-24">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">

          <div className="md:col-span-6">
            <div className="card-shell overflow-hidden">
              <div className="relative aspect-[5/6] bg-[#e4d5c7]">
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
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A4E2D]">
              Our story
            </p>

            <h2 className="serif-display mt-5 text-5xl leading-tight">
              Still shaped by hand, still rooted in Nairobi.
            </h2>

            <p className="mt-7 max-w-md text-[16px] leading-7 text-[#5f564d]">
              Started in 2016 in a small workshop, TuloPots began as a simple love
              for clay, form, and natural living. Every pot still carries that same
              sense of care — honest materials, steady hands, and pieces made to
              feel timeless in a home.
            </p>

            <div className="mt-10">
              <Link href="/about" className="btn-primary cursor-hover">
                Read Our Story
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="container-shell pb-20 pt-10 md:pb-28">
        <div className="rounded-[2rem] border border-[#dfd1c4] bg-white px-8 py-12 shadow-[0_10px_50px_rgba(90,52,34,0.06)] md:px-12 md:py-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">

            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A4E2D]">
                Studio collection
              </p>

              <h2 className="serif-display mt-4 text-5xl leading-tight">
                Looking for something more personal?
              </h2>

              <p className="mt-5 max-w-xl text-[16px] leading-7 text-[#5f564d]">
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