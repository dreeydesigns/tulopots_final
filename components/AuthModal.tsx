'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import {
  countryOptions,
  currencyForCountry,
  currencyOptions,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  languageOptions,
} from '@/lib/customer-preferences';
import { LEGAL_ROUTES } from '@/lib/policies';
import { useStore } from './Providers';

type AuthResponse = {
  ok: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isAdmin: boolean;
    role:
      | 'CUSTOMER'
      | 'SUPER_ADMIN'
      | 'OPERATIONS_ADMIN'
      | 'DELIVERY_ADMIN'
      | 'CONTENT_ADMIN'
      | 'SUPPORT_ADMIN'
      | 'ANALYST';
    permissions: string[];
    allowedAdminTabs: string[];
    avatar?: string;
    marketingConsent: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    preferredContactChannel: string;
    preferredLanguage: string;
    preferredCurrency: string;
    defaultShippingAddress?: string;
    defaultShippingCity?: string;
    defaultShippingCountry: string;
    acceptedPolicyVersion?: string;
    hasAcceptedPolicies: boolean;
  };
};

type AuthProvidersResponse = {
  ok: boolean;
  providers?: {
    password: boolean;
    google: boolean;
    apple: boolean;
  };
};

type ProviderName = 'google' | 'apple';

const defaultProviders = {
  password: true,
  google: false,
  apple: false,
};

function mapAuthError(code: string) {
  switch (code) {
    case 'provider_unavailable':
      return 'That sign-in method is not configured yet.';
    case 'invalid_state':
      return 'This sign-in request expired. Please try again.';
    case 'oauth_access_denied':
      return 'The sign-in request was cancelled before it finished.';
    case 'google_exchange_failed':
    case 'google_profile_failed':
      return 'Google sign-in could not be completed right now.';
    case 'apple_exchange_failed':
    case 'apple_identity_missing':
      return 'Apple sign-in could not be completed right now.';
    case 'account_missing_email':
      return 'We could not read an email address from that social account.';
    default:
      return 'We could not sign you in right now.';
  }
}

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, setUser, refreshSession } = useStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [activeAction, setActiveAction] = useState<
    'password' | 'google' | 'apple' | null
  >(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [preferredCurrency, setPreferredCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [defaultShippingCountry, setDefaultShippingCountry] = useState<string>(DEFAULT_COUNTRY);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [providers, setProviders] = useState(defaultProviders);
  const [providersLoaded, setProvidersLoaded] = useState(false);

  const hasOAuthProviders = useMemo(
    () => providers.google || providers.apple,
    [providers.apple, providers.google]
  );

  useEffect(() => {
    if (!showAuthModal) {
      setError('');
      setPassword('');
      setActiveAction(null);
      setAcceptTerms(false);
      setAcceptPrivacy(false);
      setMarketingConsent(false);
      setPreferredLanguage(DEFAULT_LANGUAGE);
      setPreferredCurrency(DEFAULT_CURRENCY);
      setDefaultShippingCountry(DEFAULT_COUNTRY);
    }
  }, [showAuthModal]);

  useEffect(() => {
    if (!showAuthModal) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [showAuthModal]);

  useEffect(() => {
    if (!showAuthModal || providersLoaded) {
      return;
    }

    let active = true;

    fetch('/api/auth/providers', {
      cache: 'no-store',
    })
      .then((response) => response.json())
      .then((data: AuthProvidersResponse) => {
        if (active && data.ok && data.providers) {
          setProviders(data.providers);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setProvidersLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [providersLoaded, showAuthModal]);

  useEffect(() => {
    const authSuccess = searchParams.get('authSuccess');

    if (!authSuccess) {
      return;
    }

    void refreshSession().finally(() => {
      setError('');
      setShowAuthModal(false);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('authSuccess');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
    });
  }, [refreshSession, searchParams, setShowAuthModal]);

  useEffect(() => {
    const authError = searchParams.get('authError');

    if (!authError) {
      return;
    }

    setTab('signin');
    setError(mapAuthError(authError));
    setShowAuthModal(true);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('authError');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [searchParams, setShowAuthModal]);

  if (!showAuthModal) {
    return null;
  }

  const isBusy = activeAction !== null;

  const close = () => {
    setShowAuthModal(false);
    setError('');
    setPassword('');
    setActiveAction(null);
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setActiveAction('password');
    setError('');

    if (tab === 'signup' && (!acceptTerms || !acceptPrivacy)) {
      setError('Accept the Terms and Privacy Policy to create your account.');
      setActiveAction(null);
      return;
    }

    try {
      const endpoint = tab === 'signin' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          tab === 'signin'
            ? { email, password }
            : {
                name,
                email,
                phone,
                password,
                acceptTerms,
                acceptPrivacy,
                marketingConsent,
                preferredLanguage,
                preferredCurrency,
                defaultShippingCountry,
              }
        ),
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.ok || !data.user) {
        setError(data.error || 'We could not sign you in right now.');
        return;
      }

      setUser(data.user);
      close();
    } catch {
      setError('We could not sign you in right now.');
    } finally {
      setActiveAction(null);
    }
  }

  async function startSocialSignIn(provider: ProviderName) {
    setError('');
    setActiveAction(provider);

    try {
      const returnTo =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : pathname || '/';
      const startUrl = new URL('/api/auth/oauth/start', window.location.origin);
      startUrl.searchParams.set('provider', provider);
      startUrl.searchParams.set('returnTo', returnTo);
      window.location.assign(startUrl.toString());
    } catch {
      setError('We could not start that sign-in flow.');
      setActiveAction(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto bg-black/60 px-4 py-5 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8"
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] shadow-2xl">
        <div
          className="max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="sticky top-0 z-10 border-b border-[var(--tp-border)] bg-[var(--tp-surface)] px-8 pb-6 pt-8">
            <button
              onClick={close}
              className="absolute right-5 top-5 rounded-full p-2 text-[var(--tp-text)]/55 transition hover:bg-[var(--tp-card)]"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="serif-display text-3xl text-[var(--tp-heading)]">
              Tulo<span className="text-[var(--tp-accent)]">Pots</span>
            </div>
            <p className="mt-1 text-sm text-[var(--tp-text)]/65">
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </p>
            <div className="mt-5 flex gap-1 rounded-full bg-[var(--tp-card)] p-1">
              {(['signin', 'signup'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setTab(item);
                    setError('');
                  }}
                  type="button"
                  className={`flex-1 rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                    tab === item
                      ? 'bg-[var(--tp-heading)] text-[var(--tp-bg)] shadow'
                      : 'text-[var(--tp-text)]/55 hover:text-[var(--tp-heading)]'
                  }`}
                >
                  {item === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-6 pb-7 sm:pb-6">
            {hasOAuthProviders ? (
              <>
                <button
                  type="button"
                  onClick={() => startSocialSignIn('google')}
                  disabled={isBusy || !providers.google}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm font-medium text-[var(--tp-heading)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tp-card)] text-sm font-semibold text-[var(--tp-heading)]">
                    G
                  </span>
                  {activeAction === 'google'
                    ? 'Connecting to Google...'
                    : 'Continue with Google'}
                </button>

                <button
                  type="button"
                  onClick={() => startSocialSignIn('apple')}
                  disabled={isBusy || !providers.apple}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm font-medium text-[var(--tp-heading)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tp-card)] text-sm font-semibold text-[var(--tp-heading)]">
                    A
                  </span>
                  {activeAction === 'apple'
                    ? 'Connecting to Apple...'
                    : 'Continue with Apple'}
                </button>

                <div className="flex items-center gap-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-text)]/40">
                  <span className="h-px flex-1 bg-[var(--tp-border)]" />
                  Or continue with email
                  <span className="h-px flex-1 bg-[var(--tp-border)]" />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-3 text-xs leading-6 text-[var(--tp-text)]/65">
                Google and Apple sign-in become available as soon as their provider
                credentials are added. Social sign-in users will also confirm the
                latest TuloPots terms on first entry.
              </div>
            )}

          {tab === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tp-text)]/35" />
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] py-3.5 pl-11 pr-5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tp-text)]/35" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] py-3.5 pl-11 pr-5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
            />
          </div>

          {tab === 'signup' && (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tp-text)]/35" />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone e.g. +254700000000"
                className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] py-3.5 pl-11 pr-5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
              />
            </div>
          )}

          {tab === 'signup' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs text-[var(--tp-text)]/68">
                <span className="font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/48">
                  Country
                </span>
                <select
                  value={defaultShippingCountry}
                  onChange={(event) => {
                    const nextCountry = event.target.value;
                    setDefaultShippingCountry(nextCountry);
                    setPreferredCurrency(currencyForCountry(nextCountry));
                  }}
                  className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                >
                  {countryOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-xs text-[var(--tp-text)]/68">
                <span className="font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/48">
                  Language
                </span>
                <select
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                >
                  {languageOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {tab === 'signup' ? (
            <label className="grid gap-2 text-xs text-[var(--tp-text)]/68">
              <span className="font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/48">
                Currency
              </span>
              <select
                value={preferredCurrency}
                onChange={(event) => setPreferredCurrency(event.target.value)}
                className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} · {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tp-text)]/35" />
            <input
              required
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              className="w-full rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] py-3.5 pl-11 pr-12 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
            />
            <button
              type="button"
              onClick={() => setShowPw((state) => !state)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--tp-text)]/35 transition hover:text-[var(--tp-heading)]"
            >
              {showPw ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {tab === 'signup' ? (
            <div className="space-y-3 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-4">
              <label className="flex items-start gap-3 text-xs leading-6 text-[var(--tp-text)]/68">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[var(--tp-border-strong)]"
                />
                <span>
                  I accept the{' '}
                  <Link href={LEGAL_ROUTES.terms} target="_blank" className="text-[var(--tp-accent)] underline">
                    Terms of Use
                  </Link>
                  .
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs leading-6 text-[var(--tp-text)]/68">
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
                    className="text-[var(--tp-accent)] underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs leading-6 text-[var(--tp-text)]/68">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(event) => setMarketingConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[var(--tp-border-strong)]"
                />
                <span>
                  Send me launch updates, care notes, and product stories by email.
                </span>
              </label>
            </div>
          ) : null}

          {error && (
            <div className="rounded-2xl border border-[var(--tp-accent)]/20 bg-[var(--tp-accent-soft)] px-4 py-3 text-sm text-[var(--tp-heading)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="mt-1 w-full rounded-full bg-[var(--tp-heading)] py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-bg)] transition hover:opacity-90 disabled:opacity-60"
          >
            {activeAction === 'password'
              ? 'Please wait...'
              : tab === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>

          <p className="text-center text-xs text-[var(--tp-text)]/55">
            {tab === 'signin' ? (
              <>
                No account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-[var(--tp-accent)] underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="text-[var(--tp-accent)] underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-[10px] text-[var(--tp-text)]/42">
            Use your TuloPots account for checkout, reviews, Studio, and saved pieces.
            By continuing you agree to the current{' '}
            <Link href={LEGAL_ROUTES.terms} target="_blank" className="text-[var(--tp-accent)] underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href={LEGAL_ROUTES.privacy}
              target="_blank"
              className="text-[var(--tp-accent)] underline"
            >
              Privacy Policy
            </Link>
            . Your account also remembers your country, display language, and currency preference.
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}
