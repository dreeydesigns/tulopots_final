"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { products } from "../../lib/products";
import { imageByKey } from "../../lib/site";
import { money } from "../../lib/utils";
import { useStore } from "../Providers";

export default function LoggedOutHome() {
  const { addToCart, user } = useStore();
  const displayCurrency = user?.preferredCurrency || 'KES';
  const displayLanguage = user?.preferredLanguage || 'en';

  const featuredProducts = useMemo(() => products.slice(0, 3), []);

  return (
    <main className="tp-page transition-colors">
      {/* HERO */}
      <section className="container-shell pt-24 pb-16 md:pt-32 md:pb-24 xl:pt-40 xl:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16 xl:gap-24">
          {/* LEFT */}
          <div className="md:col-span-5">
            <p className="mb-5 text-[11px] uppercase tracking-[0.24em] tp-accent">
              Handcrafted in Kenya
            </p>

            <h1
              className="serif-display max-w-xl leading-[0.92] tp-heading"
              style={{ fontSize: 'clamp(3.15rem, 11vw, 5.25rem)' }}
            >
              Terracotta made to warm a home.
            </h1>

            <p className="mt-7 max-w-md text-[16px] leading-7 tp-text-soft">
              Thoughtfully shaped pots, plant pairings, and studio pieces designed
              to bring texture, calm, and character into everyday spaces.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pots"
                className="tp-btn-primary text-center cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                View Collection
              </Link>

              <Link
                href="/studio"
                className="tp-btn-secondary text-center cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                Explore Studio
              </Link>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t pt-7 sm:gap-6 tp-border">
              <div>
                <div className="text-xl font-semibold tp-text">120+</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] tp-text-muted">
                  Pot Styles
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold tp-text">8 yrs</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] tp-text-muted">
                  Craft Story
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold tp-text">100%</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] tp-text-muted">
                  Natural Clay
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-7">
            <div className="grid gap-5 md:grid-cols-[1fr_0.55fr]">
              <Link
                href="/pots"
                className="group block overflow-hidden rounded-[1.5rem] tp-card"
              >
                <div className="relative aspect-[4/5] tp-surface-soft">
                  <Image
                    src={imageByKey.hero}
                    alt="Handcrafted terracotta hero"
                    fill
                    priority
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 40vw"
                    className="object-cover transition duration-700 hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                      Collection
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="serif-display text-[28px] leading-none">
                        Clay Forms
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>

              <div className="flex flex-col gap-5">
                <Link
                  href="/indoor"
                  className="group block overflow-hidden rounded-[1.5rem] tp-card"
                >
                  <div className="relative aspect-[4/4.6] tp-surface-soft">
                    <Image
                      src={imageByKey.indoor1}
                      alt="Indoor terracotta styling"
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 25vw, 22vw"
                      className="object-cover transition duration-700 hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/8 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                        For
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="serif-display text-[22px] leading-none">
                          Interior Spaces
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/studio" className="block rounded-[1.5rem] p-6 tp-card">
                  <p className="text-[10px] uppercase tracking-[0.18em] tp-accent">
                    Studio Note
                  </p>
                  <p className="mt-3 serif-display text-[26px] leading-tight tp-heading">
                    Each piece is shaped with warmth, patience, and intention.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] tp-accent">
                    Explore Studio
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION STRIP */}
      <section className="container-shell pb-16 md:pb-20 xl:pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Indoor", "/indoor", imageByKey.indoor1],
            ["Outdoor", "/outdoor", imageByKey.outdoor2],
            ["Pots Only", "/pots", imageByKey.workshop],
          ].map(([label, href, img]) => (
            <Link
              key={href as string}
              href={href as string}
              className="group overflow-hidden cursor-hover rounded-[1.5rem] tp-card"
            >
              <div className="relative aspect-[4/4.2] tp-surface-soft">
                <Image
                  src={img as string}
                  alt={label as string}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/8 to-transparent" />
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
            <p className="text-[11px] uppercase tracking-[0.24em] tp-accent">
              Selected pieces
            </p>
            <h2 className="serif-display mt-4 text-5xl leading-tight tp-heading">
              A few favourites from the studio.
            </h2>
          </div>

          <Link
            href="/pots"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] tp-accent"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article
              key={product.slug}
              className="overflow-hidden rounded-[1.5rem] tp-card"
            >
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-[4/4.6] tp-surface-soft">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover transition duration-700 hover:scale-[1.04]"
                  />
                </div>
              </Link>

              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] tp-accent">
                  TuloPots
                </p>

                <h3 className="mt-2 serif-display text-[26px] leading-tight tp-heading">
                  {product.name}
                </h3>

                {product.short && (
                  <p className="mt-2 text-sm leading-6 tp-text-soft">
                    {product.short}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold tp-text">
                    {money(product.price, {
                      currency: displayCurrency,
                      language: displayLanguage,
                    })}
                  </div>

                  <button
                    onClick={() => addToCart(product, { quantity: 1 })}
                    className="tp-btn-secondary rounded-full px-5 py-2 text-[11px]"
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
            <Link href="/about" className="group block overflow-hidden rounded-[1.5rem] tp-card">
              <div className="relative aspect-[5/6] tp-surface-soft">
                <Image
                  src={imageByKey.clay}
                  alt="TuloPots story"
                  fill
                  sizes="(max-width: 767px) 100vw, 48vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-5 text-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                      Story
                    </p>
                    <div className="serif-display mt-2 text-[28px] leading-none">
                      Our Studio
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </div>
              </div>
            </Link>
          </div>

          <div className="md:col-span-6">
            <p className="text-[11px] uppercase tracking-[0.24em] tp-accent">
              Our Story
            </p>

            <h2 className="serif-display mt-5 text-5xl leading-tight tp-heading">
              Still shaped by hand, still rooted in Nairobi.
            </h2>

            <p className="mt-7 max-w-md text-[16px] leading-7 tp-text-soft">
              Started in 2016 in a small workshop, TuloPots began as a simple love
              for clay, form, and natural living. Every pot still carries that same
              sense of care — honest materials, steady hands, and pieces made to
              feel timeless in a home.
            </p>

            <div className="mt-10">
              <Link
                href="/about"
                className="tp-btn-primary cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-shell pb-20 pt-10 md:pb-28">
        <div className="rounded-[2rem] px-8 py-12 md:px-12 md:py-14 tp-card">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] tp-accent">
                Studio Collection
              </p>

              <h2 className="serif-display mt-4 text-5xl leading-tight tp-heading">
                Looking for something more personal?
              </h2>

              <p className="mt-5 max-w-xl text-[16px] leading-7 tp-text-soft">
                Explore custom studio pieces and handcrafted commissions made for
                more intentional interiors, gifting, and statement spaces.
              </p>
            </div>

            <div className="flex md:justify-end">
              <Link
                href="/contact"
                className="tp-btn-primary cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                Start a Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
