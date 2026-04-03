import type { Metadata } from 'next';
import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { isSiteSectionVisible } from '@/lib/catalog';
import { getManagedPageContent, type ContactInfoIconKey } from '@/lib/cms';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';
import { Leaf, Mail, MapPin, Phone, Sparkles, Truck } from 'lucide-react';

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact TuloPots in Nairobi, Kenya for Studio commissions, handcrafted terracotta forms, care guidance, delivery help, and wholesale conversations.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | TuloPots',
    description:
      'Contact TuloPots in Nairobi for handcrafted terracotta forms, Studio commissions, care support, and wholesale conversations.',
    url: `${SITE_URL}/contact`,
    images: [imageByKey.contact],
  },
};

const infoIconMap: Record<ContactInfoIconKey, ComponentType<any>> = {
  MapPin,
  Phone,
  Mail,
  Clock: ClockIcon,
};

const pathwayIconMap = {
  Truck,
  Leaf,
  Sparkles,
};

export default async function Page() {
  const isVisible = await isSiteSectionVisible('contact.entry');
  const content = await getManagedPageContent('contact.page');

  if (!isVisible) {
    notFound();
  }

  return (
    <main className="tp-page min-h-screen pb-20 pt-24">
      <section className="container-shell grid gap-8 xl:grid-cols-[1fr_0.92fr] xl:items-start">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] tp-accent">
            {content.eyebrow}
          </div>
          <h1 className="mt-4 serif-display text-5xl leading-[0.95] tp-heading md:text-7xl">
            {content.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 tp-text-soft md:text-lg">
            {content.intro}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={content.primaryCta.href} className="btn-primary">
              {content.primaryCta.label}
            </Link>
            <Link href={content.secondaryCta.href} className="btn-secondary">
              {content.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-7">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
            {content.pathwaysEyebrow}
          </div>
          <div className="mt-5 grid gap-3">
            {content.pathways.map(({ href, title, body, icon }) => {
              const Icon = pathwayIconMap[icon];
              return (
              <Link
                key={title}
                href={href}
                className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-5 transition hover:border-[var(--tp-border-strong)]"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                  <Icon className="h-3.5 w-3.5 tp-accent" />
                  {title}
                </div>
                <p className="mt-3 text-sm leading-7 tp-text-soft">{body}</p>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-shell mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {content.info.map(({ icon, title, text }) => {
          const Icon = infoIconMap[icon];
          return (
            <div
              key={title}
              className="rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 py-5"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: 'var(--tp-accent-soft)' }}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  style={{ color: 'var(--tp-accent)' }}
                />
              </div>
              <div className="mt-4 serif-display text-3xl tp-heading">{title}</div>
              <div className="mt-3 text-sm leading-7 tp-text-soft">{text}</div>
            </div>
          );
        })}
      </section>

      <section className="container-shell mt-12 grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            {content.formEyebrow}
          </div>
          <h2 className="mt-4 serif-display text-4xl tp-heading md:text-5xl">
            {content.formTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 tp-text-soft">
            {content.formIntro}
          </p>

          <ContactForm context="contact-page" />
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
              {content.beforeWriteEyebrow}
            </div>
            <div className="mt-5 grid gap-3">
              {content.beforeWrite.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-4 text-sm leading-7 tp-text-soft"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
            <iframe
              title="TuloPots Location — Nairobi"
              src={content.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 330 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div
            className="overflow-hidden rounded-[2.25rem] border border-[var(--tp-border)]"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--tp-heading) 92%, black 8%) 0%, color-mix(in srgb, var(--tp-accent) 22%, var(--tp-heading) 78%) 100%)',
              color: 'var(--tp-btn-primary-text)',
            }}
          >
            <div className="px-6 py-7 md:px-8">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                {content.responsePromiseEyebrow}
              </div>
              <p className="mt-4 serif-display text-4xl leading-[1.02] text-white">
                {content.responsePromiseTitle}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
                {content.responsePromiseBody}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
