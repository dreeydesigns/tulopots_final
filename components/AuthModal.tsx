'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
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
    avatar?: string;
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
  const { showAuthModal, setShowAuthModal, setUser } = useStore();
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
    }
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
            : { name, email, phone, password }
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
      const response = await fetch('/api/auth/oauth/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          returnTo,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.url) {
        setError(data.error || 'We could not start that sign-in flow.');
        setActiveAction(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('We could not start that sign-in flow.');
      setActiveAction(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] shadow-2xl">
        <div className="border-b border-[var(--tp-border)] bg-[var(--tp-surface)] px-8 pb-6 pt-8">
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-6">
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
              credentials are added.
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

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tp-text)]/35" />
            <input
              required
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
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
          </p>
        </form>
      </div>
    </div>
  );
}
