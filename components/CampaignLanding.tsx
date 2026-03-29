import Image from 'next/image';
import Link from 'next/link';

type CampaignLandingProps = {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  facts: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function CampaignLanding({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  facts,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CampaignLandingProps) {
  return (
    <main className="container-shell py-12 md:py-16">
      <section className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
            {eyebrow}
          </div>
          <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--tp-text)]/75 md:text-base">
            {intro}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {facts.map((fact) => (
              <span
                key={fact}
                className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/72"
              >
                {fact}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
            </Link>
            <Link href={secondaryHref} className="btn-secondary">
              {secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
          <Image
            src={image}
            alt={imageAlt}
            width={1400}
            height={1400}
            className="h-[26rem] w-full object-cover md:h-[34rem]"
          />
        </div>
      </section>
    </main>
  );
}
