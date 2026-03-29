'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COOKIE_CONSENT_KEY, type ConsentLevel, readStoredConsent, writeStoredConsent } from '@/lib/tracking';
import { LEGAL_ROUTES } from '@/lib/policies';

export function CookieBanner() {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<ConsentLevel>('essential');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const nextConsent = readStoredConsent();
    setConsent(nextConsent);
    setHydrated(true);
    setDismissed(
      typeof window !== 'undefined' &&
        window.localStorage.getItem(COOKIE_CONSENT_KEY) !== null
    );
  }, []);

  function choose(level: ConsentLevel) {
    writeStoredConsent(level);
    setConsent(level);
    setDismissed(true);
  }

  if (!hydrated || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[180] md:inset-x-auto md:bottom-6 md:right-6 md:max-w-lg">
      <div className="rounded-[1.75rem] border tp-card p-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-accent">
          Privacy Choices
        </div>
        <h2 className="mt-2 serif-display text-3xl tp-heading">
          Choose how TuloPots remembers your visit
        </h2>
        <p className="mt-3 text-sm leading-7 tp-text-soft">
          Essential cookies keep checkout, login, and Studio working. Analytics
          helps us understand what people use. Marketing consent lets future ad
          campaigns measure visits and purchases on-site.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => choose('essential')}
            className="btn-secondary flex-1"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => choose('analytics')}
            className="btn-secondary flex-1"
          >
            Allow Analytics
          </button>
          <button
            type="button"
            onClick={() => choose('marketing')}
            className="btn-primary flex-1"
          >
            Allow Marketing
          </button>
        </div>
        <p className="mt-3 text-xs tp-text-muted">
          Current default: <span className="font-semibold tp-heading">{consent}</span>. See our{' '}
          <Link href={LEGAL_ROUTES.cookies} className="tp-accent underline">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href={LEGAL_ROUTES.privacy} className="tp-accent underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
