import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn how TuloPots shapes handcrafted terracotta in Nairobi, Kenya, and why each form is designed to bring calm, presence, and material warmth into daily living.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `About ${BRAND.name}`,
    description:
      'The Nairobi studio story, clay-first process, and placement philosophy behind TuloPots.',
    url: `${SITE_URL}/about`,
    images: [imageByKey.clay],
  },
};

const pillars = [
  {
    title: 'Rooted in craft',
    body:
      'Each piece is shaped with proportion, weight, and silence in mind so the final form feels lived with rather than simply bought.',
  },
  {
    title: 'Material honesty',
    body:
      'We work with natural clay, breathable surfaces, and restrained finish so terracotta keeps its texture, depth, and integrity.',
  },
  {
    title: 'Crafted for living',
    body:
      'Our forms are made for interior spaces, open spaces, and thoughtful placement where atmosphere matters as much as utility.',
  },
];

const process = [
  {
    label: 'Shape',
    body:
      'A piece begins with balance: opening, belly, rim, and silhouette are considered before decoration ever enters the conversation.',
  },
  {
    label: 'Fire',
    body:
      'Terracotta earns its character through patience. The firing stage gives every form its warmth, resilience, and tonal depth.',
  },
  {
    label: 'Place',
    body:
      'A finished form should read clearly in a room, on a shelf, at an entry, or out in the open. Placement is part of the design.',
  },
];

export default function Page() {
  return (
    <main className="tp-page pb-20 pt-24">
      <section className="container-shell grid gap-8 xl:grid-cols-[1fr_0.96fr] xl:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] tp-accent">
            About TuloPots
          </div>
          <h1 className="mt-4 serif-display text-5xl leading-[0.94] tp-heading md:text-7xl">
            Clay forms shaped for calm, presence, and everyday living.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 tp-text-soft md:text-lg">
            TuloPots is a Nairobi-based terracotta studio creating handcrafted objects that
            bring warmth into the spaces people actually live with. We believe clay should
            feel grounded, tactile, and emotionally clear. Every form is made to hold quiet
            presence, not noise.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/pots" className="btn-primary">
              Explore Clay Forms
            </Link>
            <Link href="/studio" className="btn-secondary">
              Open Studio
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {['Nairobi crafted', 'Natural clay', 'Placement first', 'Editorial restraint'].map(
              (item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-[2.4rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
            <Image
              src={imageByKey.clay}
              alt="Clay work in the TuloPots Nairobi studio"
              width={1200}
              height={1400}
              className="h-full min-h-[24rem] w-full object-cover"
            />
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
              <Image
                src={imageByKey.workshop}
                alt="A handcrafted terracotta workspace at TuloPots"
                width={900}
                height={900}
                className="h-56 w-full object-cover"
              />
            </div>
            <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
                Brand direction
              </div>
              <p className="mt-3 text-sm leading-7 tp-text-soft">
                TuloPots is not about decorative excess. It is about material warmth,
                emotional placement, and the kind of form that quietly changes how a space
                feels.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-16 grid gap-4 md:grid-cols-4">
        {[
          ['Studio base', 'Nairobi, Kenya'],
          ['Material', 'Natural terracotta'],
          ['Made for', 'Interior and open spaces'],
          ['Best for', 'Presence, warmth, placement'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 py-5"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
              {label}
            </div>
            <div className="mt-3 serif-display text-3xl tp-heading">{value}</div>
          </div>
        ))}
      </section>

      <section className="container-shell mt-16 rounded-[2.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
              What guides the work
            </div>
            <h2 className="mt-4 serif-display text-4xl tp-heading md:text-5xl">
              Our forms begin with feeling before they become objects.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] bg-[var(--tp-surface)] px-5 py-6"
              >
                <div className="serif-display text-3xl tp-heading">{item.title}</div>
                <p className="mt-4 text-sm leading-7 tp-text-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-16 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Studio process
          </div>
          <h2 className="mt-4 serif-display text-4xl tp-heading md:text-5xl">
            Shape. Fire. Place.
          </h2>
          <div className="mt-8 grid gap-4">
            {process.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] bg-[var(--tp-surface)] px-5 py-5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
                  {item.label}
                </div>
                <p className="mt-3 text-sm leading-7 tp-text-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Our point of view
          </div>
          <p className="mt-5 serif-display text-4xl leading-[1.05] tp-heading">
            We are not trying to fill a room. We are trying to give it a more grounded center.
          </p>
          <p className="mt-6 text-sm leading-8 tp-text-soft">
            That is why TuloPots leans into editorial restraint. We would rather offer a
            strong form with a clear reason to exist than crowd a collection with noise.
            The goal is trust, atmosphere, and visual calm.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Contact the Studio
            </Link>
            <Link href="/care-guide" className="btn-secondary">
              Care Guidance
            </Link>
          </div>
          <div className="mt-8 rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 py-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-text-muted">
              Reach us
            </div>
            <div className="mt-3 text-sm leading-7 tp-text-soft">
              {BRAND.emailPrimary}
              <br />
              {BRAND.phone}
              <br />
              Nairobi, Kenya
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
