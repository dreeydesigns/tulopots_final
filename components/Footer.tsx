'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LEGAL_ROUTES } from '@/lib/policies';
import { useStore } from './Providers';

export function Footer() {
  const { isSectionVisible } = useStore();
  const [newsletterState, setNewsletterState] = useState('');
  const [newsletterTone, setNewsletterTone] = useState<'idle' | 'error' | 'success'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['new-arrivals']);

  function toggleInterest(value: string) {
    setSelectedInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNewsletterState('');
    setNewsletterTone('idle');

    const form = event.currentTarget;
    const formData = new FormData(form);
    selectedInterests.forEach((interest) => formData.append('interests', interest));
    formData.set('source', 'footer');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Unable to join right now.');
      }

      form.reset();
      setNewsletterTone('success');
      setNewsletterState(data.message || 'You are subscribed.');
    } catch (error: any) {
      setNewsletterTone('error');
      setNewsletterState(error?.message || 'Unable to join right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer
      className="border-t"
      style={{
        background: 'color-mix(in srgb, var(--tp-heading) 96%, black 4%)',
        borderColor: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.92)',
      }}
    >
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr]">
        <div>
          <div className="serif-display text-3xl">
            Tulo<span style={{ color: 'var(--tp-accent)' }}>Pots</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Handcrafted in Nairobi, Kenya
          </p>
          <p className="mt-1 text-xs text-white/30">EST. 2016</p>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Shop
          </div>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
            {isSectionVisible('collections.indoor') ? (
              <Link href="/indoor" className="transition hover:text-white">
                For Interior Spaces
              </Link>
            ) : null}
            {isSectionVisible('collections.outdoor') ? (
              <Link href="/outdoor" className="transition hover:text-white">
                For Open Spaces
              </Link>
            ) : null}
            {isSectionVisible('collections.pots') ? (
              <Link href="/pots" className="transition hover:text-white">
                Clay Forms
              </Link>
            ) : null}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Help
          </div>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
            {isSectionVisible('faq.entry') ? (
              <Link href="/faq" className="transition hover:text-white">
                FAQ
              </Link>
            ) : null}
            <Link href="/care-guide" className="transition hover:text-white">
              Care Guide
            </Link>
            <Link href="/delivery" className="transition hover:text-white">
              Track Order
            </Link>
            <Link href={LEGAL_ROUTES.delivery} className="transition hover:text-white">
              Delivery & Returns
            </Link>
            {isSectionVisible('contact.entry') ? (
              <Link href="/contact" className="transition hover:text-white">
                Contact Us
              </Link>
            ) : null}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Join the TuloPots Community
          </div>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Choose the updates you actually want: new arrivals, care guidance, open-space ideas, and launch notes.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="mt-5 space-y-3">
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                name="name"
                type="text"
                placeholder="Your name"
                className="min-w-0 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
              />
              <input
                name="email"
                type="email"
                placeholder="Your email"
                className="min-w-0 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                required
              />
            </div>

            <select
              name="preferredChannel"
              className="w-full rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white outline-none focus:border-white/25"
              defaultValue="email"
            >
              <option value="email">Email updates</option>
              <option value="sms">SMS updates</option>
              <option value="whatsapp">WhatsApp updates</option>
            </select>

            <div className="flex flex-wrap gap-2">
              {[
                ['new-arrivals', 'New arrivals'],
                ['care-guidance', 'Care guidance'],
                ['launch-notes', 'Launch notes'],
                ['open-space-ideas', 'Open-space ideas'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleInterest(value)}
                  className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                  style={{
                    borderColor: selectedInterests.includes(value)
                      ? 'var(--tp-accent)'
                      : 'rgba(255,255,255,0.12)',
                    background: selectedInterests.includes(value)
                      ? 'rgba(255,255,255,0.12)'
                      : 'transparent',
                    color: selectedInterests.includes(value)
                      ? 'var(--tp-accent-soft)'
                      : 'rgba(255,255,255,0.72)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:opacity-90"
              style={{ background: 'var(--tp-accent)' }}
            >
              {isSubmitting ? 'Joining...' : 'Join the List'}
            </button>
          </form>
          <p className="mt-3 text-xs leading-6 text-white/35">
            By joining, you agree to our{' '}
            <Link href={LEGAL_ROUTES.privacy} className="underline">
              Privacy Policy
            </Link>{' '}
            and can unsubscribe at any time.
          </p>
          {newsletterState ? (
            <div
              className="mt-3 rounded-2xl px-4 py-3 text-xs leading-6"
              style={{
                background:
                  newsletterTone === 'error'
                    ? 'rgba(208, 138, 87, 0.14)'
                    : 'rgba(255,255,255,0.08)',
                color:
                  newsletterTone === 'error'
                    ? 'var(--tp-accent)'
                    : 'rgba(255,255,255,0.82)',
              }}
            >
              {newsletterState}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/8 py-5">
        <div className="container-shell flex flex-col gap-3 text-center text-xs text-white/30 md:flex-row md:items-center md:justify-between md:text-left">
          <div>© 2026 TuloPots. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
            <Link href={LEGAL_ROUTES.terms} className="transition hover:text-white">
              Terms
            </Link>
            <Link href={LEGAL_ROUTES.privacy} className="transition hover:text-white">
              Privacy
            </Link>
            <Link href={LEGAL_ROUTES.cookies} className="transition hover:text-white">
              Cookies
            </Link>
            <Link href={LEGAL_ROUTES.delivery} className="transition hover:text-white">
              Delivery & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
