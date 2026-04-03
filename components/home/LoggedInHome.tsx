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

import { products, type Product } from '../../lib/products';
import { imageByKey } from '../../lib/site';
import { money } from '../../lib/utils';
import { useStore } from '../Providers';

type SlideCardItem = {
  slug: string;
};

type Slide = {
  id: string;
  kicker: string;
  titleTop: string;
  titleAccent?: string;
  titleBottom: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: Array<{ value: string; label: string }>;
  nextLabel: string;
  background: string;
  featured: { label: string; stars: number } | null;
  storyMode: boolean;
  potMode: boolean;
  sideLabel: string;
  cardItems: SlideCardItem[];
};

const CARD_LIBRARY: Record<
  string,
  {
    displayName: string;
    image: string;
  }
> = {
  'ribbed-globe-peace-lily': {
    displayName: 'Zuri',
    image: imageByKey.indoor1,
  },
  'pedestal-bowl-succulents': {
    displayName: 'Kaya',
    image: imageByKey.indoor2,
  },
  'cylinder-vase-snake-plant': {
    displayName: 'Nia',
    image: imageByKey.indoor3,
  },
  'jug-handle-pothos': {
    displayName: 'Amani',
    image: imageByKey.indoor4,
  },
  'hut-sculpture-garden': {
    displayName: 'Boma',
    image: imageByKey.outdoor2,
  },
  'wide-rim-bougainvillea': {
    displayName: 'Mara',
    image: imageByKey.outdoor3,
  },
  'studio-xl-deep-palm': {
    displayName: 'Jua',
    image: imageByKey.outdoor1,
  },
};

const SLIDES: Slide[] = [
  {
    id: 'hero',
    kicker: 'Handcrafted in Nairobi',
    titleTop: 'Crafted',
    titleAccent: '',
    titleBottom: 'for Living',
    description:
      'Clay presence shaped for rooms that ask for warmth, balance, and quiet calm.',
    primaryCta: { label: 'View Collection', href: '/indoor' },
    secondaryCta: { label: 'Clay Forms', href: '/pots' },
    stats: [
      { value: '120+', label: 'Forms' },
      { value: '8yr', label: 'Craft' },
      { value: '100%', label: 'Terracotta' },
    ],
    nextLabel: 'Interior Spaces',
    background: imageByKey.workshop,
    featured: null,
    storyMode: false,
    potMode: false,
    sideLabel: 'Studio Selection',
    cardItems: [
      { slug: 'ribbed-globe-peace-lily' },
      { slug: 'pedestal-bowl-succulents' },
      { slug: 'cylinder-vase-snake-plant' },
    ],
  },
  {
    id: 'indoor',
    kicker: 'Interior Collection',
    titleTop: 'For',
    titleAccent: '',
    titleBottom: 'Interior Spaces',
    description:
      'Pieces for shelves, tables, corners, and rooms that feel better when presence is placed well.',
    primaryCta: { label: 'View Interior', href: '/indoor' },
    secondaryCta: { label: 'Clay Forms', href: '/pots' },
    stats: [
      { value: '36+', label: 'Selections' },
      { value: '4.8', label: 'Rated' },
      { value: 'Studio', label: 'Curated' },
    ],
    nextLabel: 'Open Spaces',
    background: imageByKey.indoor1,
    featured: { label: 'Interior Selection', stars: 5 },
    storyMode: false,
    potMode: false,
    sideLabel: 'Desk, Shelf, Corner',
    cardItems: [
      { slug: 'ribbed-globe-peace-lily' },
      { slug: 'pedestal-bowl-succulents' },
      { slug: 'jug-handle-pothos' },
    ],
  },
  {
    id: 'outdoor',
    kicker: 'Outdoor Collection',
    titleTop: 'For',
    titleAccent: '',
    titleBottom: 'Open Spaces',
    description:
      'Pieces for terraces, entrances, gardens, courtyards, and open-air living with restraint.',
    primaryCta: { label: 'View Open Spaces', href: '/outdoor' },
    secondaryCta: { label: 'Clay Forms', href: '/pots' },
    stats: [
      { value: '28+', label: 'Selections' },
      { value: 'Natural', label: 'Clay' },
      { value: 'Ready', label: 'Placed' },
    ],
    nextLabel: 'Clay Forms',
    background: imageByKey.outdoor2,
    featured: { label: 'Outdoor Selection', stars: 5 },
    storyMode: false,
    potMode: false,
    sideLabel: 'Patio, Balcony, Garden',
    cardItems: [
      { slug: 'hut-sculpture-garden' },
      { slug: 'wide-rim-bougainvillea' },
      { slug: 'studio-xl-deep-palm' },
    ],
  },
  {
    id: 'pots',
    kicker: 'Essential Collection',
    titleTop: 'Clay',
    titleAccent: '',
    titleBottom: 'Forms',
    description:
      'A curated selection of handmade forms where shape leads, placement follows, and presence matters.',
    primaryCta: { label: 'View Forms', href: '/pots' },
    secondaryCta: { label: 'Contact Studio', href: '/contact' },
    stats: [
      { value: '50+', label: 'Forms' },
      { value: 'Handmade', label: 'Studio' },
      { value: 'Flexible', label: 'Use' },
    ],
    nextLabel: 'Rooted in Craft',
    background: imageByKey.workshop,
    featured: { label: 'Clay Forms', stars: 5 },
    storyMode: false,
    potMode: true,
    sideLabel: 'Shape First',
    cardItems: [],
  },
  {
    id: 'rooted',
    kicker: 'Studio Process',
    titleTop: 'Rooted',
    titleAccent: '',
    titleBottom: 'in Craft',
    description:
      'Made with patience, material honesty, and the quiet character that gives each piece its own life.',
    primaryCta: { label: 'Clay Forms', href: '/pots' },
    secondaryCta: { label: 'Contact Studio', href: '/contact' },
    stats: [
      { value: 'Handmade', label: 'Method' },
      { value: 'Nairobi', label: 'Origin' },
      { value: 'Small Batch', label: 'Approach' },
    ],
    nextLabel: 'Our Story',
    background: imageByKey.clay,
    featured: { label: 'Material & Process', stars: 5 },
    storyMode: false,
    potMode: false,
    sideLabel: 'Material, Shape, Finish',
    cardItems: [
      { slug: 'pedestal-bowl-succulents' },
      { slug: 'hut-sculpture-garden' },
      { slug: 'wide-rim-bougainvillea' },
    ],
  },
  {
    id: 'story',
    kicker: 'Nairobi Since 2016',
    titleTop: 'Our',
    titleAccent: '',
    titleBottom: 'Story',
    description:
      'Handcrafted terracotta from Nairobi, shaped through craft rather than trend and made to live beautifully over time.',
    primaryCta: { label: 'Read Our Story', href: '/about' },
    secondaryCta: { label: 'Contact Us', href: '/contact' },
    stats: [
      { value: '2016', label: 'Founded' },
      { value: 'Nairobi', label: 'Origin' },
      { value: 'Handmade', label: 'Always' },
    ],
    nextLabel: '',
    background: imageByKey.clay,
    featured: null,
    storyMode: true,
    potMode: false,
    sideLabel: 'Our Studio',
    cardItems: [],
  },
];

const CARD_WIDTHS = [210, 195, 180];
const CARD_HEIGHTS = [290, 272, 255];
const CARD_MARGINS = [0, 28, -8];

type ThemePalette = {
  sceneText: string;
  sceneTextSoft: string;
  sceneTextFaint: string;
  sceneTextMuted: string;
  statBorder: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  primaryBtnHover: string;
  secondaryBtnBg: string;
  secondaryBtnText: string;
  secondaryBtnBorder: string;
  secondaryBtnHover: string;
  navBtnBg: string;
  navBtnBorder: string;
  navBtnText: string;
  navBtnHover: string;
  cardShell: string;
  cardInfoBg: string;
  cardTitle: string;
  cardSecondaryText: string;
  cardBorder: string;
  cardSecondaryBg: string;
  cardSecondaryHover: string;
  storyOverlay: string;
  storySecondaryBg: string;
  storySecondaryBorder: string;
  potPanelBg: string;
  potPanelBorder: string;
  potPanelText: string;
  potPanelMuted: string;
  potChipBg: string;
  potChipBorder: string;
};

function getPalette(isLight: boolean): ThemePalette {
  if (isLight) {
    return {
      sceneText: '#231711',
      sceneTextSoft: 'rgba(35,23,17,0.78)',
      sceneTextFaint: 'rgba(35,23,17,0.58)',
      sceneTextMuted: 'rgba(35,23,17,0.34)',
      statBorder: 'rgba(35,23,17,0.12)',
      primaryBtnBg: '#d0824d',
      primaryBtnText: '#ffffff',
      primaryBtnHover: '#c3723d',
      secondaryBtnBg: 'rgba(247,242,234,0.72)',
      secondaryBtnText: '#2a1b14',
      secondaryBtnBorder: 'rgba(35,23,17,0.16)',
      secondaryBtnHover: 'rgba(255,255,255,0.86)',
      navBtnBg: 'rgba(247,242,234,0.34)',
      navBtnBorder: 'rgba(35,23,17,0.14)',
      navBtnText: '#231711',
      navBtnHover: 'rgba(247,242,234,0.56)',
      cardShell: '#f6efe6',
      cardInfoBg: 'linear-gradient(180deg,rgba(248,244,239,0.98) 0%,rgba(241,231,219,0.98) 100%)',
      cardTitle: '#20140f',
      cardSecondaryText: 'rgba(32,20,15,0.72)',
      cardBorder: 'rgba(35,23,17,0.10)',
      cardSecondaryBg: 'rgba(255,255,255,0.60)',
      cardSecondaryHover: 'rgba(255,255,255,0.88)',
      storyOverlay:
        'linear-gradient(to top, rgba(247,242,234,0.94) 0%, rgba(247,242,234,0.22) 56%, rgba(247,242,234,0.04) 100%)',
      storySecondaryBg: 'rgba(255,255,255,0.62)',
      storySecondaryBorder: 'rgba(35,23,17,0.12)',
      potPanelBg:
        'linear-gradient(180deg,rgba(255,255,255,0.78) 0%,rgba(239,229,217,0.96) 100%)',
      potPanelBorder: 'rgba(35,23,17,0.10)',
      potPanelText: '#20140f',
      potPanelMuted: 'rgba(32,20,15,0.68)',
      potChipBg: 'rgba(255,255,255,0.64)',
      potChipBorder: 'rgba(35,23,17,0.10)',
    };
  }

  return {
    sceneText: '#ffffff',
    sceneTextSoft: 'rgba(255,255,255,0.72)',
    sceneTextFaint: 'rgba(255,255,255,0.58)',
    sceneTextMuted: 'rgba(255,255,255,0.30)',
    statBorder: 'rgba(255,255,255,0.10)',
    primaryBtnBg: '#d0824d',
    primaryBtnText: '#ffffff',
    primaryBtnHover: '#c3723d',
    secondaryBtnBg: 'rgba(0,0,0,0.14)',
    secondaryBtnText: '#ffffff',
    secondaryBtnBorder: 'rgba(255,255,255,0.18)',
    secondaryBtnHover: 'rgba(255,255,255,0.10)',
    navBtnBg: 'rgba(0,0,0,0.18)',
    navBtnBorder: 'rgba(255,255,255,0.14)',
    navBtnText: '#ffffff',
    navBtnHover: 'rgba(255,255,255,0.10)',
    cardShell: '#111',
    cardInfoBg: 'linear-gradient(180deg,#0e0906 0%,#080503 100%)',
    cardTitle: 'rgba(255,255,255,0.92)',
    cardSecondaryText: 'rgba(255,255,255,0.78)',
    cardBorder: 'rgba(255,255,255,0.08)',
    cardSecondaryBg: 'rgba(255,255,255,0.05)',
    cardSecondaryHover: 'rgba(255,255,255,0.10)',
    storyOverlay:
      'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 56%, rgba(0,0,0,0.04) 100%)',
    storySecondaryBg: 'rgba(255,255,255,0.08)',
    storySecondaryBorder: 'rgba(255,255,255,0.20)',
    potPanelBg:
      'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,rgba(22,10,6,0.94) 28%,rgba(16,9,5,0.98) 100%)',
    potPanelBorder: 'rgba(255,255,255,0.14)',
    potPanelText: '#ffffff',
    potPanelMuted: 'rgba(255,255,255,0.62)',
    potChipBg: 'rgba(255,255,255,0.08)',
    potChipBorder: 'rgba(255,255,255,0.14)',
  };
}

function MagneticPotScene({
  onBrowse,
  onContact,
  palette,
}: {
  onBrowse: () => void;
  onContact: () => void;
  palette: ThemePalette;
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

        <div
          className="absolute right-[4%] top-[18%] z-20 w-[340px] rounded-[34px] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-md"
          style={{
            background: palette.potPanelBg,
            border: `1px solid ${palette.potPanelBorder}`,
            color: palette.potPanelText,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div
              className="rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: palette.potChipBg,
                border: `1px solid ${palette.potChipBorder}`,
                color: palette.potPanelText,
              }}
            >
              Clay Forms
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: palette.potPanelMuted }}>
              Move cursor
            </div>
          </div>

          <div className="serif-display text-[26px] leading-none" style={{ color: palette.potPanelText }}>
            Quiet Clay Form
          </div>

          <p className="mt-4 text-[12px] leading-6" style={{ color: palette.potPanelMuted }}>
            Start with the form, then place it where the room asks for it. Shelf, entry, table, terrace, or patio.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={onBrowse}
              type="button"
              className="cursor-hover inline-flex h-11 items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
              style={{
                background: palette.primaryBtnBg,
                color: palette.primaryBtnText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = palette.primaryBtnHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = palette.primaryBtnBg;
              }}
            >
              View Forms
            </button>

            <button
              onClick={onContact}
              type="button"
              className="cursor-hover inline-flex h-11 items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
              style={{
                background: palette.secondaryBtnBg,
                color: palette.secondaryBtnText,
                border: `1px solid ${palette.secondaryBtnBorder}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = palette.secondaryBtnHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = palette.secondaryBtnBg;
              }}
            >
              Contact Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileScenePanel({
  slide,
  palette,
  productMap,
  onBuyNow,
  displayCurrency,
  displayLanguage,
}: {
  slide: Slide;
  palette: ThemePalette;
  productMap: Record<string, Product>;
  onBuyNow: (product: Product) => void;
  displayCurrency: string;
  displayLanguage: string;
}) {
  if (slide.storyMode) {
    return (
      <div className="mt-8 md:hidden">
        <Link
          href="/about"
          className="block overflow-hidden rounded-[1.75rem] border"
          style={{
            background: palette.cardShell,
            borderColor: palette.cardBorder,
            boxShadow: '0 18px 38px rgba(0,0,0,0.22)',
          }}
        >
          <div className="relative aspect-[5/4]">
            <Image
              src={imageByKey.clay}
              alt="TuloPots story"
              fill
              sizes="(max-width: 767px) 88vw, 360px"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: palette.storyOverlay }} />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: palette.sceneTextFaint }}>
                Nairobi since 2016
              </div>
              <div className="serif-display mt-2 text-[2rem] leading-none" style={{ color: palette.sceneText }}>
                Our Story
              </div>
            </div>
          </div>
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: palette.primaryBtnBg,
              color: palette.primaryBtnText,
            }}
          >
            Read Story
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: palette.secondaryBtnBg,
              color: palette.secondaryBtnText,
              border: `1px solid ${palette.secondaryBtnBorder}`,
            }}
          >
            Contact
          </Link>
        </div>
      </div>
    );
  }

  if (slide.potMode) {
    return (
      <div className="mt-8 rounded-[1.75rem] border p-5 shadow-[0_18px_38px_rgba(0,0,0,0.22)] md:hidden" style={{ background: palette.potPanelBg, borderColor: palette.potPanelBorder }}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: palette.sceneTextFaint }}>
          Clay Forms
        </div>
        <div className="serif-display mt-3 text-[2rem] leading-none" style={{ color: palette.potPanelText }}>
          Quiet Clay Form
        </div>
        <p className="mt-3 text-sm leading-6" style={{ color: palette.potPanelMuted }}>
          Start with the form, then place it where the room asks for it. Shelf, table, entry, terrace, or patio.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href="/pots"
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: palette.primaryBtnBg,
              color: palette.primaryBtnText,
            }}
          >
            View Forms
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: palette.secondaryBtnBg,
              color: palette.secondaryBtnText,
              border: `1px solid ${palette.secondaryBtnBorder}`,
            }}
          >
            Contact Studio
          </Link>
        </div>
      </div>
    );
  }

  const leadItem = slide.cardItems.find((item) => productMap[item.slug]);
  if (!leadItem) {
    return null;
  }

  const product = productMap[leadItem.slug];
  const presentation = CARD_LIBRARY[leadItem.slug];
  const imageSrc = presentation?.image || product.image;
  const displayName = product.name;

  return (
    <div className="mt-8 md:hidden">
      <Link
        href={`/product/${product.slug}`}
        className="block overflow-hidden rounded-[1.75rem] border"
        style={{
          background: palette.cardShell,
          borderColor: palette.cardBorder,
          boxShadow: '0 18px 38px rgba(0,0,0,0.22)',
        }}
      >
        <div className="relative aspect-[5/4]">
          <Image
            src={imageSrc}
            alt={displayName}
            fill
            sizes="(max-width: 767px) 88vw, 360px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/12 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">
              Featured presence
            </div>
            <div className="serif-display mt-2 text-[1.9rem] leading-none">{displayName}</div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
              <span>{money(product.price, { currency: displayCurrency, language: displayLanguage })}</span>
              <span>{product.rating.toFixed(1)} rating</span>
              <span>{product.reviews} reviews</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => onBuyNow(product)}
          type="button"
          className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{
            background: palette.primaryBtnBg,
            color: palette.primaryBtnText,
          }}
        >
          Buy Now
        </button>
        <Link
          href={`/product/${product.slug}`}
          className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{
            background: palette.secondaryBtnBg,
            color: palette.secondaryBtnText,
            border: `1px solid ${palette.secondaryBtnBorder}`,
          }}
        >
          View Item
        </Link>
      </div>
    </div>
  );
}

export default function LoggedInHome() {
  const { addToCart, theme, user } = useStore();
  const router = useRouter();
  const displayCurrency = user?.preferredCurrency || 'KES';
  const displayLanguage = user?.preferredLanguage || 'en';
  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.slug, p])), []);
  const lastSlideIndex = SLIDES.length - 1;

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [hasDismissedFirstHint, setHasDismissedFirstHint] = useState(false);
  const [hasDismissedLastHint, setHasDismissedLastHint] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);

  const isLight = theme === 'light';
  const palette = getPalette(isLight);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const syncMode = () => setIsPhone(media.matches);
    syncMode();
    media.addEventListener('change', syncMode);
    return () => media.removeEventListener('change', syncMode);
  }, []);

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

    if (current === 0 && next > current) {
      setHasDismissedFirstHint(true);
    }

    if (current === lastSlideIndex && next < current) {
      setHasDismissedLastHint(true);
    }

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

  const handleBuyNow = (product: Product) => {
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
  }, [animating, current, lastSlideIndex]);

  const mobileGestureHint =
    isPhone && current === 0 && !hasDismissedFirstHint
      ? { label: 'Scroll up', direction: 'up' as const }
      : isPhone && current === lastSlideIndex && !hasDismissedLastHint
        ? { label: 'Scroll down', direction: 'down' as const }
        : null;

  return (
    <main className={`fixed inset-0 overflow-hidden ${isLight ? 'tp-scene-light' : 'tp-scene-dark'}`}>
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
                <div
                  className="text-right text-[10px] font-medium uppercase tracking-[0.22em]"
                  style={{ color: palette.sceneTextFaint }}
                >
                  {slide.featured.label}
                </div>

                <div className="mt-2 flex justify-end gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${
                        s <= slide.featured!.stars ? 'fill-[#e0b97a] text-[#e0b97a]' : ''
                      }`}
                      style={
                        s <= slide.featured!.stars
                          ? undefined
                          : { color: isLight ? 'rgba(35,23,17,0.18)' : 'rgba(255,255,255,0.20)' }
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-[1600px] items-end px-5 pb-12 pt-28 sm:px-6 md:h-screen md:items-center md:px-[4.5%] md:pb-[84px] md:pt-[84px]">
              <div className="grid w-full items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] xl:gap-20">
                <div className="relative z-30 max-w-[430px]">
                  {slide.kicker ? (
                    <p
                      className="fade-item fade-1 mb-5 text-[11px] uppercase tracking-[0.24em]"
                      style={{ color: palette.sceneTextFaint }}
                    >
                      {slide.kicker}
                    </p>
                  ) : (
                    <div className="mb-5 h-[19px]" />
                  )}

                  <h1
                    className="fade-item fade-2 serif-display leading-[0.92]"
                    style={{
                      fontSize: 'clamp(3.5rem, 6vw, 6.35rem)',
                      color: palette.sceneText,
                    }}
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

                  <p
                    className="fade-item fade-3 mt-7 max-w-[340px] text-[14px] leading-[1.9] md:text-[15px]"
                    style={{ color: palette.sceneTextSoft }}
                  >
                    {slide.description}
                  </p>

                  <div className="fade-item fade-4 mt-9 flex flex-wrap gap-3">
                    <Link
                      href={slide.primaryCta.href}
                      className="cursor-hover inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-[0_12px_28px_rgba(208,130,77,0.28)] transition hover:-translate-y-0.5"
                      style={{
                        background: palette.primaryBtnBg,
                        color: palette.primaryBtnText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = palette.primaryBtnHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = palette.primaryBtnBg;
                      }}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      {slide.primaryCta.label}
                    </Link>

                    <Link
                      href={slide.secondaryCta.href}
                      className="cursor-hover inline-flex items-center rounded-full px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                      style={{
                        background: palette.secondaryBtnBg,
                        color: palette.secondaryBtnText,
                        border: `1px solid ${palette.secondaryBtnBorder}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = palette.secondaryBtnHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = palette.secondaryBtnBg;
                      }}
                    >
                      {slide.secondaryCta.label}
                    </Link>
                  </div>

                  <div
                    className="fade-item fade-5 mt-11 grid max-w-[420px] grid-cols-3 gap-4 pt-6 sm:gap-6 md:gap-8"
                    style={{ borderTop: `1px solid ${palette.statBorder}` }}
                  >
                    {slide.stats.map((stat) => (
                      <div key={stat.label} className="min-w-0">
                        <div
                          className="text-[1.6rem] font-semibold leading-none md:text-[1.75rem]"
                          style={{ color: palette.sceneText }}
                        >
                          {stat.value}
                        </div>
                        <div
                          className="mt-2 text-[9px] uppercase tracking-[0.13em] leading-[1.5] md:text-[10px]"
                          style={{
                            color: palette.sceneTextMuted,
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {slide.nextLabel ? (
                    <div
                      className="fade-item fade-5 mt-8 text-[13px] font-light"
                      style={{ color: palette.sceneTextMuted }}
                    >
                      {slide.nextLabel}
                    </div>
                  ) : null}

                  {mobileGestureHint ? (
                    <div
                      className="mobile-scroll-hint pointer-events-none mt-6 flex items-center gap-3 md:hidden"
                      style={{ color: palette.sceneTextFaint }}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md"
                        style={{
                          background: palette.navBtnBg,
                          borderColor: palette.navBtnBorder,
                          color: palette.navBtnText,
                        }}
                      >
                        {mobileGestureHint.direction === 'up' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.22em]">
                        {mobileGestureHint.label}
                      </div>
                    </div>
                  ) : null}

                  <MobileScenePanel
                    slide={slide}
                    palette={palette}
                    productMap={productMap}
                    onBuyNow={handleBuyNow}
                    displayCurrency={displayCurrency}
                    displayLanguage={displayLanguage}
                  />
                </div>

                <div className="pointer-events-none relative hidden overflow-visible lg:block" style={{ height: '560px' }}>
                  {slide.storyMode ? (
                    <div className="absolute right-0 top-1/2 flex w-full -translate-y-1/2 items-start pr-10">
                      <div
                        className="replay card-stage card-1 pointer-events-auto flex-shrink-0 cursor-pointer overflow-hidden rounded-[18px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]"
                        style={{
                          width: CARD_WIDTHS[0],
                          height: CARD_HEIGHTS[0],
                          background: palette.cardShell,
                          border: `1px solid ${palette.cardBorder}`,
                        }}
                        onClick={() => router.push('/about')}
                      >
                        <div className="group relative h-full w-full">
                          <Image
                            src={imageByKey.clay}
                            alt="TuloPots Studio"
                            fill
                            sizes="210px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                          />
                          <div className="absolute inset-0" style={{ background: palette.storyOverlay }} />

                          <div className="absolute bottom-0 left-0 right-0 p-3.5">
                            <div
                              className="text-[12px] font-medium tracking-[0.04em]"
                              style={{ color: palette.cardTitle }}
                            >
                              TuloPots Studio
                            </div>
                            <div className="text-[10px] italic" style={{ color: palette.cardSecondaryText }}>
                              Est. 2016 — Nairobi
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                              <Link
                                href="/about"
                                onClick={(e) => e.stopPropagation()}
                                className="pointer-events-auto flex items-center justify-center rounded-full px-2 py-1.5 text-[7px] font-bold uppercase tracking-[0.14em] transition"
                                style={{
                                  background: palette.primaryBtnBg,
                                  color: palette.primaryBtnText,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = palette.primaryBtnHover;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = palette.primaryBtnBg;
                                }}
                              >
                                Read Story
                              </Link>

                              <Link
                                href="/contact"
                                onClick={(e) => e.stopPropagation()}
                                className="pointer-events-auto flex items-center justify-center rounded-full px-2 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] transition"
                                style={{
                                  background: palette.storySecondaryBg,
                                  color: palette.secondaryBtnText,
                                  border: `1px solid ${palette.storySecondaryBorder}`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = palette.secondaryBtnHover;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = palette.storySecondaryBg;
                                }}
                              >
                                Contact
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : slide.potMode ? (
                    <MagneticPotScene
                      onBrowse={() => router.push('/pots')}
                      onContact={() => router.push('/contact')}
                      palette={palette}
                    />
                  ) : (
                    <>
                      <div className="replay fade-up delay-2 absolute left-[60px] top-[44px] z-30 flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-[#f2c94c] text-[#f2c94c]" />
                        ))}
                        <Star
                          className="h-3.5 w-3.5"
                          style={{ color: isLight ? 'rgba(35,23,17,0.24)' : 'rgba(255,255,255,0.28)' }}
                        />
                      </div>

                      {slide.sideLabel && (
                        <div className="replay fade-up delay-2 absolute left-[60px] top-[68px] z-30">
                          <div
                            className="text-[11px] uppercase tracking-[0.14em]"
                            style={{ color: palette.sceneTextSoft }}
                          >
                            {slide.sideLabel}
                          </div>
                        </div>
                      )}

                      <div className="absolute right-0 top-1/2 flex w-full -translate-y-1/2 items-start pr-10">
                        {slide.cardItems.map((item, ci) => {
                          const product = productMap[item.slug];
                          if (!product) return null;

                          const presentation = CARD_LIBRARY[item.slug];
                          const imageSrc = presentation?.image || product.image;
                          const displayName = product.name;
                          const imageHeight = Math.round(CARD_HEIGHTS[ci] * 0.65);

                          return (
                            <div
                              key={item.slug}
                              className={`replay card-stage card-${ci + 1} pointer-events-auto flex flex-shrink-0 flex-col overflow-hidden rounded-[18px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]`}
                              style={{
                                width: CARD_WIDTHS[ci],
                                height: CARD_HEIGHTS[ci],
                                marginTop: CARD_MARGINS[ci],
                                marginLeft: ci === 0 ? 0 : 12,
                                zIndex: 30 - ci,
                                background: palette.cardShell,
                                border: `1px solid ${palette.cardBorder}`,
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                              </div>

                              <div
                                className="flex flex-1 flex-col justify-between px-3 pb-3 pt-2.5"
                                style={{ background: palette.cardInfoBg }}
                              >
                                <div>
                                  <div
                                    className="line-clamp-1 text-[11px] font-medium tracking-[0.03em]"
                                    style={{ color: palette.cardTitle }}
                                  >
                                    {displayName}
                                  </div>
                                  <div className="mt-0.5 font-serif text-[13px] font-semibold text-[#e0b97a]">
                                    {money(product.price, {
                                      currency: displayCurrency,
                                      language: displayLanguage,
                                    })}
                                  </div>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-1.5">
                                  <button
                                    onClick={() => handleBuyNow(product)}
                                    className="flex min-w-0 items-center justify-center rounded-full px-2 py-1.5 text-[7px] font-bold uppercase tracking-[0.12em] transition"
                                    style={{
                                      background: palette.primaryBtnBg,
                                      color: palette.primaryBtnText,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = palette.primaryBtnHover;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = palette.primaryBtnBg;
                                    }}
                                  >
                                    Buy Now
                                  </button>

                                  <Link
                                    href={`/product/${product.slug}`}
                                    className="flex min-w-0 items-center justify-center rounded-full px-2 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] transition"
                                    style={{
                                      background: palette.cardSecondaryBg,
                                      color: palette.cardSecondaryText,
                                      border: `1px solid ${palette.secondaryBtnBorder}`,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = palette.cardSecondaryHover;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = palette.cardSecondaryBg;
                                    }}
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
          className="cursor-hover flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition"
          style={{
            background: palette.navBtnBg,
            border: `1px solid ${palette.navBtnBorder}`,
            color: palette.navBtnText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = palette.navBtnHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = palette.navBtnBg;
          }}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={goNext}
          type="button"
          className="cursor-hover flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition"
          style={{
            background: palette.navBtnBg,
            border: `1px solid ${palette.navBtnBorder}`,
            color: palette.navBtnText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = palette.navBtnHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = palette.navBtnBg;
          }}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className="absolute bottom-7 left-7 z-40 hidden items-center gap-3 text-[10px] uppercase tracking-[0.18em] md:flex"
        style={{ color: palette.sceneTextMuted }}
      >
        <div className="h-px w-10" style={{ background: palette.statBorder }} />
        Scroll to explore
      </div>

      <div className="absolute bottom-7 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1.5 md:flex">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goTo(index)}
            type="button"
            className="cursor-hover rounded-full transition-all duration-300"
            style={{
              height: '6px',
              width: index === current ? '28px' : '6px',
              background: index === current ? palette.sceneText : palette.sceneTextMuted,
            }}
          />
        ))}
      </div>

      <div
        className="absolute bottom-7 right-24 z-40 hidden text-[10px] uppercase tracking-[0.18em] md:block md:right-28"
        style={{ color: palette.sceneTextMuted }}
      >
        <span style={{ color: palette.sceneTextSoft }}>{String(current + 1).padStart(2, '0')}</span> /{' '}
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
            rgba(247, 242, 234, 0.54) 0%,
            rgba(247, 242, 234, 0.34) 28%,
            rgba(247, 242, 234, 0.12) 56%,
            rgba(247, 242, 234, 0.04) 100%
          );
        }

        .tp-scene-light .tp-scene-overlay-b {
          background: linear-gradient(
            to top,
            rgba(255, 248, 240, 0.22) 0%,
            rgba(255, 248, 240, 0.08) 38%,
            rgba(255, 248, 240, 0.02) 100%
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

        .mobile-scroll-hint {
          animation: mobileHintFloat 1.65s ease-in-out infinite;
        }

        .mobile-scroll-hint svg {
          animation: mobileHintArrow 1.65s ease-in-out infinite;
        }

        @keyframes mobileHintFloat {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.82;
          }
          50% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }

        @keyframes mobileHintArrow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scene,
          .fade-item,
          .card-stage,
          .scene.active .fade-item,
          .mobile-scroll-hint,
          .mobile-scroll-hint svg {
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
