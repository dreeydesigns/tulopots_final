'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
    cardSlugs: [],
  },
] as const;

const HERO_CARD_IMAGE_BY_SLUG: Record<string, string> = {
  'ribbed-globe-peace-lily': imageByKey.indoor1,
  'pedestal-bowl-succulents': imageByKey.indoor1,
  'cylinder-vase-snake-plant': imageByKey.indoor1,
  'jug-handle-pothos': imageByKey.indoor1,

  'hut-sculpture-garden': imageByKey.outdoor2,
  'wide-rim-bougainvillea': imageByKey.outdoor2,
  'studio-xl-deep-palm': imageByKey.outdoor2,
};

const CARD_POSITIONS = [
  { left: 0, top: 18, zIndex: 24, rotate: -6 },
  { left: 196, top: 54, zIndex: 23, rotate: -1.5 },
  { left: 392, top: 90, zIndex: 22, rotate: 4.5 },
] as const;

function ProductCard({
  product,
  imageSrc,
  style,
  onBuyNow,
}: {
  product: (typeof products)[number];
  imageSrc: string;
  style?: CSSProperties;
  onBuyNow: () => void;
}) {
  return (
    <div className="tp-card tp-card--funnel" style={style}>
      <div className="tp-card__image">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="286px"
          className="object-cover"
        />
        <div className="tp-card__image-fade" />
      </div>

      <div className="tp-card__bottom">
        <div
          className="tp-card__title serif-display"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </div>

        <div className="tp-card__price">KSh {Number(product.price).toLocaleString()}</div>

        <div className="tp-card__cta">
          <button onClick={onBuyNow} className="tp-card__buy cursor-hover" type="button">
            Buy Now
          </button>

          <Link href={`/product/${product.slug}`} className="tp-card__view cursor-hover">
            View Item
          </Link>
        </div>
      </div>
    </div>
  );
}

function StoryCard() {
  return (
    <div className="tp-story-card">
      <div className="tp-story-card__image">
        <Image
          src={imageByKey.clay}
          alt="TuloPots Studio"
          fill
          sizes="320px"
          className="object-cover"
        />
      </div>

      <div className="tp-story-card__bottom">
        <div className="tp-story-card__title serif-display">TuloPots Studio</div>
        <div className="tp-story-card__meta">Est. 2016 — Nairobi</div>
        <Link href="/about" className="tp-story-card__button cursor-hover">
          Read More
        </Link>
      </div>
    </div>
  );
}

function MagneticPotScene({
  onBrowse,
  onContact,
}: {
  onBrowse: () => void;
  onContact: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    setTilt({
      x: -((py - 50) / 50) * 10,
      y: ((px - 50) / 50) * 12,
    });

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
            transform: `translate(-50%, -50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
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
                  background:
                    'linear-gradient(180deg, #d98956 0%, #b96b3d 28%, #9f5b34 58%, #7d4729 100%)',
                  boxShadow:
                    'inset -16px -26px 32px rgba(71,36,18,0.32), inset 10px 10px 18px rgba(255,212,180,0.18), 0 24px 50px rgba(0,0,0,0.28)',
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
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">
              Move cursor
            </div>
          </div>

          <div className="serif-display text-[26px] leading-none text-white">
            Signature Clay Pot
          </div>

          <p className="mt-4 text-[12px] leading-6 text-white/60">
            Rotate the pot preview, feel the form, then move straight into purchase or browse the
            full terracotta selection.
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

  const productMap = useMemo(
    () => Object.fromEntries(products.map((product) => [product.slug, product])),
    []
  );

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const touchStartY = useRef<number | null>(null);

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

  const goTo = (nextIndex: number) => {
    if (animating || nextIndex === current || nextIndex < 0 || nextIndex >= SLIDES.length) return;

    setAnimating(true);
    setPrev(current);
    setCurrent(nextIndex);

    window.setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 680);
  };

  const goNext = () => goTo(current + 1);
  const goPrev = () => goTo(current - 1);

  const handleBuyNow = (product: (typeof products)[number]) => {
    addToCart(product, { quantity: 1 });
    router.push('/cart');
  };

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

      const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - endY;

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
    <main
      className={`fixed inset-0 overflow-hidden ${
        theme === 'light' ? 'tp-scene-light' : 'tp-scene-dark'
      }`}
    >
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        const isPrev = index === prev;

        return (
          <section
            key={slide.id}
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
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= slide.featured.stars
                          ? 'fill-[#e0b97a] text-[#e0b97a]'
                          : 'text-white/20'
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
                        <div className="text-[1.75rem] font-semibold leading-none text-white">
                          {stat.value}
                        </div>
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

                <div className="relative z-20 hidden h-[580px] lg:block">
                  {slide.storyMode ? (
                    <div className="absolute left-[12%] top-[7%]">
                      <StoryCard />
                    </div>
                  ) : slide.potMode ? (
                    <MagneticPotScene
                      onBrowse={() => router.push('/pots')}
                      onContact={() => router.push('/contact')}
                    />
                  ) : (
                    <div className="absolute left-[10%] top-[4%] h-[540px] w-[760px]">
                      {slide.cardSlugs.map((slug, cardIndex) => {
                        const product = productMap[slug];
                        if (!product) return null;

                        const position = CARD_POSITIONS[cardIndex];
                        const imageSrc = HERO_CARD_IMAGE_BY_SLUG[slug] || product.image;

                        return (
                          <ProductCard
                            key={slug}
                            product={product}
                            imageSrc={imageSrc}
                            onBuyNow={() => handleBuyNow(product)}
                            style={{
                              position: 'absolute',
                              width: 286,
                              height: 430,
                              left: position.left,
                              top: position.top,
                              zIndex: position.zIndex,
                              transform: `rotate(${position.rotate}deg)`,
                              animationDelay: `${140 + cardIndex * 90}ms`,
                            }}
                          />
                        );
                      })}
                    </div>
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

      <div className="absolute bottom-7 right-7 z-40 text-[10px] uppercase tracking-[0.18em] text-white/30">
        <span className="text-white/76">{String(current + 1).padStart(2, '0')}</span> /{' '}
        {String(SLIDES.length).padStart(2, '0')}
      </div>

      <style jsx global>{`
        html,
        body {
          overflow: hidden !important;
          height: 100% !important;
          max-height: 100vh !important;
        }
      `}</style>

      <style jsx>{`
        .scene {
          position: fixed;
          inset: 0;
          opacity: 0;
          transform: translateY(26px);
          pointer-events: none;
          transition:
            opacity 680ms ease,
            transform 680ms cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .scene.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          z-index: 20;
        }

        .scene.prev {
          opacity: 0;
          transform: translateY(-24px);
          pointer-events: none;
          z-index: 10;
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

        .tp-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(9, 5, 3, 0.48);
          box-shadow:
            0 34px 90px rgba(0, 0, 0, 0.46),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          opacity: 0;
          animation: cardIn 720ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          transition:
            transform 320ms ease,
            box-shadow 320ms ease,
            border-color 320ms ease;
        }

        .tp-card--funnel:hover {
          transform: translateY(-10px) scale(1.015) !important;
          box-shadow:
            0 42px 110px rgba(0, 0, 0, 0.56),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .tp-card__image {
          position: relative;
          height: 74%;
          overflow: hidden;
          background: #e8e0d6;
        }

        .tp-card__image :global(img) {
          transition: transform 520ms ease;
        }

        .tp-card--funnel:hover .tp-card__image :global(img) {
          transform: scale(1.06);
        }

        .tp-card__image-fade {
          position: absolute;
          inset: auto 0 0 0;
          height: 150px;
          background: linear-gradient(
            to top,
            rgba(10, 5, 3, 0.92) 0%,
            rgba(10, 5, 3, 0.42) 42%,
            rgba(10, 5, 3, 0) 100%
          );
        }

        .tp-card__bottom {
          position: relative;
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: flex-end;
          padding: 18px 18px 18px;
          background: linear-gradient(
            180deg,
            rgba(20, 10, 6, 0.78) 0%,
            rgba(14, 7, 4, 0.95) 34%,
            rgba(8, 4, 2, 1) 100%
          );
        }

        .tp-card__title {
          min-height: 44px;
          font-size: 18px;
          line-height: 1.08;
          color: rgba(255, 255, 255, 0.96);
          letter-spacing: 0.01em;
        }

        .tp-card__price {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #e0b97a;
          letter-spacing: 0.05em;
        }

        .tp-card__cta {
          display: grid;
          grid-template-rows: 42px 38px;
          gap: 8px;
          margin-top: 0;
          max-height: 0;
          opacity: 0;
          transform: translateY(14px);
          overflow: hidden;
          transition:
            max-height 280ms ease,
            opacity 240ms ease,
            transform 280ms ease,
            margin-top 280ms ease;
        }

        .tp-card--funnel:hover .tp-card__cta {
          margin-top: 14px;
          max-height: 100px;
          opacity: 1;
          transform: translateY(0);
        }

        .tp-card__buy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 42px;
          border-radius: 9999px;
          background: #d0824d;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition:
            background 220ms ease,
            transform 220ms ease,
            box-shadow 220ms ease;
          box-shadow: 0 10px 24px rgba(208, 130, 77, 0.22);
        }

        .tp-card__buy:hover {
          background: #c3723d;
          transform: translateY(-1px);
        }

        .tp-card__view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.72);
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition:
            background 220ms ease,
            color 220ms ease,
            border-color 220ms ease;
        }

        .tp-card__view:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.94);
          border-color: rgba(255, 255, 255, 0.22);
        }

        .tp-story-card {
          width: 320px;
          height: 450px;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 24px 72px rgba(0, 0, 0, 0.34);
          backdrop-filter: blur(6px);
          animation: cardIn 700ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        .tp-story-card__image {
          position: relative;
          height: 64%;
          background: #efebe5;
        }

        .tp-story-card__bottom {
          display: flex;
          height: 36%;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px 18px 18px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.02) 0%,
            rgba(19, 9, 5, 0.84) 18%,
            rgba(14, 7, 4, 0.98) 100%
          );
          color: white;
        }

        .tp-story-card__title {
          font-size: 20px;
          line-height: 1.1;
        }

        .tp-story-card__meta {
          margin-top: 8px;
          font-size: 11px;
          font-style: italic;
          color: rgba(255, 255, 255, 0.56);
        }

        .tp-story-card__button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 18px;
          width: fit-content;
          min-width: 120px;
          height: 42px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          padding: 0 18px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: white;
        }

        .tp-story-card__button:hover {
          background: rgba(255, 255, 255, 0.14);
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

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translate3d(28px, 0, 0) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scene,
          .fade-item,
          .tp-card,
          .tp-story-card,
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
          .tp-card,
          .tp-story-card {
            opacity: 1;
            transform: none !important;
          }

          .tp-card__cta {
            margin-top: 14px;
            max-height: 100px;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}