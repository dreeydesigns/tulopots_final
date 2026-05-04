'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent as ReactFormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { PotMark } from '@/components/PotMark';
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
  newsletterMode: boolean;
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
    secondaryCta: { label: 'Care Guide', href: '/care-guide' },
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
    newsletterMode: false,
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
    secondaryCta: { label: 'New Arrivals', href: '/indoor?filter=new-arrivals' },
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
    newsletterMode: false,
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
    secondaryCta: { label: 'Decorative', href: '/outdoor?filter=decorative' },
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
    newsletterMode: false,
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
    nextLabel: 'Learn with Clay',
    background: imageByKey.workshop,
    featured: { label: 'Clay Forms', stars: 5 },
    storyMode: false,
    potMode: true,
    newsletterMode: false,
    sideLabel: 'Shape First',
    cardItems: [],
  },
  {
    id: 'learn',
    kicker: 'Clay Studio',
    titleTop: 'Learn',
    titleAccent: '',
    titleBottom: 'with Clay',
    description:
      'Wheel sessions, hand-building, couples evenings, school visits, and an 8-week course — held in our working studio in Nairobi.',
    primaryCta: { label: 'Book a Class', href: '/learn' },
    secondaryCta: { label: 'View Sessions', href: '/learn#classes' },
    stats: [
      { value: '6', label: 'Sessions' },
      { value: 'All', label: 'Levels' },
      { value: 'Nairobi', label: 'Studio' },
    ],
    nextLabel: '',
    background: imageByKey.workshop,
    featured: null,
    storyMode: false,
    potMode: false,
    newsletterMode: false,
    sideLabel: 'Hands in Clay',
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
      sceneTextSoft: 'rgba(35,23,17,0.84)',
      sceneTextFaint: 'rgba(35,23,17,0.64)',
      sceneTextMuted: 'rgba(35,23,17,0.34)',
      statBorder: 'rgba(35,23,17,0.12)',
      primaryBtnBg: '#d0824d',
      primaryBtnText: '#ffffff',
      primaryBtnHover: '#c3723d',
      secondaryBtnBg: 'rgba(247,242,234,0.84)',
      secondaryBtnText: '#2a1b14',
      secondaryBtnBorder: 'rgba(35,23,17,0.16)',
      secondaryBtnHover: 'rgba(255,255,255,0.92)',
      navBtnBg: 'rgba(247,242,234,0.46)',
      navBtnBorder: 'rgba(35,23,17,0.14)',
      navBtnText: '#231711',
      navBtnHover: 'rgba(247,242,234,0.64)',
      cardShell: '#f6efe6',
      cardInfoBg: 'linear-gradient(180deg,rgba(246,239,230,0.98) 0%,rgba(236,223,208,0.98) 100%)',
      cardTitle: '#20140f',
      cardSecondaryText: 'rgba(32,20,15,0.72)',
      cardBorder: 'rgba(35,23,17,0.10)',
      cardSecondaryBg: 'rgba(255,255,255,0.60)',
      cardSecondaryHover: 'rgba(255,255,255,0.88)',
      storyOverlay:
        'linear-gradient(to top, rgba(247,242,234,0.78) 0%, rgba(247,242,234,0.14) 52%, rgba(247,242,234,0.02) 100%)',
      storySecondaryBg: 'rgba(255,255,255,0.74)',
      storySecondaryBorder: 'rgba(35,23,17,0.12)',
      potPanelBg:
        'linear-gradient(180deg,rgba(255,252,248,0.76) 0%,rgba(236,224,210,0.96) 100%)',
      potPanelBorder: 'rgba(35,23,17,0.10)',
      potPanelText: '#20140f',
      potPanelMuted: 'rgba(32,20,15,0.68)',
      potChipBg: 'rgba(255,255,255,0.74)',
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
  sceneScale = 1,
}: {
  onBrowse: () => void;
  onContact: () => void;
  palette: ThemePalette;
  sceneScale?: number;
}) {
  const potRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, tx: 0, ty: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const handleMove = (
    e: ReactMouseEvent<HTMLDivElement> | ReactPointerEvent<HTMLDivElement>
  ) => {
    const el = potRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const offsetX = (px - 50) / 50;
    const offsetY = (py - 50) / 50;

    setHovered(true);
    setTilt({
      x: -(offsetY * 10),
      y: offsetX * 14,
      tx: offsetX * 16,
      ty: offsetY * 10,
    });
    setGlow({ x: px, y: py });
  };

  const handleLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0, tx: 0, ty: 0 });
    setGlow({ x: 50, y: 50 });
  };

  return (
    <div className="absolute left-[5%] top-[3%] h-[580px] w-[720px]" style={{ transform: `scale(${sceneScale})`, transformOrigin: 'top left' }}>
      <div className="relative h-full w-full" style={{ perspective: '1400px' }}>
        <div
          className="absolute left-[35%] top-[49%] h-[438px] w-[338px] -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 1 }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-[318px] w-[318px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(182,106,60,0.28) 0%, rgba(182,106,60,0.14) 34%, rgba(182,106,60,0) 72%)`,
              filter: hovered ? 'blur(10px)' : 'blur(7px)',
              opacity: hovered ? 1 : 0.72,
              transform: hovered ? 'scale(1.04)' : 'scale(0.96)',
              transition: 'transform 220ms ease, opacity 220ms ease, filter 220ms ease',
            }}
          />
          <div
            className="absolute inset-x-10 bottom-8 h-12 rounded-full bg-black/35 blur-2xl"
            style={{
              opacity: hovered ? 0.95 : 0.72,
              transform: `translateX(${tilt.tx * 0.45}px) scale(${hovered ? 1.02 : 0.96})`,
              transition: 'transform 220ms ease, opacity 220ms ease',
            }}
          />
          <div
            ref={potRef}
            onPointerEnter={() => setHovered(true)}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className="absolute left-1/2 top-1/2 flex h-[318px] w-[318px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
            style={{
              transform: `perspective(520px) translate3d(${tilt.tx}px, ${tilt.ty}px, 0) rotateY(${tilt.y}deg) rotateX(${tilt.x}deg) scale(${hovered ? 1.03 : 1})`,
              transformStyle: 'preserve-3d',
              transition: hovered
                ? 'transform 90ms ease-out, filter 220ms ease'
                : 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), filter 260ms ease',
              filter: hovered
                ? 'drop-shadow(0 26px 40px rgba(138, 78, 45, 0.26))'
                : 'drop-shadow(0 20px 30px rgba(138, 78, 45, 0.18))',
            }}
          >
            <div
              className="absolute inset-[16%] rounded-full"
              style={{
                background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(240,201,138,0.36) 0%, rgba(240,201,138,0.1) 34%, rgba(240,201,138,0) 64%)`,
                opacity: hovered ? 1 : 0.66,
                transform: 'translateZ(24px)',
                transition: 'opacity 220ms ease',
              }}
            />
            <PotMark
              className="h-full w-full"
              style={{
                color: palette.primaryBtnBg,
              }}
            />
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
              Hover the form
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

function NewsletterScenePanel({
  palette,
  initialName = '',
  initialEmail = '',
  mobile = false,
}: {
  palette: ThemePalette;
  initialName?: string;
  initialEmail?: string;
  mobile?: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [preferredChannel, setPreferredChannel] = useState('email');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'new-arrivals',
    'care-guidance',
  ]);
  const [status, setStatus] = useState('');
  const [tone, setTone] = useState<'idle' | 'error' | 'success'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interestOptions: Array<[string, string]> = [
    ['new-arrivals', 'New arrivals'],
    ['care-guidance', 'Care guidance'],
    ['launch-notes', 'Launch notes'],
    ['open-space-ideas', 'Open-space ideas'],
  ];

  function toggleInterest(value: string) {
    setSelectedInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function handleSubmit(event: ReactFormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    setTone('idle');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          preferredChannel,
          interests: selectedInterests,
          source: 'logged-in-home',
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Unable to join right now.');
      }

      setTone('success');
      setStatus(data.message || 'You are on the list.');
    } catch (error: any) {
      setTone('error');
      setStatus(error?.message || 'Unable to join right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const wrapperClassName = mobile
    ? 'mt-8 rounded-[1.75rem] border p-5 shadow-[0_18px_38px_rgba(0,0,0,0.22)] md:hidden'
    : 'absolute right-[4%] top-[18%] z-20 w-[min(360px,46%)] rounded-[34px] border p-6 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-md';
  const inputBackground = mobile
    ? palette.cardShell
    : 'color-mix(in srgb, rgba(255,255,255,0.16) 38%, transparent)';

  return (
    <div
      className={wrapperClassName}
      style={{
        background: mobile ? palette.cardShell : palette.potPanelBg,
        borderColor: palette.potPanelBorder,
        color: palette.potPanelText,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className="rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]"
          style={{
            background: palette.potChipBg,
            border: `1px solid ${palette.potChipBorder}`,
            color: palette.potPanelText,
          }}
        >
          Join our newsletter
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: palette.potPanelMuted }}>
          Quiet updates only
        </div>
      </div>

      <div className="serif-display mt-4 text-[26px] leading-none" style={{ color: palette.potPanelText }}>
        Stay close to the craft
      </div>

      <p className="mt-4 text-[12px] leading-6" style={{ color: palette.potPanelMuted }}>
        Choose only the notes that matter to you: new arrivals, care guidance, launch notes,
        and open-space ideas.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div className={mobile ? 'grid gap-2' : 'grid gap-2 sm:grid-cols-2'}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            placeholder="Your name"
            className="min-h-[44px] rounded-full px-4 py-3 text-sm outline-none transition"
            style={{
              background: inputBackground,
              border: `1px solid ${palette.potPanelBorder}`,
              color: palette.potPanelText,
            }}
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Your email"
            required
            className="min-h-[44px] rounded-full px-4 py-3 text-sm outline-none transition"
            style={{
              background: inputBackground,
              border: `1px solid ${palette.potPanelBorder}`,
              color: palette.potPanelText,
            }}
          />
        </div>

        <select
          value={preferredChannel}
          onChange={(event) => setPreferredChannel(event.target.value)}
          className="min-h-[44px] w-full rounded-full px-4 py-3 text-sm outline-none transition"
          style={{
            background: inputBackground,
            border: `1px solid ${palette.potPanelBorder}`,
            color: palette.potPanelText,
          }}
        >
          <option value="email">Email updates</option>
          <option value="sms">SMS updates</option>
          <option value="whatsapp">WhatsApp updates</option>
        </select>

        <div className="flex flex-wrap gap-2">
          {interestOptions.map(([value, label]) => {
            const selected = selectedInterests.includes(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleInterest(value)}
                className="min-h-[38px] rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
                style={{
                  background: selected ? palette.primaryBtnBg : palette.secondaryBtnBg,
                  color: selected ? palette.primaryBtnText : palette.secondaryBtnText,
                  border: `1px solid ${selected ? palette.primaryBtnBg : palette.secondaryBtnBorder}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: palette.primaryBtnBg,
            color: palette.primaryBtnText,
          }}
        >
          {isSubmitting ? 'Joining...' : 'Join the List'}
        </button>
      </form>

      {status ? (
        <div
          className="mt-3 rounded-[1.2rem] px-4 py-3 text-xs leading-6"
          style={{
            background:
              tone === 'error'
                ? 'color-mix(in srgb, #b66a3c 12%, transparent)'
                : 'color-mix(in srgb, rgba(70,145,104,0.22) 40%, transparent)',
            color: tone === 'error' ? palette.primaryBtnBg : palette.potPanelText,
            border: `1px solid ${tone === 'error' ? palette.primaryBtnBg : palette.potPanelBorder}`,
          }}
        >
          {status}
        </div>
      ) : null}
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
  userName,
  userEmail,
}: {
  slide: Slide;
  palette: ThemePalette;
  productMap: Record<string, Product>;
  onBuyNow: (product: Product) => void;
  displayCurrency: string;
  displayLanguage: string;
  userName?: string;
  userEmail?: string;
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
            href="/delivery"
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: palette.secondaryBtnBg,
              color: palette.secondaryBtnText,
              border: `1px solid ${palette.secondaryBtnBorder}`,
            }}
          >
            Track Order
          </Link>
        </div>
      </div>
    );
  }

  if (slide.newsletterMode) {
    return (
      <NewsletterScenePanel
        palette={palette}
        initialName={userName}
        initialEmail={userEmail}
        mobile
      />
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
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );
  // LoggedInHome is client-only (behind auth), so reading window here is safe
  const [vw, setVw] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);

  const isLight = theme === 'light';
  const palette = getPalette(isLight);

  // Responsive scale factors — baseline is 1440px viewport
  const cardScale = Math.max(0.76, Math.min(2.2, vw / 1440));
  const sceneScale = Math.max(0.68, Math.min(2.0, vw / 1560));
  const rightColHeight = Math.max(420, Math.min(Math.round(560 * cardScale), 1100));
  const containerMaxW = Math.min(Math.max(1680, Math.round(vw * 0.88)), 7200);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const syncMode = () => setIsPhone(media.matches);
    syncMode();
    media.addEventListener('change', syncMode);
    return () => media.removeEventListener('change', syncMode);
  }, []);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
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
      touchStartX.current = e.touches[0]?.clientX ?? null;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? touchStartY.current ?? 0;
      const endX = e.changedTouches[0]?.clientX ?? touchStartX.current ?? 0;
      const deltaY = (touchStartY.current ?? endY) - endY;
      const deltaX = (touchStartX.current ?? endX) - endX;
      touchStartY.current = null;
      touchStartX.current = null;

      // Use the dominant axis; require at least 45px movement
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > 45) {
          if (deltaX > 0) goNext(); // swipe left → next
          else goPrev();            // swipe right → prev
        }
      } else {
        if (Math.abs(deltaY) > 45) {
          if (deltaY > 0) goNext(); // swipe up → next
          else goPrev();            // swipe down → prev
        }
      }
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
                className="scene-bg object-cover"
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

            <div className="relative z-20 mx-auto flex min-h-[100svh] items-end px-5 pb-12 pt-28 sm:px-6 md:h-screen md:items-center md:px-[4.5%] md:pb-[84px] md:pt-[84px]" style={{ maxWidth: containerMaxW }}>
              <div className="grid w-full items-center gap-12 lg:grid-cols-[0.74fr_1.26fr] xl:gap-24 2xl:gap-32">
                <div className="relative z-30 max-w-[430px] xl:max-w-[520px] 2xl:max-w-[640px]">
                  {slide.kicker ? (
                    <p
                      className="fade-item fade-1 mb-2 md:mb-5 text-[11px] uppercase tracking-[0.24em]"
                      style={{ color: palette.sceneTextFaint }}
                    >
                      {slide.kicker}
                    </p>
                  ) : (
                    <div className="mb-2 md:mb-5 h-[19px]" />
                  )}

                  <h1
                    className="fade-item fade-2 serif-display leading-[0.95]"
                    style={{
                      fontSize: isPhone ? 'clamp(1.75rem, 9.5vw, 2.75rem)' : 'clamp(2.5rem, 4.5vw, 5rem)',
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
                    className="fade-item fade-3 mt-2 md:mt-7 max-w-[340px] text-[13px] leading-[1.75] md:text-[15px]"
                    style={{ color: palette.sceneTextSoft }}
                  >
                    {slide.description}
                  </p>

                  <div className="fade-item fade-4 mt-4 md:mt-9 flex flex-wrap gap-2 md:gap-3">
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
                    className="fade-item fade-5 mt-3 md:mt-11 grid max-w-[420px] grid-cols-3 gap-3 pt-3 md:pt-6 sm:gap-6 md:gap-8"
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
                      className="fade-item fade-5 hidden md:block mt-8 text-[13px] font-light"
                      style={{ color: palette.sceneTextMuted }}
                    >
                      {slide.nextLabel}
                    </div>
                  ) : null}

                  <div className="pointer-events-none mt-4 md:hidden">
                    <div className="flex items-center gap-3">
                      <div className="swipe-hint-dots flex gap-1.5">
                        {SLIDES.map((_, si) => (
                          <div
                            key={si}
                            className="rounded-full transition-all duration-300"
                            style={{
                              width: si === current ? 18 : 6,
                              height: 6,
                              background: si === current ? palette.sceneText : palette.sceneTextMuted,
                              opacity: si === current ? 0.9 : 0.35,
                            }}
                          />
                        ))}
                      </div>
                      <div
                        className="swipe-hint-text text-[9px] font-semibold uppercase tracking-[0.22em]"
                        style={{ color: palette.sceneTextFaint }}
                      >
                        Swipe to explore
                      </div>
                    </div>
                  </div>

                  <MobileScenePanel
                    slide={slide}
                    palette={palette}
                    productMap={productMap}
                    onBuyNow={handleBuyNow}
                    displayCurrency={displayCurrency}
                    displayLanguage={displayLanguage}
                    userName={user?.name}
                    userEmail={user?.email}
                  />
                </div>

                <div className="pointer-events-none relative hidden overflow-visible lg:block" style={{ height: rightColHeight }}>
                  {slide.storyMode ? (
                    <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-start justify-end pl-4 pr-4 xl:pl-12 xl:pr-10 2xl:pl-16 2xl:pr-14">
                      <div
                        className="replay card-stage card-1 pointer-events-auto flex-shrink-0 cursor-pointer overflow-hidden rounded-[18px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]"
                        style={{
                          width: Math.round(CARD_WIDTHS[0] * cardScale),
                          height: Math.round(CARD_HEIGHTS[0] * cardScale),
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
                                href="/delivery"
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
                                Track Order
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : slide.newsletterMode ? (
                    <NewsletterScenePanel
                      palette={palette}
                      initialName={user?.name}
                      initialEmail={user?.email}
                    />
                  ) : slide.potMode ? (
                    <MagneticPotScene
                      onBrowse={() => router.push('/pots')}
                      onContact={() => router.push('/contact')}
                      palette={palette}
                      sceneScale={sceneScale}
                    />
                  ) : (
                    <>
                      <div className="replay fade-up delay-2 absolute z-30 flex gap-1" style={{ left: Math.round(60 * cardScale), top: Math.round(44 * cardScale) }}>
                        {[0, 1, 2, 3].map((i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-[#f2c94c] text-[#f2c94c]" />
                        ))}
                        <Star
                          className="h-3.5 w-3.5"
                          style={{ color: isLight ? 'rgba(35,23,17,0.24)' : 'rgba(255,255,255,0.28)' }}
                        />
                      </div>

                      {slide.sideLabel && (
                        <div className="replay fade-up delay-2 absolute z-30" style={{ left: Math.round(60 * cardScale), top: Math.round(68 * cardScale) }}>
                          <div
                            className="text-[11px] uppercase tracking-[0.14em]"
                            style={{ color: palette.sceneTextSoft }}
                          >
                            {slide.sideLabel}
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-start justify-end pl-4 pr-4 xl:pl-12 xl:pr-10 2xl:pl-16 2xl:pr-14">
                        {slide.cardItems.map((item, ci) => {
                          const product = productMap[item.slug];
                          if (!product) return null;

                          const presentation = CARD_LIBRARY[item.slug];
                          const imageSrc = presentation?.image || product.image;
                          const displayName = product.name;
                          const imageHeight = Math.round(CARD_HEIGHTS[ci] * cardScale * 0.65);

                          return (
                            <div
                              key={item.slug}
                              className={`replay card-stage card-${ci + 1} pointer-events-auto flex flex-shrink-0 flex-col overflow-hidden rounded-[18px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]`}
                              style={{
                                width: Math.round(CARD_WIDTHS[ci] * cardScale),
                                height: Math.round(CARD_HEIGHTS[ci] * cardScale),
                                marginTop: Math.round(CARD_MARGINS[ci] * cardScale),
                                marginLeft: ci === 0 ? 0 : 16,
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

      <div className="absolute left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 xl:flex">
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
            rgba(247, 242, 234, 0.34) 0%,
            rgba(247, 242, 234, 0.18) 28%,
            rgba(247, 242, 234, 0.07) 56%,
            rgba(247, 242, 234, 0.02) 100%
          );
        }

        .tp-scene-light .tp-scene-overlay-b {
          background: linear-gradient(
            to top,
            rgba(255, 248, 240, 0.12) 0%,
            rgba(255, 248, 240, 0.04) 38%,
            rgba(255, 248, 240, 0.01) 100%
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

        .swipe-hint-text {
          animation: swipeHintPulse 2.4s ease-in-out infinite;
        }

        .swipe-hint-dots {
          animation: swipeHintPulse 2.4s ease-in-out infinite;
          animation-delay: 0.3s;
        }

        @keyframes swipeHintPulse {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scene,
          .fade-item,
          .card-stage,
          .scene.active .fade-item,
          .swipe-hint-text,
          .swipe-hint-dots {
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
