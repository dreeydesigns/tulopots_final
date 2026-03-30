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

const journey = [
  {
    label: '01',
    title: 'From earth',
    body: 'It begins with clay, chosen for warmth, texture, and quiet material honesty.',
  },
  {
    label: '02',
    title: 'Through hand',
    body: 'Each form is shaped slowly, with proportion and presence considered before excess.',
  },
  {
    label: '03',
    title: 'Into spaces',
    body: 'The final object is made to belong in a room, an entry, a shelf, or an open space.',
  },
];

export default function Page() {
  return (
    <main className="tp-page pb-20 pt-24">
      <section className="container-shell grid gap-8 xl:grid-cols-[0.96fr_1.04fr] xl:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] tp-accent">
            About TuloPots
          </div>
          <h1 className="mt-4 serif-display text-5xl leading-[0.92] tp-heading md:text-7xl">
            From clay to calm living.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 tp-text-soft md:text-lg">
            TuloPots is a Nairobi studio shaping terracotta forms for homes that want warmth,
            balance, and visual calm. We do not make objects to fill space. We make forms that
            help a space feel more grounded.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/pots" className="btn-primary">
              Explore Clay Forms
            </Link>
            <Link href="/studio" className="btn-secondary">
              Open Studio
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.02fr_0.98fr]">
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
            <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
                Crafted for living
              </div>
              <p className="mt-3 serif-display text-3xl leading-[1.05] tp-heading">
                Material warmth, restrained form, lasting presence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-16">
        <div className="rounded-[2.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
          <div className="mb-8 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
              The journey
            </div>
            <h2 className="mt-4 serif-display text-4xl tp-heading md:text-5xl">
              A simple path from material to placement.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {journey.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] bg-[var(--tp-surface)] px-5 py-6"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
                  {item.label}
                </div>
                <div className="mt-3 serif-display text-3xl tp-heading">{item.title}</div>
                <p className="mt-4 text-sm leading-7 tp-text-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-16 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            What stays true
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              'Nairobi crafted',
              'Natural terracotta',
              'Placement first',
              'Editorial restraint',
              'Interior spaces',
              'Open spaces',
            ].map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-8 tp-text-soft">
            The point is not decoration for its own sake. The point is to shape forms that
            carry calm into real rooms, real corners, and real daily life.
          </p>
        </div>

        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Continue
          </div>
          <p className="mt-5 serif-display text-4xl leading-[1.04] tp-heading">
            Explore the forms, or begin a more guided Studio conversation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pots" className="btn-primary">
              View Collection
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
