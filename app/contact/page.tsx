import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { isSiteSectionVisible } from '@/lib/catalog';
import { BRAND, SITE_URL, imageByKey } from '@/lib/site';
import { Leaf, Mail, MapPin, Phone, Sparkles, Truck } from 'lucide-react';

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
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

const info = [
  { Icon: MapPin, title: 'Visit Us', text: 'Ngong Road, Nairobi, Kenya' },
  { Icon: Phone, title: 'Call Us', text: BRAND.phone },
  { Icon: Mail, title: 'Email Us', text: BRAND.emailPrimary },
  { Icon: ClockIcon, title: 'Open Hours', text: 'Mon–Sat, 9AM – 6PM EAT' },
] as const;

const pathways = [
  {
    href: '/delivery',
    title: 'Delivery help',
    body: 'Track a paid order, confirm timing, or check what happens after payment.',
    Icon: Truck,
  },
  {
    href: '/care-guide',
    title: 'Care guidance',
    body: 'Search common issues or upload a plant and terracotta challenge for support.',
    Icon: Leaf,
  },
  {
    href: '/studio',
    title: 'Studio briefs',
    body: 'Start custom work, quantity requests, or a more guided placement conversation.',
    Icon: Sparkles,
  },
] as const;

export default async function Page() {
  const isVisible = await isSiteSectionVisible('contact.entry');

  if (!isVisible) {
    notFound();
  }

  return (
    <main className="tp-page min-h-screen pb-20 pt-24">
      <section className="container-shell grid gap-8 xl:grid-cols-[1fr_0.92fr] xl:items-start">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] tp-accent">
            Get in Touch
          </div>
          <h1 className="mt-4 serif-display text-5xl leading-[0.95] tp-heading md:text-7xl">
            Contact the studio with clarity, not friction.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 tp-text-soft md:text-lg">
            Whether you need delivery help, care guidance, wholesale information, or a
            Studio conversation, this is the right place to start. We keep replies clear,
            warm, and useful.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/studio" className="btn-primary">
              Open Studio
            </Link>
            <Link href="/delivery" className="btn-secondary">
              Track an Order
            </Link>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-7">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
            Fastest routes
          </div>
          <div className="mt-5 grid gap-3">
            {pathways.map(({ href, title, body, Icon }) => (
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
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {info.map(({ Icon, title, text }) => (
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
        ))}
      </section>

      <section className="container-shell mt-12 grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Send a message
          </div>
          <h2 className="mt-4 serif-display text-4xl tp-heading md:text-5xl">
            Tell us what you need.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 tp-text-soft">
            Write to us about a form, a care issue, a delivery question, or a larger project.
            We usually reply within one working day.
          </p>

          <ContactForm context="contact-page" />
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
              Before you write
            </div>
            <div className="mt-5 grid gap-3">
              {[
                'Use Delivery Tracking first if your order is already paid.',
                'Use Care Guide if the issue is about watering, marks, or plant health.',
                'Use Studio when your request involves custom quantities, inspiration, or sourcing.',
              ].map((item) => (
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.199997936854!2d36.7817!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22ba8cbbf%3A0x66fb2be11a4c6de5!2sNgong%20Road%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske"
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
                Response promise
              </div>
              <p className="mt-4 serif-display text-4xl leading-[1.02] text-white">
                Clear replies, practical next steps, and no lost messages.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
                We use your message to route support properly, whether that means delivery
                follow-up, care guidance, sourcing help, or Studio direction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
