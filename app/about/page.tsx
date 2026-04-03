import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getManagedPageContent, resolveCmsImage } from '@/lib/cms';
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

export default async function Page() {
  const content = await getManagedPageContent('about.page');

  return (
    <main className="tp-page pb-24 pt-24 lg:pt-28">
      <section className="container-shell grid gap-8 lg:min-h-[82svh] lg:items-center xl:grid-cols-[0.92fr_1.08fr] xl:gap-16">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] tp-accent">
            {content.eyebrow}
          </div>
          <h1 className="mt-4 serif-display text-5xl leading-[0.92] tp-heading md:text-7xl">
            {content.title}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 tp-text-soft md:text-lg md:leading-8">
            {content.intro}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={content.primaryCta.href} className="btn-primary">
              {content.primaryCta.label}
            </Link>
            <Link href={content.secondaryCta.href} className="btn-secondary">
              {content.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1.02fr_0.98fr]">
          <div className="overflow-hidden rounded-[2.4rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
            <Image
              src={resolveCmsImage(content.heroImage.src)}
              alt={content.heroImage.alt}
              width={1200}
              height={1400}
              className="h-full min-h-[28rem] w-full object-cover xl:min-h-[36rem]"
            />
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
              <Image
                src={resolveCmsImage(content.studioImage.src)}
                alt={content.studioImage.alt}
                width={900}
                height={900}
                className="h-60 w-full object-cover xl:h-72"
              />
            </div>
            <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-7 xl:p-8">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
                {content.highlightEyebrow}
              </div>
              <p className="mt-4 serif-display text-3xl leading-[1.08] tp-heading xl:text-[2.45rem]">
                {content.highlightTitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-16 lg:mt-10 lg:flex lg:min-h-[80svh] lg:items-center">
        <div className="w-full rounded-[2.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-7 md:p-9 xl:p-10">
          <div className="mb-8 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
              {content.journeyEyebrow}
            </div>
            <h2 className="mt-5 serif-display text-4xl leading-[1.04] tp-heading md:text-5xl xl:text-[3.2rem]">
              {content.journeyTitle}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {content.journey.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] bg-[var(--tp-surface)] px-6 py-7 xl:px-7 xl:py-8"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
                  {item.label}
                </div>
                <div className="mt-4 serif-display text-3xl leading-[1.06] tp-heading xl:text-[2.15rem]">
                  {item.title}
                </div>
                <p className="mt-5 text-sm leading-8 tp-text-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-16 grid gap-6 lg:mt-10 lg:min-h-[76svh] lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-7 md:p-9 xl:p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            {content.valuesEyebrow}
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {content.values.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-7 max-w-2xl text-sm leading-8 tp-text-soft">
            {content.valuesBody}
          </p>
        </div>

        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-7 md:p-9 xl:p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            {content.continueEyebrow}
          </div>
          <p className="mt-6 serif-display text-4xl leading-[1.06] tp-heading xl:text-[3rem]">
            {content.continueTitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={content.continuePrimaryCta.href} className="btn-primary">
              {content.continuePrimaryCta.label}
            </Link>
            <Link href={content.continueSecondaryCta.href} className="btn-secondary">
              {content.continueSecondaryCta.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
