'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
} from 'lucide-react';
import { useStore } from '@/components/Providers';
import { LEGAL_ROUTES } from '@/lib/policies';

type ToggleItem = {
  label: string;
  description: string;
  value: boolean;
  setValue: (value: boolean) => void;
};

export default function SettingsPage() {
  const { isLoggedIn, user, theme, setTheme, setShowAuthModal } = useStore();
  const [saved, setSaved] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  useEffect(() => {
    setNewsletter(Boolean(user?.marketingConsent));
  }, [user?.marketingConsent]);

  const toggles: ToggleItem[] = [
    {
      label: 'Email notifications',
      description: 'Order updates, receipts, and support replies',
      value: emailNotifs,
      setValue: setEmailNotifs,
    },
    {
      label: 'SMS / WhatsApp updates',
      description: 'Delivery reminders and last-mile coordination',
      value: smsNotifs,
      setValue: setSmsNotifs,
    },
    {
      label: 'Brand email updates',
      description: 'Launch notes, care guidance, and curated product updates',
      value: newsletter,
      setValue: setNewsletter,
    },
  ];

  function save() {
    setSaved('Preferences saved in this browser session.');
    window.setTimeout(() => setSaved(''), 3200);
  }

  if (!isLoggedIn) {
    return (
      <main className="container-shell py-24 text-center">
        <div className="mx-auto max-w-2xl rounded-[2rem] border tp-card p-10">
          <div className="serif-display text-5xl tp-heading">Settings</div>
          <p className="mt-4 text-sm leading-7 tp-text-soft">
            Please sign in to manage your preferences and account options.
          </p>
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="btn-primary mt-6"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="tp-page pb-16 pt-24">
      <div className="container-shell max-w-4xl">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Account
          </div>
          <h1 className="mt-2 serif-display text-5xl tp-heading">Settings</h1>
          <p className="mt-2 text-sm leading-7 tp-text-soft">
            Manage your appearance, communication preferences, and legal account
            status.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-[1.5rem] border tp-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <Palette className="h-4 w-4 tp-accent" />
              </div>
              <div>
                <div className="font-semibold tp-heading">Appearance</div>
                <div className="text-xs tp-text-muted">Choose your preferred theme</div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  key: 'light' as const,
                  label: 'Light Mode',
                  description: 'Warm and bright',
                  Icon: Sun,
                  circleBg: 'var(--tp-bg-soft)',
                },
                {
                  key: 'dark' as const,
                  label: 'Dark Mode',
                  description: 'Rich and moody',
                  Icon: Moon,
                  circleBg: 'color-mix(in srgb, var(--tp-heading) 84%, var(--tp-bg) 16%)',
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTheme(item.key)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    theme === item.key
                      ? 'border-[var(--tp-accent)] bg-[var(--tp-accent-soft)]'
                      : 'border-[var(--tp-border)] bg-[var(--tp-surface)] hover:border-[var(--tp-border-strong)]'
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: item.circleBg }}
                  >
                    <item.Icon
                      className="h-5 w-5"
                      style={{
                        color:
                          item.key === 'light'
                            ? 'var(--tp-accent-strong)'
                            : 'var(--tp-accent)',
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold tp-heading">{item.label}</div>
                    <div className="text-xs tp-text-muted">{item.description}</div>
                  </div>
                  {theme === item.key ? (
                    <div className="ml-auto h-2.5 w-2.5 rounded-full bg-[var(--tp-accent)]" />
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border tp-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <Bell className="h-4 w-4 tp-accent" />
              </div>
              <div>
                <div className="font-semibold tp-heading">Notifications</div>
                <div className="text-xs tp-text-muted">Choose how we reach you</div>
              </div>
            </div>

            {toggles.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 border-b border-[var(--tp-border)] py-3 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium tp-heading">{item.label}</div>
                  <div className="text-xs leading-6 tp-text-muted">
                    {item.description}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => item.setValue(!item.value)}
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{
                    background: item.value
                      ? 'var(--tp-accent)'
                      : 'color-mix(in srgb, var(--tp-border-strong) 78%, var(--tp-bg) 22%)',
                  }}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      item.value ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </section>

          <section className="rounded-[1.5rem] border tp-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <User className="h-4 w-4 tp-accent" />
              </div>
              <div>
                <div className="font-semibold tp-heading">Account Info</div>
                <div className="text-xs tp-text-muted">Your profile details</div>
              </div>
            </div>

            {[
              ['Name', user?.name],
              ['Email', user?.email],
              ['Phone', user?.phone || 'Not added'],
              ['Policy version', user?.acceptedPolicyVersion || 'Pending'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="mb-2 flex items-center justify-between rounded-2xl bg-[var(--tp-surface)] px-4 py-3 last:mb-0"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] tp-text-muted">
                    {label}
                  </div>
                  <div className="text-sm font-medium tp-heading">{value || '—'}</div>
                </div>
                <ChevronRight className="h-4 w-4 tp-text-muted" />
              </div>
            ))}
          </section>

          <section className="rounded-[1.5rem] border tp-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <Shield className="h-4 w-4 tp-accent" />
              </div>
              <div>
                <div className="font-semibold tp-heading">Legal and trust</div>
                <div className="text-xs tp-text-muted">
                  Review the live policy documents attached to your account
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href={LEGAL_ROUTES.terms} className="btn-secondary text-center">
                Terms of Use
              </Link>
              <Link href={LEGAL_ROUTES.privacy} className="btn-secondary text-center">
                Privacy Policy
              </Link>
              <Link href={LEGAL_ROUTES.cookies} className="btn-secondary text-center">
                Cookie Policy
              </Link>
              <Link href={LEGAL_ROUTES.delivery} className="btn-secondary text-center">
                Delivery & Returns
              </Link>
            </div>
          </section>

          {user?.isAdmin ? (
            <section className="rounded-[1.5rem] border border-[var(--tp-border-strong)] bg-[var(--tp-accent-soft)] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-accent-strong)]">
                  <Shield className="h-4 w-4 text-[var(--tp-btn-primary-text)]" />
                </div>
                <div>
                  <div className="font-semibold tp-heading">Admin access</div>
                  <div className="text-xs tp-text-muted">
                    This account has internal control-layer privileges
                  </div>
                </div>
              </div>
              <Link href="/admin" className="btn-primary inline-flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Open Admin Dashboard
              </Link>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={save} className="btn-primary">
              Save Settings
            </button>
            {saved ? <span className="text-sm tp-accent">{saved}</span> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
