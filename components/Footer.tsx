'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { LEGAL_ROUTES } from '@/lib/policies';
import { BRAND } from '@/lib/site';
import { useStore } from './Providers';

export function Footer() {
  const { isLoggedIn, isSectionVisible } = useStore();
  const pathname = usePathname();
  const [newsletterState, setNewsletterState] = useState('');
  const [newsletterTone, setNewsletterTone] = useState<'idle' | 'error' | 'success'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['new-arrivals']);

  if (pathname === '/' && isLoggedIn) {
    return null;
  }

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
      setSelectedInterests(['new-arrivals']);
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
        borderColor: 'var(--tp-border)',
        backgroundColor: 'var(--tp-surface-2)',
        backgroundImage:
          'linear-gradient(180deg, var(--tp-surface) 0%, var(--tp-surface-2) 100%)',
        color: 'var(--tp-text)',
      }}
    >
      <div className="container-shell py-14">
        <div className="grid gap-10 lg:grid-cols-2 xl:grid-cols-[1.05fr_0.72fr_0.72fr_0.88fr_1.15fr]">
          <div>
            <div className="serif-display text-4xl tp-heading">
              Tulo<span style={{ color: 'var(--tp-accent)' }}>Pots</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 tp-text-soft">
              Handcrafted terracotta from Nairobi, Kenya, shaped for interior spaces,
              open spaces, and homes that want warmth without noise.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="btn-secondary"
                style={{
                  background: 'var(--tp-card-strong)',
                  borderColor: 'var(--tp-border-strong)',
                  color: 'var(--tp-heading)',
                }}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="btn-primary"
                style={{
                  boxShadow: 'var(--tp-shadow-soft)',
                }}
              >
                Contact
              </Link>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] tp-text-muted">
              Shop
            </div>
            <div className="mt-5 flex flex-col gap-3 text-sm tp-text-soft">
              {isSectionVisible('collections.indoor') ? (
                <Link href="/indoor" className="transition hover:tp-heading">
                  For Interior Spaces
                </Link>
              ) : null}
              {isSectionVisible('collections.outdoor') ? (
                <Link href="/outdoor" className="transition hover:tp-heading">
                  For Open Spaces
                </Link>
              ) : null}
              {isSectionVisible('collections.pots') ? (
                <Link href="/pots" className="transition hover:tp-heading">
                  Clay Forms
                </Link>
              ) : null}
              <Link href="/search" className="transition hover:tp-heading">
                Search
              </Link>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] tp-text-muted">
              Explore
            </div>
            <div className="mt-5 flex flex-col gap-3 text-sm tp-text-soft">
              <Link href="/about" className="transition hover:tp-heading">
                About Us
              </Link>
              {isSectionVisible('studio.entry') ? (
                <Link href="/studio" className="transition hover:tp-heading">
                  Studio
                </Link>
              ) : null}
              {isSectionVisible('contact.entry') ? (
                <Link href="/contact" className="transition hover:tp-heading">
                  Contact Us
                </Link>
              ) : null}
              <Link href="/care-guide" className="transition hover:tp-heading">
                Care Guide
              </Link>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] tp-text-muted">
              Reach Us
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { icon: MapPin, label: 'Nairobi, Kenya' },
                { icon: Phone, label: BRAND.phone },
                { icon: Mail, label: BRAND.emailPrimary },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-[1.25rem] border px-4 py-4 text-sm"
                  style={{
                    borderColor: 'var(--tp-border)',
                    background: 'var(--tp-card-strong)',
                    color: 'var(--tp-text)',
                    boxShadow: 'var(--tp-shadow-soft)',
                  }}
                >
                  <item.icon className="mt-0.5 h-4 w-4" style={{ color: 'var(--tp-accent)' }} />
                  <span>{item.label}</span>
                </div>
              ))}
              <Link href="/delivery" className="text-sm tp-text-soft transition hover:tp-heading">
                Track a paid order
              </Link>
            </div>
          </div>

          <div
            className="rounded-[2rem] border p-6"
            style={{
              borderColor: 'var(--tp-border)',
              background: 'var(--tp-card-strong)',
              boxShadow: 'var(--tp-shadow-soft)',
            }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] tp-text-muted">
              Join the TuloPots Community
            </div>
            <p className="mt-4 text-sm leading-7 tp-text-soft">
              Choose the updates you actually want: new arrivals, care guidance,
              open-space ideas, and launch notes.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mt-5 space-y-3">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="tp-input min-w-0 rounded-full px-5 py-3 text-sm outline-none"
                  style={{ borderWidth: '1px' }}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your email"
                  className="tp-input min-w-0 rounded-full px-5 py-3 text-sm outline-none"
                  style={{ borderWidth: '1px' }}
                  required
                />
              </div>

              <select
                name="preferredChannel"
                className="tp-input w-full rounded-full px-5 py-3 text-sm outline-none"
                defaultValue="email"
                style={{ borderWidth: '1px' }}
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
                        : 'var(--tp-border)',
                      background: selectedInterests.includes(value)
                        ? 'var(--tp-accent-soft)'
                        : 'var(--tp-card)',
                      color: selectedInterests.includes(value)
                        ? 'var(--tp-accent)'
                        : 'var(--tp-text)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
                {isSubmitting ? 'Joining...' : 'Join the List'}
              </button>
            </form>
            <p className="mt-3 text-xs leading-6 tp-text-muted">
              By joining, you agree to our{' '}
              <Link href={LEGAL_ROUTES.privacy} className="tp-accent underline">
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
                      ? 'color-mix(in srgb, var(--tp-accent) 10%, var(--tp-card) 90%)'
                      : 'color-mix(in srgb, var(--tp-success) 12%, var(--tp-card) 88%)',
                  color:
                    newsletterTone === 'error'
                      ? 'var(--tp-accent)'
                      : 'var(--tp-heading)',
                }}
              >
                {newsletterState}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t py-5" style={{ borderColor: 'var(--tp-border)' }}>
        <div className="container-shell flex flex-col gap-3 text-center text-xs tp-text-muted md:flex-row md:items-center md:justify-between md:text-left">
          <div>© 2026 TuloPots. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
            <Link href={LEGAL_ROUTES.terms} className="transition hover:tp-heading">
              Terms
            </Link>
            <Link href={LEGAL_ROUTES.privacy} className="transition hover:tp-heading">
              Privacy
            </Link>
            <Link href={LEGAL_ROUTES.cookies} className="transition hover:tp-heading">
              Cookies
            </Link>
            <Link href={LEGAL_ROUTES.delivery} className="transition hover:tp-heading">
              Delivery & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
