'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';

import { products } from '../../lib/products';
import { imageByKey } from '../../lib/site';
import { useStore } from '../Providers';

export default function LoggedOutHome() {
  const { addToCart, theme } = useStore();
  const isLight = theme === 'light';

  const featuredProducts = useMemo(() => {
    return products.slice(0, 3);
  }, []);

  const palette = {
    pageBg: isLight ? '#F7F2EA' : '#140c08',
    text: isLight ? '#222222' : '#F7F2EA',
    textSoft: isLight ? '#5f564d' : 'rgba(247,242,234,0.74)',
    textMute: isLight ? '#7b6d60' : 'rgba(247,242,234,0.50)',
    accent: '#8A4E2D',
    accentStrong: '#5A3422',
    border: isLight ? '#e8dccf' : 'rgba(255,255,255,0.10)',
    borderSoft: isLight ? '#dccdbf' : 'rgba(255,255,255,0.10)',
    surface: isLight ? '#ffffff' : '#1b120f',
    surfaceSoft: isLight ? '#fbf7f1' : '#211714',
    imageBg: isLight ? '#e9dccf' : '#261a15',
    imageBgAlt: isLight ? '#e5d6c9' : '#241914',
    imageBgStory: isLight ? '#e4d5c7' : '#241913',
    shadowCard: isLight
      ? '0 4px 24px rgba(90,52,34,0.07)'
      : '0 12px 34px rgba(0,0,0,0.30)',
    shadowPanel: isLight
      ? '0 6px 28px rgba(90,52,34,0.06)'
      : '0 14px 34px rgba(0,0,0,0.28)',
    shadowCta: isLight
      ? '0 10px 50px rgba(90,52,34,0.06)'
      : '0 18px 44px rgba(0,0,0,0.32)',
    btnPrimaryBg: '#5A3422',
    btnPrimaryText: '#ffffff',
    btnSecondaryBg: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
    btnSecondaryText: isLight ? '#5A3422' : '#F7F2EA',
    btnSecondaryBorder: isLight ? '#d8c9bc' : 'rgba(255,255,255,0.16)',
    btnSecondaryHover: isLight ? '#fff8f2' : 'rgba(255,255,255,0.10)',
    collectionOverlay: isLight
      ? 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.05), transparent)'
      : 'linear-gradient(to top, rgba(0,0,0,0.52), rgba(0,0,0,0.12), transparent)',
  };

  return (
    <main
      style={{
        background: palette.pageBg,
        color: palette.text,
        transition:
          'background-color 300ms ease, color 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
      }}
    >
      {/* HERO */}
      <section className="container-shell pt-24 pb-16 md:pt-32 md:pb-24 xl:pt-40 xl:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16 xl:gap-24">
          {/* LEFT */}
          <div className="md:col-span-5">
            <p
              className="mb-5 text-[11px] uppercase tracking-[0.24em]"
              style={{ color: palette.accent }}
            >
              Handcrafted in Kenya
            </p>

            <h1
              className="serif-display max-w-xl text-6xl leading-[0.92] md:text-7xl xl:text-[84px]"
              style={{ color: palette.text }}
            >
              Terracotta made to warm a home.
            </h1>

            <p
              className="mt-7 max-w-md text-[16px] leading-7"
              style={{ color: palette.textSoft }}
            >
              Thoughtfully shaped pots, plant pairings, and studio pieces designed
              to bring texture, calm, and character into everyday spaces.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pots"
                className="text-center cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                style={{
                  background: palette.btnPrimaryBg,
                  color: palette.btnPrimaryText,
                }}
              >
                Shop Collection
              </Link>

              <Link
                href="/studio"
                className="text-center cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                style={{
                  background: palette.btnSecondaryBg,
                  color: palette.btnSecondaryText,
                  border: `1px solid ${palette.btnSecondaryBorder}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = palette.btnSecondaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = palette.btnSecondaryBg;
                }}
              >
                Explore Studio
              </Link>
            </div>

            <div
              className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-7"
              style={{ borderColor: palette.borderSoft }}
            >
              <div>
                <div className="text-xl font-semibold" style={{ color: palette.text }}>
                  120+
                </div>
                <div
                  className="mt-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: palette.textMute }}
                >
                  Pot Styles
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold" style={{ color: palette.text }}>
                  8 yrs
                </div>
                <div
                  className="mt-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: palette.textMute }}
                >
                  Craft Story
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold" style={{ color: palette.text }}>
                  100%
                </div>
                <div
                  className="mt-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: palette.textMute }}
                >
                  Natural Clay
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-7">
            <div className="grid gap-5 md:grid-cols-[1fr_0.55fr]">
              <div
                className="overflow-hidden rounded-[1.5rem]"
                style={{
                  background: palette.surface,
                  border: `1px solid ${palette.border}`,
                  boxShadow: palette.shadowCard,
                }}
              >
                <div className="relative aspect-[4/5]" style={{ background: palette.imageBg }}>
                  <Image
                    src={imageByKey.hero}
                    alt="Handcrafted terracotta hero"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 42vw"
                    className="object-cover transition duration-700 hover:scale-[1.04]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div
                  className="overflow-hidden rounded-[1.5rem]"
                  style={{
                    background: palette.surface,
                    border: `1px solid ${palette.border}`,
                    boxShadow: palette.shadowCard,
                  }}
                >
                  <div className="relative aspect-[4/4.6]" style={{ background: palette.imageBgAlt }}>
                    <Image
                      src={imageByKey.indoor1}
                      alt="Indoor terracotta styling"
                      fill
                      sizes="(max-width: 768px) 100vw, 22vw"
                      className="object-cover transition duration-700 hover:scale-[1.04]"
                    />
                  </div>
                </div>

                <div
                  className="rounded-[1.5rem] p-6"
                  style={{
                    border: `1px solid ${palette.border}`,
                    background: palette.surface,
                    boxShadow: palette.shadowPanel,
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: palette.accent }}
                  >
                    Studio Note
                  </p>
                  <p
                    className="mt-3 serif-display text-[26px] leading-tight"
                    style={{ color: palette.text }}
                  >
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
            <Link
              key={href}
              href={href}
              className="group overflow-hidden cursor-hover rounded-[1.5rem]"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadowCard,
              }}
            >
              <div className="relative aspect-[4/4.2]" style={{ background: palette.imageBg }}>
                <Image
                  src={img}
                  alt={label}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: palette.collectionOverlay }}
                />
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
            <p
              className="text-[11px] uppercase tracking-[0.24em]"
              style={{ color: palette.accent }}
            >
              Selected pieces
            </p>
            <h2
              className="serif-display mt-4 text-5xl leading-tight"
              style={{ color: palette.text }}
            >
              A few favourites from the studio.
            </h2>
          </div>

          <Link
            href="/pots"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] cursor-hover"
            style={{ color: palette.accentStrong }}
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article
              key={product.slug}
              className="overflow-hidden rounded-[1.5rem]"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadowCard,
              }}
            >
              <Link href={`/product/${product.slug}`} className="block cursor-hover">
                <div className="relative aspect-[4/4.6]" style={{ background: palette.imageBg }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover transition duration-700 hover:scale-[1.04]"
                  />
                </div>
              </Link>

              <div className="p-6">
                <p
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: palette.accent }}
                >
                  TuloPots
                </p>

                <Link href={`/product/${product.slug}`} className="cursor-hover">
                  <h3
                    className="serif-display mt-2 text-[26px] leading-tight"
                    style={{ color: palette.text }}
                  >
                    {product.name}
                  </h3>
                </Link>

                <p
                  className="mt-3 text-sm leading-6"
                  style={{ color: palette.textSoft }}
                >
                  {product.short}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-lg font-semibold" style={{ color: palette.text }}>
                    KSh {Number(product.price).toLocaleString()}
                  </div>

                  <button
                    onClick={() => addToCart(product, { quantity: 1 })}
                    className="cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                    style={{
                      background: palette.btnSecondaryBg,
                      color: palette.btnSecondaryText,
                      border: `1px solid ${palette.btnSecondaryBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = palette.btnSecondaryHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = palette.btnSecondaryBg;
                    }}
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
            <div
              className="overflow-hidden rounded-[1.5rem]"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadowCard,
              }}
            >
              <div className="relative aspect-[5/6]" style={{ background: palette.imageBgStory }}>
                <Image
                  src={imageByKey.clay}
                  alt="TuloPots story"
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6">
            <p
              className="text-[11px] uppercase tracking-[0.24em]"
              style={{ color: palette.accent }}
            >
              Our story
            </p>

            <h2
              className="serif-display mt-5 text-5xl leading-tight"
              style={{ color: palette.text }}
            >
              Still shaped by hand, still rooted in Nairobi.
            </h2>

            <p
              className="mt-7 max-w-md text-[16px] leading-7"
              style={{ color: palette.textSoft }}
            >
              Started in 2016 in a small workshop, TuloPots began as a simple love
              for clay, form, and natural living. Every pot still carries that same
              sense of care — honest materials, steady hands, and pieces made to
              feel timeless in a home.
            </p>

            <div className="mt-10">
              <Link
                href="/about"
                className="cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                style={{
                  background: palette.btnPrimaryBg,
                  color: palette.btnPrimaryText,
                }}
              >
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-shell pb-20 pt-10 md:pb-28">
        <div
          className="rounded-[2rem] px-8 py-12 md:px-12 md:py-14"
          style={{
            border: `1px solid ${palette.borderSoft}`,
            background: palette.surface,
            boxShadow: palette.shadowCta,
          }}
        >
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.24em]"
                style={{ color: palette.accent }}
              >
                Studio collection
              </p>

              <h2
                className="serif-display mt-4 text-5xl leading-tight"
                style={{ color: palette.text }}
              >
                Looking for something more personal?
              </h2>

              <p
                className="mt-5 max-w-xl text-[16px] leading-7"
                style={{ color: palette.textSoft }}
              >
                Explore custom studio pieces and handcrafted commissions made for
                more intentional interiors, gifting, and statement spaces.
              </p>
            </div>

            <div className="flex md:justify-end">
              <Link
                href="/contact"
                className="cursor-hover inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                style={{
                  background: palette.btnPrimaryBg,
                  color: palette.btnPrimaryText,
                }}
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