'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { LEGAL_ROUTES } from '@/lib/policies';
import { useStore } from './Providers';

type ConsentResponse = {
  ok: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isAdmin: boolean;
    avatar?: string;
    marketingConsent: boolean;
    acceptedPolicyVersion?: string;
    hasAcceptedPolicies: boolean;
  };
};

export function PolicyGate() {
  const { user, setUser, setIsLoggedIn } = useStore();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isOpen = useMemo(
    () => Boolean(user && !user.hasAcceptedPolicies),
    [user]
  );

  if (!user || !isOpen) {
    return null;
  }

  async function handleAccept() {
    if (!acceptTerms || !acceptPrivacy) {
      setError('You need to accept the Terms and the Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptTerms: true,
          acceptPrivacy: true,
          marketingConsent,
        }),
      });
      const data = (await response.json()) as ConsentResponse;

      if (!response.ok || !data.ok || !data.user) {
        throw new Error(data.error || 'We could not save your policy choices.');
      }

      setUser(data.user);
    } catch (issue: any) {
      setError(issue?.message || 'We could not save your policy choices.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[220] overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-[2rem] border tp-card-strong p-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] tp-accent">
          First Sign-In Checkpoint
        </div>
        <h2 className="mt-3 serif-display text-5xl tp-heading">
          One more step before we continue
        </h2>
        <p className="mt-4 text-sm leading-7 tp-text-soft">
          Before your account is active across checkout, Studio, reviews, and saved
          pieces, please confirm the current TuloPots Terms and Privacy Policy.
          This keeps your permissions and our records aligned.
        </p>

        <div className="mt-6 space-y-3 rounded-[1.5rem] tp-surface p-5">
          <label className="flex items-start gap-3 text-sm leading-7 tp-text-soft">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--tp-border-strong)]"
            />
            <span>
              I accept the{' '}
              <Link href={LEGAL_ROUTES.terms} target="_blank" className="tp-accent underline">
                Terms of Use
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-7 tp-text-soft">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(event) => setAcceptPrivacy(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--tp-border-strong)]"
            />
            <span>
              I confirm I have read the{' '}
              <Link
                href={LEGAL_ROUTES.privacy}
                target="_blank"
                className="tp-accent underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-7 tp-text-soft">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(event) => setMarketingConsent(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--tp-border-strong)]"
            />
            <span>
              I am happy to receive product updates, care notes, and launch news by
              email. This is optional.
            </span>
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[var(--tp-border-strong)] bg-[var(--tp-accent-soft)] px-4 py-3 text-sm tp-heading">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving Choices...' : 'Accept and Continue'}
          </button>
          <button
            type="button"
            onClick={() => setIsLoggedIn(false)}
            className="btn-secondary flex-1"
          >
            Sign Out Instead
          </button>
        </div>
      </div>
    </div>
  );
}
