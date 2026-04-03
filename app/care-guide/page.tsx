import type { Metadata } from 'next';
import type { ComponentType } from 'react';
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
import { CareGuideExplorer } from '@/components/CareGuideExplorer';
import { getManagedPageContent, type CareGuideIconKey } from '@/lib/cms';
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

const iconMap: Record<CareGuideIconKey, ComponentType<any>> = {
  Droplets,
  Sun,
  Wind,
  ShieldAlert,
  Leaf,
  Sprout,
};

export default async function CareGuidePage() {
  const content = await getManagedPageContent('care-guide.page');
  const supportEntries = [
    ...content.sections.flatMap((section) =>
      section.cards.map((card) => ({
        section: section.title,
        title: card.title,
        body: card.text,
      }))
    ),
    ...content.troubleshooting.map((item) => ({
      section: 'Troubleshooting',
      title: item.title,
      body: item.text,
    })),
  ];

  return (
    <main className="min-h-screen bg-[var(--tp-bg)]">
      <section className="border-b border-[var(--tp-border)] bg-[var(--tp-card)] pb-14 pt-28">
        <div className="container-shell">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
            {content.eyebrow}
          </div>
          <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--tp-text)]/72 md:text-base">
            {content.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-xs">
            {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 text-[var(--tp-text)]/68"
                >
                  {tag}
                </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-20">
        <div className="space-y-14">
          {content.sections.map((section) => (
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
                  const Icon = iconMap[card.icon];
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
            {content.troubleshootingEyebrow}
          </div>
          <h2 className="mt-4 serif-display text-4xl text-[var(--tp-heading)] md:text-5xl">
            {content.troubleshootingTitle}
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {content.troubleshooting.map((item) => (
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

      <CareGuideExplorer
        entries={supportEntries}
        copy={{
          searchEyebrow: content.explorerSearchEyebrow,
          searchTitle: content.explorerSearchTitle,
          uploadEyebrow: content.explorerUploadEyebrow,
          uploadTitle: content.explorerUploadTitle,
          uploadBody: content.explorerUploadBody,
        }}
      />

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
              {content.supportEyebrow}
            </div>
            <h2 className="mt-4 serif-display text-4xl md:text-5xl">
              {content.supportTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72 md:text-base">
              {content.supportBody}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={content.supportPrimaryCta.href}
                className="btn-primary inline-flex items-center gap-2"
              >
                {content.supportPrimaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={content.supportSecondaryCta.href}
                className="btn-secondary inline-flex items-center gap-2"
              >
                {content.supportSecondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
