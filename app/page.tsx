'use client';

import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/products';
import { imageByKey } from '@/lib/site';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/components/Providers';
import { ArrowUp, ArrowDown, ArrowRight, Star } from 'lucide-react';

/* ─── Slide definitions ─────────────────────────────────── */
const SLIDES = [
  {
    id: 'hero',
    /* "Home Collection" label shown ABOVE title on each slide (left column) */
    sectionLabel: '',
    titlePlain:  'Hand',
    titleItalic: 'crafted',
    titleLine2:  'Terracotta',
    body: 'Each pot is hand-thrown by our artisans and paired with the perfect plant to bring natural beauty into your space.',
    cta1Label: 'Shop Indoor',  cta1Href: '/indoor',
    cta2Label: 'Shop Outdoor', cta2Href: '/outdoor',
    stats: [
      { value: '120+', label: 'Pot Styles' },
      { value: '8yr',  label: 'Craftsmanship' },
      { value: '100%', label: 'Natural Clay' },
    ],
    ghostNext: 'Indoor Plants',
    bg: imageByKey.hero,
    featured: null,
    cardSlugs: ['ribbed-globe-peace-lily', 'pedestal-bowl-succulents', 'cylinder-vase-snake-plant'],
    editorial: false,
  },
  {
    id: 'indoor',
    sectionLabel: 'Home Collection',
    titlePlain:  'Indoor',
    titleItalic: null,
    titleLine2:  'Plants',
    body: 'Delicate terracotta pots designed for living rooms, kitchens and studios. The natural clay breathes, keeping your plant roots thriving all year.',
    cta1Label: 'See All Indoor Pots', cta1Href: '/indoor',
    cta2Label: null, cta2Href: null,
    stats: null,
    ghostNext: 'Outdoor Plants',
    bg: imageByKey.outdoor3,
    featured: { label: 'Featured · Ribbed Globe', stars: 4.5 },
    cardSlugs: ['ribbed-globe-peace-lily', 'pedestal-bowl-succulents', 'jug-handle-pothos'],
    editorial: false,
  },
  {
    id: 'outdoor',
    sectionLabel: 'Indoor Plants',
    titlePlain:  'Outdoor',
    titleItalic: null,
    titleLine2:  'Plants',
    body: 'Robust pots built to weather sun, rain and wind. Paired with hardy garden plants that flourish in the open air of your patio or garden.',
    cta1Label: 'See All Outdoor Pots', cta1Href: '/outdoor',
    cta2Label: null, cta2Href: null,
    stats: null,
    ghostNext: 'Pots Only',
    bg: imageByKey.workshop,
    featured: { label: 'Studio Collection', stars: 5 },
    cardSlugs: ['hut-sculpture-garden', 'wide-rim-bougainvillea', 'studio-xl-deep-palm'],
    editorial: false,
  },
  {
    id: 'pots',
    sectionLabel: 'Outdoor Plants',
    titlePlain:  'Pots',
    titleItalic: null,
    titleLine2:  'Only',
    body: 'Just the pot. No plant included. Perfect if you already have your plant and want a beautiful terracotta home for it.',
    cta1Label: 'Browse All Pots', cta1Href: '/pots',
    cta2Label: null, cta2Href: null,
    stats: null,
    ghostNext: 'About Us',
    bg: imageByKey.indoor1,
    featured: null,
    cardSlugs: ['ribbed-globe-solo', 'pedestal-bowl-solo', 'hut-sculpture-solo'],
    editorial: false,
  },
  {
    id: 'story',
    sectionLabel: 'Pots Only',
    titlePlain:  'Our',
    titleItalic: null,
    titleLine2:  'Story',
    body: 'Started in 2016 in a small Nairobi workshop, TuloPots began as a hobby that grew into a passion. Every pot is still thrown on the same wheel, by the same hands.',
    cta1Label: 'Read Our Story', cta1Href: '/about',
    cta2Label: 'Contact Us',    cta2Href: '/contact',
    stats: null,
    ghostNext: null,
    bg: imageByKey.clay,
    featured: null,
    cardSlugs: null,
    editorial: true,
  },
];

/* For pots-only cards, substitute a real pot image since they use productStudio */
const imageOverride: Record<string, string> = {
  'ribbed-globe-solo':   imageByKey.indoor1,
  'pedestal-bowl-solo':  imageByKey.indoor2,
  'hut-sculpture-solo':  imageByKey.outdoor2,
};

/* ─── Component ─────────────────────────────────────────── */
export default function HomePage() {
  const { addToCart } = useStore();

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.slug, p])),
    []
  );

  const [current,   setCurrent]   = useState(0);
  const [prev,      setPrev]      = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const touchY   = useRef<number | null>(null);
  const sceneRef = useRef<(HTMLDivElement | null)[]>([]);

  /* Scroll lock */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('page-fullscreen');
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.classList.remove('page-fullscreen');
      html.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  /* Replay CSS animations on newly-active scene */
  const replay = (idx: number) => {
    const scene = sceneRef.current[idx];
    if (!scene) return;
    scene.querySelectorAll<HTMLElement>('.rpl').forEach((el) => {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });
  };

  const goTo = (next: number) => {
    if (animating || next < 0 || next >= SLIDES.length || next === current) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(next);
    setTimeout(() => replay(next), 40);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 960);
  };

  const goNext = () => goTo(current + 1);
  const goPrev = () => goTo(current - 1);

  /* Keyboard / wheel / touch */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (animating || Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      e.deltaY > 0 ? goNext() : goPrev();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goPrev(); }
    };
    const onTS  = (e: TouchEvent) => { touchY.current = e.touches[0]?.clientY ?? null; };
    const onTE  = (e: TouchEvent) => {
      if (touchY.current === null) return;
      const d = touchY.current - (e.changedTouches[0]?.clientY ?? touchY.current);
      if (Math.abs(d) > 48) { d > 0 ? goNext() : goPrev(); }
      touchY.current = null;
    };
    window.addEventListener('wheel',      onWheel, { passive: false });
    window.addEventListener('keydown',    onKey);
    window.addEventListener('touchstart', onTS, { passive: true });
    window.addEventListener('touchend',   onTE, { passive: true });
    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('keydown',    onKey);
      window.removeEventListener('touchstart', onTS);
      window.removeEventListener('touchend',   onTE);
    };
  }, [animating, current]);

  useEffect(() => { replay(0); }, []);

  return (
    <main style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#180f09' }}>

      {SLIDES.map((slide, idx) => {
        const isActive = idx === current;
        const isPrev   = idx === prev;

        return (
          <div
            key={slide.id}
            ref={(el) => { sceneRef.current[idx] = el; }}
            className={`scene${isActive ? ' active' : ''}${isPrev ? ' prev' : ''}`}
          >
            {/* ── Background ── */}
            <div className="absolute inset-0">
              <Image
                src={slide.bg}
                alt={`${slide.titlePlain} ${slide.titleLine2}`}
                fill
                priority={idx === 0}
                className="scene-bg object-cover"
              />
              {/* Directional gradient — darker on left where text sits */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(100deg,rgba(14,9,5,.75) 0%,rgba(14,9,5,.45) 40%,rgba(14,9,5,.15) 70%,transparent 100%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* ── Featured label — top right ── */}
            {slide.featured && (
              <div className="rpl fade-delay-2 absolute right-10 top-[76px] z-30 hidden text-right lg:block">
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
                  {slide.featured.label}
                </div>
                <div className="flex justify-end gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i <= Math.floor(slide.featured!.stars)
                          ? 'fill-[#f2c94c] text-[#f2c94c]'
                          : 'text-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Main layout ── */}
            <div
              className="relative z-10 mx-auto flex max-w-[1440px] px-[5%]"
              style={{ height: '100vh', paddingTop: '72px', paddingBottom: '88px', alignItems: 'center' }}
            >
              <div className="grid w-full items-center gap-10 lg:grid-cols-[0.80fr_1.20fr]">

                {/* LEFT — content */}
                <div className="text-white">
                  {/* Section label */}
                  {slide.sectionLabel && (
                    <div className="rpl fade-delay-1 mb-3 text-[11px] font-light uppercase tracking-[0.22em] text-white/45">
                      {slide.sectionLabel}
                    </div>
                  )}

                  {/* Title */}
                  <h1
                    className="rpl fade-delay-2 serif-display leading-[0.9]"
                    style={{ fontSize: 'clamp(2.8rem, 5.8vw, 5.6rem)' }}
                  >
                    {slide.id === 'hero' ? (
                      /* Hero: "Hand*crafted*" on line 1, "Terracotta" on line 2 */
                      <>
                        Hand<em style={{ fontStyle: 'italic', color: '#e2b97a' }}>crafted</em>
                        <br />
                        Terracotta
                      </>
                    ) : (
                      /* Other slides: plain line 1, italic line 2 */
                      <>
                        {slide.titlePlain}
                        <br />
                        <em style={{ fontStyle: 'italic', color: '#e2b97a' }}>{slide.titleLine2}</em>
                      </>
                    )}
                  </h1>

                  {/* Body */}
                  <p className="rpl fade-delay-3 mt-5 max-w-[300px] text-[13.5px] leading-[1.95] text-white/60">
                    {slide.body}
                  </p>

                  {/* CTAs */}
                  <div className="rpl fade-delay-4 mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.cta1Href}
                      className="cursor-hover inline-flex items-center gap-2 rounded-[6px] bg-[#c67a42] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_28px_rgba(198,122,66,.40)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(198,122,66,.50)]"
                    >
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {slide.cta1Label}
                    </Link>

                    {slide.cta2Label && (
                      <Link
                        href={slide.cta2Href!}
                        className="cursor-hover inline-flex items-center gap-2 rounded-[6px] border border-white/28 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/12"
                      >
                        {slide.cta2Label}
                      </Link>
                    )}
                  </div>

                  {/* Stats — hero only */}
                  {slide.stats && (
                    <div className="rpl fade-delay-5 mt-8 flex items-center gap-7 border-t border-white/12 pt-6">
                      {slide.stats.map((s) => (
                        <div key={s.label}>
                          <div className="text-lg font-semibold text-white">{s.value}</div>
                          <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/38">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ghost "next" label */}
                  {slide.ghostNext && (
                    <div className="rpl fade-delay-5 mt-7 text-[13px] font-light text-white/20">
                      {slide.ghostNext}
                    </div>
                  )}
                </div>

                {/* RIGHT — cards */}
                <div className="relative hidden overflow-visible lg:block" style={{ height: 520 }}>
                  <div className="absolute" style={{ left: 40, top: 60, perspective: 1800 }}>

                    {slide.editorial ? (
                      /* Story slide — single editorial card */
                      <div
                        className="rpl card-1 relative cursor-pointer overflow-hidden rounded-[18px] border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,.55)]"
                        style={{ width: 252, height: 370 }}
                      >
                        <Image src={slide.bg} alt="TuloPots Studio" fill className="object-cover" />
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,0) 55%)' }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
                          <div className="text-[15px] font-semibold text-white">TuloPots Studio</div>
                          <div className="mt-1 text-[11px] italic text-white/50">Est. 2016 – Nairobi</div>
                        </div>
                      </div>

                    ) : (
                      /* Product cards — 3 staggered */
                      <div className="flex items-start">
                        {(slide.cardSlugs ?? []).map((slug, ci) => {
                          const product = productMap[slug];
                          if (!product) return null;

                          const imgSrc = imageOverride[slug] || product.image;

                          const W  = ci === 0 ? 210 : ci === 1 ? 192 : 175;
                          const H  = ci === 0 ? 370 : ci === 1 ? 340 : 314;
                          const IH = ci === 0 ? 245 : ci === 1 ? 222 : 202;
                          const MT = ci === 0 ? 0   : ci === 1 ? 28  : 50;
                          const ML = ci === 0 ? 0   : 12;

                          return (
                            <div
                              key={slug}
                              className={`rpl card-${ci + 1} relative flex flex-col overflow-hidden rounded-[18px] shadow-[0_20px_64px_rgba(0,0,0,.38)] transition duration-300 hover:-translate-y-1.5`}
                              style={{
                                width: W, height: H,
                                marginTop: MT, marginLeft: ML,
                                zIndex: 30 - ci,
                                border: '1px solid rgba(255,255,255,0.13)',
                              }}
                            >
                              {/* Image */}
                              <div className="relative flex-shrink-0" style={{ height: IH }}>
                                <Image src={imgSrc} alt={product.name} fill className="object-cover" />
                              </div>

                              {/* Info zone — gradient overlay, no solid bg */}
                              <div
                                className="flex flex-1 flex-col justify-end px-3.5 pb-4 text-white"
                                style={{
                                  background:
                                    'linear-gradient(to top,rgba(18,8,4,.92) 0%,rgba(18,8,4,.55) 55%,rgba(18,8,4,0) 100%)',
                                }}
                              >
                                <div
                                  className="serif-display text-[13.5px] font-semibold leading-tight text-white"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {product.name}
                                </div>
                                <div className="mt-0.5 text-[10px] italic text-white/48">
                                  {product.short}
                                </div>
                                <div className="mt-1.5 text-[13px] font-bold leading-none text-white">
                                  <span className="mr-0.5 text-[10px] font-normal text-white/55">KSh</span>
                                  {Number(product.price).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}

      {/* ── Left arrow nav ── */}
      <div className="absolute left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <button
          onClick={goPrev}
          className="cursor-hover flex h-9 w-9 items-center justify-center rounded-full border border-white/18 bg-black/15 text-white backdrop-blur-sm transition hover:bg-white/15"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={goNext}
          className="cursor-hover flex h-9 w-9 items-center justify-center rounded-full border border-white/18 bg-black/15 text-white backdrop-blur-sm transition hover:bg-white/15"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Scroll hint ── */}
      <div className="absolute bottom-7 left-7 z-40 hidden items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/30 md:flex">
        <div className="h-px w-9 bg-white/20" />
        Scroll to explore
      </div>

      {/* ── Dot nav ── */}
      <div className="absolute bottom-7 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`cursor-hover rounded-full transition-all duration-300 ${
              i === current ? 'h-1.5 w-6 bg-white' : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-7 right-7 z-40 text-[10px] uppercase tracking-[0.18em] text-white/30">
        <span className="text-white/70">{String(current + 1).padStart(2, '0')}</span>
        {' '}/ {String(SLIDES.length).padStart(2, '0')}
      </div>

      {/* ─── Animations ─────────────────────────────────── */}
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100% !important;
          max-height: 100vh !important;
        }
      `}</style>

      <style jsx>{`
        /* Scene transitions */
        .scene {
          position: fixed; inset: 0;
          opacity: 0; transform: translateY(56px);
          pointer-events: none;
          transition: transform 960ms cubic-bezier(0.22,0.62,0.36,1),
                      opacity   960ms ease;
        }
        .scene.active {
          opacity: 1; transform: translateY(0);
          z-index: 20; pointer-events: auto;
        }
        .scene.prev {
          opacity: 0; transform: translateY(-56px);
          z-index: 10; pointer-events: none;
        }

        /* Parallax on background */
        .scene-bg {
          transform: scale(1.04);
          transition: transform 960ms cubic-bezier(0.22,0.62,0.36,1);
        }
        .scene.active .scene-bg { transform: scale(1); }
        .scene.prev   .scene-bg { transform: scale(1.05) translateY(-6px); }

        /* Text fade-up */
        .rpl { opacity: 0; transform: translateY(20px); }
        .scene.active .rpl { animation: fadeUp 680ms ease forwards; }

        .fade-delay-1 { animation-delay: 60ms  !important; }
        .fade-delay-2 { animation-delay: 130ms !important; }
        .fade-delay-3 { animation-delay: 210ms !important; }
        .fade-delay-4 { animation-delay: 300ms !important; }
        .fade-delay-5 { animation-delay: 400ms !important; }

        /* Cards */
        .scene.active .card-1 { animation: cardIn 780ms cubic-bezier(0.34,1.56,0.64,1) forwards; animation-delay: 170ms; }
        .scene.active .card-2 { animation: cardIn 780ms cubic-bezier(0.34,1.56,0.64,1) forwards; animation-delay: 290ms; }
        .scene.active .card-3 { animation: cardIn 780ms cubic-bezier(0.34,1.56,0.64,1) forwards; animation-delay: 410ms; }

        .scene.prev .card-1 { animation: cardOut 380ms ease-in forwards; animation-delay: 200ms; }
        .scene.prev .card-2 { animation: cardOut 380ms ease-in forwards; animation-delay: 110ms; }
        .scene.prev .card-3 { animation: cardOut 380ms ease-in forwards; animation-delay:   0ms; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          0%   { opacity: 0; transform: translate3d(48px,0,0) rotateY(-18deg) scale(0.9); }
          60%  { opacity: 1; transform: translate3d(-4px,0,0) rotateY(4deg) scale(1.01); }
          100% { opacity: 1; transform: translate3d(0,0,0) rotateY(0deg) scale(1); }
        }
        @keyframes cardOut {
          0%   { opacity: 1; transform: translate3d(0,0,0); }
          100% { opacity: 0; transform: translate3d(-60px,-8px,0) rotateY(24deg) scale(0.88); }
        }
      `}</style>
    </main>
  );
}
