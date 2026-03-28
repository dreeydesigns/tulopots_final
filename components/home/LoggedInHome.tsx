'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { products } from '../../lib/products';
import { imageByKey } from '../../lib/site';
import { useStore } from '../Providers';

const SLIDES = [
  {
    id: 'hero',
    kicker: '',
    titleTop: 'Hand',
    titleAccent: 'crafted',
    titleBottom: 'Terracotta',
    description:
      'Each pot is hand-thrown by our artisans and paired with the perfect plant to bring natural beauty into your space.',
    primaryCta: { label: 'Shop Indoor', href: '/indoor' },
    secondaryCta: { label: 'Shop Outdoor', href: '/outdoor' },
    stats: [
      { value: '120+', label: 'Pot Styles' },
      { value: '8yr', label: 'Craftsmanship' },
      { value: '100%', label: 'Natural Clay' },
    ],
    nextLabel: 'Indoor Plants',
    background: imageByKey.workshop,
    featured: null,
    storyMode: false,
    potMode: false,
    sideLabel: 'Nairobi studio selection',
    cardSlugs: [
      'ribbed-globe-peace-lily',
      'pedestal-bowl-succulents',
      'cylinder-vase-snake-plant',
    ],
  },
  {
    id: 'indoor',
    kicker: 'Home Collection',
    titleTop: 'Indoor',
    titleAccent: '',
    titleBottom: 'Plants',
    description:
      'Terracotta pieces styled for living rooms, kitchens, bedrooms, and quiet corners. Warm, breathable clay made for everyday interiors.',
    primaryCta: { label: 'Shop Indoor', href: '/indoor' },
    secondaryCta: { label: 'View Pots Only', href: '/pots' },
    stats: [
      { value: '36+', label: 'Indoor Pieces' },
      { value: '4.8', label: 'Rated' },
      { value: 'Studio', label: 'Curated' },
    ],
    nextLabel: 'Outdoor Plants',
    background: imageByKey.indoor1,
    featured: { label: 'Featured Collection', stars: 5 },
    storyMode: false,
    potMode: false,
    sideLabel: 'Indoor edit',
    cardSlugs: [
      'ribbed-globe-peace-lily',
      'pedestal-bowl-succulents',
      'jug-handle-pothos',
    ],
  },
  {
    id: 'outdoor',
    kicker: 'Garden Collection',
    titleTop: 'Outdoor',
    titleAccent: '',
    titleBottom: 'Plants',
    description:
      'A stronger terracotta range for patios, balconies, gardens, and sunlit outdoor spaces. Handmade warmth that still feels rooted and refined.',
    primaryCta: { label: 'Shop Outdoor', href: '/outdoor' },
    secondaryCta: { label: 'Browse All Pots', href: '/pots' },
    stats: [
      { value: '28+', label: 'Outdoor Pieces' },
      { value: 'Clay', label: 'Natural' },
      { value: 'Ready', label: 'Styled' },
    ],
    nextLabel: 'Pots Only',
    background: imageByKey.outdoor2,
    featured: { label: 'Outdoor Selection', stars: 5 },
    storyMode: false,
    potMode: false,
    sideLabel: 'Garden edit',
    cardSlugs: [
      'hut-sculpture-garden',
      'wide-rim-bougainvillea',
      'studio-xl-deep-palm',
    ],
  },
  {
    id: 'pots',
    kicker: 'Essential Forms',
    titleTop: 'Pots',
    titleAccent: '',
    titleBottom: 'Only',
    description:
      'A clean way to shop the form itself. Choose your terracotta piece first, then style it with your own plant pairing.',
    primaryCta: { label: 'Browse Pots', href: '/pots' },
    secondaryCta: { label: 'Contact Studio', href: '/contact' },
    stats: [
      { value: '50+', label: 'Pot Forms' },
      { value: 'Handmade', label: 'Studio' },
      { value: 'Simple', label: 'Flexible' },
    ],
    nextLabel: 'Our Story',
    background: imageByKey.workshop,
    featured: { label: 'Pots Only', stars: 5 },
    storyMode: false,
    potMode: true,
    sideLabel: 'Terracotta forms',
    cardSlugs: [],
  },
  {
    id: 'story',
    kicker: 'Nairobi Since 2016',
    titleTop: 'Our',
    titleAccent: '',
    titleBottom: 'Story',
    description:
      'Started in a small Nairobi workshop, TuloPots continues to shape pieces with the same hands, the same wheel, and the same love for natural living.',
    primaryCta: { label: 'Read Our Story', href: '/about' },
    secondaryCta: { label: 'Contact Us', href: '/contact' },
    stats: [
      { value: '2016', label: 'Founded' },
      { value: 'Nairobi', label: 'Rooted' },
      { value: 'Handmade', label: 'Always' },
    ],
    nextLabel: '',
    background: imageByKey.clay,
    featured: null,
    storyMode: true,
    potMode: false,
    sideLabel: 'Since 2016',
    cardSlugs: [],
  },
] as const;

const HERO_CARD_IMAGE_BY_SLUG: Record<string, string> = {
  'ribbed-globe-peace-lily': imageByKey.indoor1,
  'pedestal-bowl-succulents': imageByKey.indoor2,
  'cylinder-vase-snake-plant': imageByKey.indoor3,
  'jug-handle-pothos': imageByKey.indoor4,
  'hut-sculpture-garden': imageByKey.outdoor2,
  'wide-rim-bougainvillea': imageByKey.outdoor3,
  'studio-xl-deep-palm': imageByKey.outdoor1,
};

// Card sizing — original homepage.tsx values
const CARD_WIDTHS = [210, 195, 180];
const CARD_HEIGHTS = [290, 272, 255];
const CARD_MARGINS = [0, 28, -8];

function MagneticPotScene({ onBrowse, onContact }: { onBrowse: () => void; onContact: () => void }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ x: -((py - 50) / 50) * 10, y: ((px - 50) / 50) * 12 });
    setGlow({ x: px, y: py });
  };
  const onLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
  };

  return (
    <div className="absolute left-[5%] top-[3%] h-[580px] w-[720px]">
      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative h-full w-full"
        style={{ perspective: '1400px' }}
      >
        <div
          className="absolute left-[34%] top-[48%] h-[430px] w-[340px] -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(-50%,-50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 120ms ease-out',
            zIndex: 1,
          }}
        >
          <div
            className="absolute inset-0 rounded-[34px]"
            style={{
              background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 36%, rgba(255,255,255,0) 68%)`,
              filter: 'blur(2px)',
            }}
          />
          <div className="absolute inset-x-12 bottom-6 h-10 rounded-full bg-black/35 blur-2xl" />
          <div className="absolute inset-x-0 bottom-8 top-0 mx-auto flex w-[260px] items-end justify-center">
            <div className="relative h-[326px] w-[228px]">
              <div className="absolute left-1/2 top-[18px] z-20 h-[138px] w-[138px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_40%,#5c8f52_0%,#395d34_58%,#213720_100%)] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                <div className="absolute left-1/2 top-[-10px] h-[34px] w-[10px] -translate-x-1/2 rounded-full bg-[#5f3f22]" />
                <div className="absolute left-[28px] top-[10px] h-[80px] w-[12px] rotate-[-28deg] rounded-full bg-[#4b7c43]" />
                <div className="absolute left-[88px] top-[16px] h-[76px] w-[11px] rotate-[22deg] rounded-full bg-[#588d4f]" />
                <div className="absolute left-[56px] top-[4px] h-[96px] w-[12px] rotate-[-6deg] rounded-full bg-[#6ea364]" />
                <div className="absolute left-[94px] top-[42px] h-[58px] w-[10px] rotate-[42deg] rounded-full bg-[#43693b]" />
                <div className="absolute left-[40px] top-[42px] h-[56px] w-[10px] rotate-[-44deg] rounded-full bg-[#4f7d44]" />
              </div>
              <div
                className="absolute bottom-[22px] left-1/2 z-10 h-[176px] w-[196px] -translate-x-1/2 rounded-b-[44%] rounded-t-[38%]"
                style={{
                  background: 'linear-gradient(180deg,#d98956 0%,#b96b3d 28%,#9f5b34 58%,#7d4729 100%)',
                  boxShadow:
                    'inset -16px -26px 32px rgba(71,36,18,0.32),inset 10px 10px 18px rgba(255,212,180,0.18),0 24px 50px rgba(0,0,0,0.28)',
                }}
              >
                <div className="absolute left-1/2 top-[-10px] h-[28px] w-[204px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#e6a578_0%,#b96b3d_68%,#8a4d2e_100%)] shadow-[0_8px_18px_rgba(0,0,0,0.18)]" />
                <div className="absolute left-1/2 top-[2px] h-[16px] w-[146px] -translate-x-1/2 rounded-full bg-[#724022]" />
                <div className="absolute inset-x-[18px] bottom-[34px] top-[40px] rounded-[40%] border border-white/10 opacity-30" />
                <div className="absolute inset-x-[34px] bottom-[56px] top-[64px] rounded-[40%] border border-black/8 opacity-20" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-[4%] top-[18%] z-20 w-[340px] rounded-[34px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(22,10,6,0.94)_28%,rgba(16,9,5,0.98)_100%)] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
              Interactive Pot
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Move cursor</div>
          </div>
          <div className="serif-display text-[26px] leading-none text-white">Signature Clay Pot</div>
          <p className="mt-4 text-[12px] leading-6 text-white/60">
            Rotate the pot preview, feel the form, then move straight into purchase or browse the full terracotta selection.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={onBrowse}
              type="button"
              className="cursor-hover inline-flex h-11 items-center justify-center rounded-full bg-[#d0824d] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c3723d]"
            >
              Shop Pots
            </button>
            <button
              onClick={onContact}
              type="button"
              className="cursor-hover inline-flex h-11 items-center justify-center rounded-full border border-white/16 bg-white/8 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/14"
            >
              Contact Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoggedInHome() {
  const { addToCart, theme } = useStore();
  const router = useRouter();
  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.slug, p])), []);

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);

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

  const replaySceneAnimations = (idx: number) => {
    const scene = sceneRefs.current[idx];
    if (!scene) return;
    scene.querySelectorAll<HTMLElement>('.replay').forEach((el) => {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });
  };

  const goTo = (next: number) => {
    if (animating || next === current || next < 0 || next >= SLIDES.length) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(next);
    window.setTimeout(() => replaySceneAnimations(next), 50);
    window.setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 920);
  };

  const goNext = () => goTo(current + 1);
  const goPrev = () => goTo(current - 1);
  const handleBuyNow = (product: (typeof products)[number]) => {
    addToCart(product, { quantity: 1 });
    router.push('/cart');
  };

  useEffect(() => {
    replaySceneAnimations(0);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (animating || Math.abs(e.deltaY) < 14) return;
      e.preventDefault();
      if (e.deltaY > 0) goNext();
      else goPrev();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - (e.changedTouches[0]?.clientY ?? touchStartY.current);
      if (Math.abs(delta) > 50) {
        if (delta > 0) goNext();
        else goPrev();
      }
      touchStartY.current = null;
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [animating, current]);

  return (
    <main className={`fixed inset-0 overflow-hidden ${theme === 'light' ? 'tp-scene-light' : 'tp-scene-dark'}`}>
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        const isPrev = index === prev;
        return (
          <section
            key={slide.id}
            ref={(el) => {
              sceneRefs.current[index] = el;
            }}
            className={`scene${isActive ? ' active' : ''}${isPrev ? ' prev' : ''}`}
          >
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.background}
                alt={`${slide.titleTop} ${slide.titleBottom}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="tp-scene-overlay tp-scene-overlay-a absolute inset-0" />
              <div className="tp-scene-overlay tp-scene-overlay-b absolute inset-0" />
            </div>

            {slide.featured && (
              <div className="absolute right-10 top-[86px] z-30 hidden lg:block">
                <div className="text-right text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
                  {slide.featured.label}
                </div>
                <div className="mt-2 flex justify-end gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${
                        s <= slide.featured.stars ? 'fill-[#e0b97a] text-[#e0b97a]' : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="relative z-20 mx-auto flex h-screen max-w-[1600px] items-center px-[4.5%] pb-[84px] pt-[84px]">
              <div className="grid w-full items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] xl:gap-20">
                <div className="relative z-30 max-w-[430px] text-white">
                  {slide.kicker ? (
                    <p className="fade-item fade-1 mb-5 text-[11px] uppercase tracking-[0.24em] text-white/40">
                      {slide.kicker}
                    </p>
                  ) : (
                    <div className="mb-5 h-[19px]" />
                  )}

                  <h1
                    className="fade-item fade-2 serif-display leading-[0.92] text-white"
                    style={{ fontSize: 'clamp(3.5rem, 6vw, 6.35rem)' }}
                  >
                    {slide.titleTop}
                    {slide.titleAccent ? (
                      <em className="text-[#e0b97a]" style={{ fontStyle: 'italic' }}>
                        {slide.titleAccent}
                      </em>
                    ) : null}
                    <br />
                    {slide.titleBottom}
                  </h1>

                  <p className="fade-item fade-3 mt-7 max-w-[340px] text-[14px] leading-[1.9] text-white/68 md:text-[15px]">
                    {slide.description}
                  </p>

                  <div className="fade-item fade-4 mt-9 flex flex-wrap gap-3">
                    <Link
                      href={slide.primaryCta.href}
                      className="cursor-hover inline-flex items-center gap-2 rounded-full bg-[#d0824d] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_rgba(208,130,77,0.28)] transition hover:-translate-y-0.5 hover:bg-[#c3723d]"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      {slide.primaryCta.label}
                    </Link>
                    <Link
                      href={slide.secondaryCta.href}
                      className="cursor-hover inline-flex items-center rounded-full border border-white/18 bg-black/10 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                    >
                      {slide.secondaryCta.label}
                    </Link>
                  </div>

                  <div className="fade-item fade-5 mt-11 grid max-w-[380px] grid-cols-3 gap-6 border-t border-white/10 pt-6">
                    {slide.stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="text-[1.75rem] font-semibold leading-none text-white">{stat.value}</div>
                        <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/38">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {slide.nextLabel ? (
                    <div className="fade-item fade-5 mt-8 text-[13px] font-light text-white/22">
                      {slide.nextLabel}
                    </div>
                  ) : null}
                </div>

                <div className="pointer-events-none relative hidden overflow-visible lg:block" style={{ height: '560px' }}>
                  {slide.storyMode ? (
                    <div className="absolute top-1/2 right-0 flex w-full -translate-y-1/2 items-start pr-10">
                      <div
                        className="replay card-stage card-1 pointer-events-auto flex-shrink-0 cursor-pointer overflow-hidden rounded-[18px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]"
                        style={{ width: CARD_WIDTHS[0], height: CARD_HEIGHTS[0] }}
                        onClick={() => router.push('/about')}
                      >
                        <div className="group relative h-full w-full bg-[#1a1a1a]">
                          <Image
                            src={imageByKey.clay}
                            alt="TuloPots Studio"
                            fill
                            sizes="210px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3.5">
                            <div className="text-[12px] font-medium tracking-[0.04em] text-white">
                              TuloPots Studio
                            </div>
                            <div className="text-[10px] italic text-white/60">Est. 2016 — Nairobi</div>
                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                              <Link
                                href="/about"
                                onClick={(e) => e.stopPropagation()}
                                className="pointer-events-auto flex items-center justify-center rounded-full bg-[#d0824d] px-2 py-1.5 text-[7px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#c3723d]"
                              >
                                Read Story
                              </Link>
                              <Link
                                href="/contact"
                                onClick={(e) => e.stopPropagation()}
                                className="pointer-events-auto flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-2 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/14"
                              >
                                Contact
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : slide.potMode ? (
                    <MagneticPotScene onBrowse={() => router.push('/pots')} onContact={() => router.push('/contact')} />
                  ) : (
                    <>
                      <div className="replay fade-up delay-2 absolute left-[60px] top-[44px] z-30 flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-[#f2c94c] text-[#f2c94c]" />
                        ))}
                        <Star className="h-3.5 w-3.5 text-white/28" />
                      </div>

                      {slide.sideLabel && (
                        <div className="replay fade-up delay-2 absolute left-[60px] top-[68px] z-30">
                          <div className="text-[11px] uppercase tracking-[0.14em] text-white/68">
                            {slide.sideLabel}
                          </div>
                        </div>
                      )}

                      <div className="absolute top-1/2 right-0 flex w-full -translate-y-1/2 items-start pr-10">
                        {slide.cardSlugs.map((slug, ci) => {
                          const product = productMap[slug];
                          if (!product) return null;

                          const imageSrc = HERO_CARD_IMAGE_BY_SLUG[slug] || product.image;
                          const imageHeight = Math.round(CARD_HEIGHTS[ci] * 0.65);

                          return (
                            <div
                              key={slug}
                              className={`replay card-stage card-${ci + 1} pointer-events-auto flex flex-col flex-shrink-0 overflow-hidden rounded-[18px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]`}
                              style={{
                                width: CARD_WIDTHS[ci],
                                height: CARD_HEIGHTS[ci],
                                marginTop: CARD_MARGINS[ci],
                                marginLeft: ci === 0 ? 0 : 12,
                                zIndex: 30 - ci,
                                background: '#111',
                              }}
                            >
                              <div
                                className="relative w-full flex-shrink-0 overflow-hidden"
                                style={{ height: imageHeight }}
                              >
                                <Image
                                  src={imageSrc}
                                  alt={product.name}
                                  fill
                                  sizes="210px"
                                  className="object-cover transition-transform duration-500 hover:scale-[1.06]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                              </div>

                              <div
                                className="flex flex-1 flex-col justify-between px-3 pt-2.5 pb-3"
                                style={{ background: 'linear-gradient(180deg,#0e0906 0%,#080503 100%)' }}
                              >
                                <div>
                                  <div className="line-clamp-1 text-[11px] font-medium tracking-[0.03em] text-white/90">
                                    {product.name}
                                  </div>
                                  <div className="mt-0.5 font-serif text-[13px] font-semibold text-[#e0b97a]">
                                    KSh {Number(product.price).toLocaleString()}
                                  </div>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-1.5">
                                  <button
                                    onClick={() => handleBuyNow(product)}
                                    className="flex min-w-0 items-center justify-center rounded-full bg-[#d0824d] px-2 py-1.5 text-[7px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#c3723d]"
                                  >
                                    Buy Now
                                  </button>

                                  <Link
                                    href={`/product/${product.slug}`}
                                    className="flex min-w-0 items-center justify-center rounded-full border border-white/18 bg-white/5 px-2 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-white/78 transition hover:bg-white/10 hover:text-white/92"
                                  >
                                    View Item
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <div className="absolute left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <button
          onClick={goPrev}
          type="button"
          className="cursor-hover flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/18 text-white backdrop-blur-sm transition hover:bg-white/10"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={goNext}
          type="button"
          className="cursor-hover flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/18 text-white backdrop-blur-sm transition hover:bg-white/10"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute bottom-7 left-7 z-40 hidden items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/28 md:flex">
        <div className="h-px w-10 bg-white/16" />
        Scroll to explore
      </div>

      <div className="absolute bottom-7 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goTo(index)}
            type="button"
            className={`cursor-hover rounded-full transition-all duration-300 ${
              index === current ? 'h-1.5 w-7 bg-white' : 'h-1.5 w-1.5 bg-white/28 hover:bg-white/48'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-7 right-24 z-40 text-[10px] uppercase tracking-[0.18em] text-white/30 md:right-28">
        <span className="text-white/76">{String(current + 1).padStart(2, '0')}</span> /{' '}
        {String(SLIDES.length).padStart(2, '0')}
      </div>

      <style jsx global>{`
        html,
        body {
          overflow: hidden !important;
          height: 100% !important;
          max-height: 100vh !important;
          overscroll-behavior: none;
        }
      `}</style>

      <style jsx>{`
        .scene {
          position: fixed;
          inset: 0;
          opacity: 0;
          transform: translateY(60px);
          pointer-events: none;
          transition:
            transform 920ms cubic-bezier(0.22, 0.61, 0.36, 1),
            opacity 920ms ease;
        }

        .scene.active {
          opacity: 1;
          transform: translateY(0);
          z-index: 20;
          pointer-events: auto;
        }

        .scene.prev {
          opacity: 0;
          transform: translateY(-60px);
          z-index: 10;
          pointer-events: none;
        }

        .tp-scene-light {
          background: #f7f2ea;
        }

        .tp-scene-dark {
          background: #140c08;
        }

        .tp-scene-light .tp-scene-overlay-a {
          background: linear-gradient(
            90deg,
            rgba(24, 16, 12, 0.5) 0%,
            rgba(24, 16, 12, 0.34) 28%,
            rgba(24, 16, 12, 0.1) 56%,
            rgba(24, 16, 12, 0.04) 100%
          );
        }

        .tp-scene-light .tp-scene-overlay-b {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.12) 0%,
            rgba(0, 0, 0, 0.04) 38%,
            rgba(0, 0, 0, 0.02) 100%
          );
        }

        .tp-scene-dark .tp-scene-overlay-a {
          background: linear-gradient(
            90deg,
            rgba(16, 10, 7, 0.82) 0%,
            rgba(16, 10, 7, 0.6) 28%,
            rgba(16, 10, 7, 0.24) 56%,
            rgba(16, 10, 7, 0.1) 100%
          );
        }

        .tp-scene-dark .tp-scene-overlay-b {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.36) 0%,
            rgba(0, 0, 0, 0.1) 38%,
            rgba(0, 0, 0, 0.04) 100%
          );
        }

        .fade-item {
          opacity: 0;
          transform: translateY(16px);
        }

        .scene.active .fade-item {
          animation: fadeUp 620ms ease forwards;
        }

        .fade-1 {
          animation-delay: 40ms !important;
        }

        .fade-2 {
          animation-delay: 110ms !important;
        }

        .fade-3 {
          animation-delay: 180ms !important;
        }

        .fade-4 {
          animation-delay: 250ms !important;
        }

        .fade-5 {
          animation-delay: 320ms !important;
        }

        .card-stage {
          opacity: 0;
          transform-origin: center center;
        }

        .scene.active .card-stage {
          animation: cardEnter 760ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .scene.prev .card-stage {
          animation: cardExit 400ms ease-in forwards;
        }

        .scene.active .card-1 {
          animation-delay: 180ms;
        }

        .scene.active .card-2 {
          animation-delay: 300ms;
        }

        .scene.active .card-3 {
          animation-delay: 420ms;
        }

        .scene.prev .card-3 {
          animation-delay: 0ms;
        }

        .scene.prev .card-2 {
          animation-delay: 120ms;
        }

        .scene.prev .card-1 {
          animation-delay: 240ms;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardEnter {
          0% {
            opacity: 0;
            transform: translateX(55px) rotate(2deg);
          }
          55% {
            opacity: 1;
            transform: translateX(8px) rotate(0.4deg);
          }
          72% {
            opacity: 1;
            transform: translateX(-3px) rotate(-0.2deg);
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes cardExit {
          0% {
            opacity: 1;
          }
          40% {
            opacity: 1;
            transform: translateX(-20px) rotate(-1deg);
          }
          100% {
            opacity: 0;
            transform: translateX(-80px) rotate(-3deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scene,
          .fade-item,
          .card-stage,
          .scene.active .fade-item {
            animation: none !important;
            transition: none !important;
          }

          .scene {
            opacity: 0;
            transform: none !important;
          }

          .scene.active {
            opacity: 1;
          }

          .fade-item,
          .card-stage {
            opacity: 1;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}