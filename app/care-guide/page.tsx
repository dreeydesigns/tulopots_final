import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Droplets,
  Sun,
  Wind,
  ShieldAlert,
  Leaf,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Care Guide',
  description:
    'Simple care guidance for terracotta forms, plant pairings, and open-space pieces from TuloPots in Nairobi, Kenya.',
  alternates: {
    canonical: '/care-guide',
  },
  openGraph: {
    title: `Care Guide | ${BRAND.name}`,
    description:
      'Simple care guidance for terracotta forms, plant pairings, and open-space pieces from TuloPots.',
    url: `${SITE_URL}/care-guide`,
    images: [imageByKey.clay],
  },
};

const tabs = [
  {
    id: 'terracotta',
    title: 'Terracotta Care',
    intro:
      'Terracotta is naturally porous and breathable. That is what makes it so beautiful for plants, but it also means the clay benefits from small acts of care.',
    cards: [
      {
        icon: Droplets,
        title: 'Soak before first use',
        text: 'Before planting, soak your terracotta piece in clean water for a few hours. This helps the clay settle and softens the first-day moisture pull from the soil.',
      },
      {
        icon: Wind,
        title: 'Let it breathe',
        text: 'Terracotta performs best when airflow is good. Avoid leaving pieces trapped in sealed decorative sleeves for long periods.',
      },
      {
        icon: ShieldAlert,
        title: 'Clean gently',
        text: 'Use a soft cloth, mild soap, and water. Avoid harsh chemical cleaners that can stain or weaken the clay surface over time.',
      },
    ],
  },
  {
    id: 'indoor',
    title: 'For Interior Spaces',
    intro:
      'Our interior pairings are selected for calm, breathable living. Keep light, moisture, and drainage in balance rather than following a rigid daily rhythm.',
    cards: [
      {
        icon: Leaf,
        title: 'Peace Lily & Monstera',
        text: 'Keep in bright indirect light. Water when the top layer of soil feels dry rather than on a fixed daily schedule.',
      },
      {
        icon: Sprout,
        title: 'Snake Plant & ZZ Plant',
        text: 'These are low-maintenance choices. Let soil dry properly between watering, especially in cooler rooms.',
      },
      {
        icon: Sun,
        title: 'Aloe & Succulents',
        text: 'Place near bright windows and avoid overwatering. Terracotta helps here because it releases extra moisture faster.',
      },
    ],
  },
  {
    id: 'outdoor',
    title: 'For Open Spaces',
    intro:
      'Open-space forms face stronger sun, dust, wind, and rain. A little maintenance keeps them looking premium and lasting longer.',
    cards: [
      {
        icon: Sun,
        title: 'Strong sunlight is okay',
        text: 'Terracotta handles sun beautifully, but the plant inside may still need a different watering rhythm in hotter weeks.',
      },
      {
        icon: Droplets,
        title: 'Check drainage after rain',
        text: 'Make sure drainage holes stay open. Standing water can damage roots even when the clay itself is fine.',
      },
      {
        icon: ShieldAlert,
        title: 'Move with care',
        text: 'Larger terracotta forms are heavy. Lift from the base, not the rim, especially after watering.',
      },
    ],
  },
];

const troubleshooting = [
  {
    title: 'White marks on the pot?',
    text: 'This is usually mineral salt buildup from water and soil. Wipe gently with diluted vinegar and rinse with clean water.',
  },
  {
    title: 'Soil drying too fast?',
    text: 'Terracotta naturally breathes. Try slightly more frequent watering, mulch on top, or softer indirect light.',
  },
  {
    title: 'Leaves turning yellow?',
    text: 'This is often overwatering, poor drainage, or low light. Check the soil and light conditions before watering again.',
  },
  {
    title: 'Outdoor pot looking dusty?',
    text: 'Dust is normal. Clean with a soft damp cloth and let the clay dry naturally. Avoid glossy chemical finishes.',
  },
];

export default function CareGuidePage() {
  return (
    <main className="min-h-screen bg-[var(--tp-bg)]">
      <section className="border-b border-[var(--tp-border)] bg-[var(--tp-card)] pb-14 pt-28">
        <div className="container-shell">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
            Plant & Pot Support
          </div>
          <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
            Care Guide
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--tp-text)]/72 md:text-base">
            Guidance for keeping your terracotta forms beautiful and your plant pairings healthy,
            written the TuloPots way: short, calm, and useful.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-xs">
            {['Terracotta care', 'Interior spaces', 'Open spaces', 'Troubleshooting'].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 text-[var(--tp-text)]/68"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-20">
        <div className="space-y-14">
          {tabs.map((section) => (
            <section key={section.id}>
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tp-accent)]">
                  {section.title}
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--tp-text)]/72 md:text-base">
                  {section.intro}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {section.cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 shadow-[0_10px_35px_rgba(90,52,34,0.05)]"
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full"
                        style={{ background: 'var(--tp-accent-soft)' }}
                      >
                        <Icon className="h-5 w-5 text-[var(--tp-accent)]" />
                      </div>
                      <h2 className="mt-5 serif-display text-2xl text-[var(--tp-heading)]">
                        {card.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[var(--tp-text)]/72">
                        {card.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--tp-border)] bg-[var(--tp-card)] py-14 md:py-20">
        <div className="container-shell">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
            Troubleshooting
          </div>
          <h2 className="mt-4 serif-display text-4xl text-[var(--tp-heading)] md:text-5xl">
            Common Questions
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {troubleshooting.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6"
              >
                <h3 className="text-lg font-semibold text-[var(--tp-heading)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--tp-text)]/72">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-20">
        <div
          className="rounded-[2rem] border px-6 py-10 text-white md:px-10"
          style={{
            borderColor: 'color-mix(in srgb, var(--tp-accent) 28%, transparent 72%)',
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--tp-heading) 88%, black 12%) 0%, color-mix(in srgb, var(--tp-accent) 42%, black 58%) 100%)',
          }}
        >
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Need more help?
            </div>
            <h2 className="mt-4 serif-display text-4xl md:text-5xl">
              Let TuloPots help you choose well
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72 md:text-base">
              Whether you are styling a home, refreshing an open space, or planning a custom
              brief, we can guide you toward the right form and the right pairing.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/faq" className="btn-secondary inline-flex items-center gap-2">
                Visit FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
