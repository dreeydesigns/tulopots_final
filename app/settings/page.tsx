'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Leaf,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Moon,
  Palette,
  Shield,
  Sun,
  Truck,
  User,
} from 'lucide-react';
import { useStore } from '@/components/Providers';
import {
  countryOptions,
  currencyOptions,
  getCountryLabel,
  getCurrencyLabel,
  getLanguageLabel,
  languageOptions,
} from '@/lib/customer-preferences';
import { LEGAL_ROUTES } from '@/lib/policies';

type ToggleItem = {
  label: string;
  description: string;
  value: boolean;
  setValue: (value: boolean) => void;
};

function inputStyle() {
  return {
    borderColor: 'var(--tp-border)',
    background: 'var(--tp-card)',
    color: 'var(--tp-heading)',
  };
}

function BinaryToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--tp-border)] py-4 last:border-0 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-sm font-medium tp-heading">{label}</div>
        <div className="text-xs leading-6 tp-text-muted">{description}</div>
      </div>

      <div className="flex min-w-[180px] items-center gap-3">
        {[
          { label: 'Off', nextValue: false },
          { label: 'On', nextValue: true },
        ].map((option) => {
          const active = value === option.nextValue;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.nextValue)}
              aria-pressed={active}
              className="min-h-[44px] flex-1 rounded-full border px-4 py-3 text-sm font-semibold transition"
              style={{
                borderColor: active ? 'var(--tp-accent)' : 'var(--tp-border)',
                background: active ? 'var(--tp-accent)' : 'var(--tp-surface)',
                color: active ? 'var(--tp-btn-primary-text)' : 'var(--tp-heading)',
                boxShadow: active
                  ? '0 12px 24px color-mix(in srgb, var(--tp-accent) 22%, transparent 78%)'
                  : 'none',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { isLoggedIn, user, theme, setTheme, setShowAuthModal, setUser } = useStore();
  const [saved, setSaved] = useState('');
  const [saveTone, setSaveTone] = useState<'idle' | 'error' | 'success'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [whatsappNotifs, setWhatsappNotifs] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [preferredContactChannel, setPreferredContactChannel] = useState('email');
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [defaultShippingAddress, setDefaultShippingAddress] = useState('');
  const [defaultShippingCity, setDefaultShippingCity] = useState('');
  const [defaultShippingCountry, setDefaultShippingCountry] = useState('KE');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [preferredCurrency, setPreferredCurrency] = useState('KES');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordTone, setPasswordTone] = useState<'idle' | 'error' | 'success'>('idle');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    setProfileName(user?.name || '');
    setProfilePhone(user?.phone || '');
    setDefaultShippingAddress(user?.defaultShippingAddress || '');
    setDefaultShippingCity(user?.defaultShippingCity || '');
    setDefaultShippingCountry(user?.defaultShippingCountry || 'KE');
    setPreferredLanguage(user?.preferredLanguage || 'en');
    setPreferredCurrency(user?.preferredCurrency || 'KES');
    setEmailNotifs(Boolean(user?.emailNotifications ?? true));
    setSmsNotifs(Boolean(user?.smsNotifications));
    setWhatsappNotifs(Boolean(user?.whatsappNotifications));
    setNewsletter(Boolean(user?.marketingConsent));
    setPreferredContactChannel(user?.preferredContactChannel || 'email');
  }, [
    user?.defaultShippingAddress,
    user?.defaultShippingCity,
    user?.defaultShippingCountry,
    user?.emailNotifications,
    user?.marketingConsent,
    user?.name,
    user?.phone,
    user?.preferredCurrency,
    user?.preferredLanguage,
    user?.smsNotifications,
    user?.whatsappNotifications,
    user?.preferredContactChannel,
  ]);

  const toggles: ToggleItem[] = [
    {
      label: 'Email notifications',
      description: 'Order updates, receipts, and support replies',
      value: emailNotifs,
      setValue: setEmailNotifs,
    },
    {
      label: 'SMS updates',
      description: 'Delivery reminders and last-mile coordination',
      value: smsNotifs,
      setValue: setSmsNotifs,
    },
    {
      label: 'WhatsApp updates',
      description: 'Order tracking and quick delivery communication',
      value: whatsappNotifs,
      setValue: setWhatsappNotifs,
    },
    {
      label: 'Brand email updates',
      description: 'Launch notes, care guidance, and curated product updates',
      value: newsletter,
      setValue: setNewsletter,
    },
  ];
  const enabledChannels = toggles
    .filter((item) => item.value)
    .map((item) =>
      item.label === 'Brand email updates' ? 'Brand updates' : item.label
    );

  async function save() {
    setIsSaving(true);
    setSaved('');
    setSaveTone('idle');

    try {
      const profileResponse = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          defaultShippingAddress,
          defaultShippingCity,
          defaultShippingCountry,
          preferredLanguage,
          preferredCurrency,
        }),
      });
      const profileData = (await profileResponse.json()) as {
        ok: boolean;
        error?: string;
        user?: typeof user;
      };

      if (!profileResponse.ok || !profileData.ok || !profileData.user) {
        throw new Error(profileData.error || 'Unable to save your profile.');
      }

      setUser(profileData.user);

      const preferencesResponse = await fetch('/api/account/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketingConsent: newsletter,
          emailNotifications: emailNotifs,
          smsNotifications: smsNotifs,
          whatsappNotifications: whatsappNotifs,
          preferredContactChannel,
          preferredLanguage,
          preferredCurrency,
        }),
      });
      const preferencesData = (await preferencesResponse.json()) as {
        ok: boolean;
        error?: string;
        user?: typeof user;
      };

      if (!preferencesResponse.ok || !preferencesData.ok || !preferencesData.user) {
        throw new Error(preferencesData.error || 'Unable to save settings.');
      }

      setUser(preferencesData.user);
      setSaveTone('success');
      setSaved('Profile and preferences saved successfully.');
    } catch (error: any) {
      setSaveTone('error');
      setSaved(error?.message || 'Unable to save settings.');
    } finally {
      setIsSaving(false);
      window.setTimeout(() => {
        setSaved('');
        setSaveTone('idle');
      }, 3200);
    }
  }

  async function updatePassword() {
    if (!newPassword.trim()) {
      setPasswordTone('error');
      setPasswordMessage('Enter a new password before saving.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordTone('error');
      setPasswordMessage('The new password confirmation does not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordTone('idle');
    setPasswordMessage('');

    try {
      const response = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Unable to update password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordTone('success');
      setPasswordMessage(data.message || 'Password updated successfully.');
    } catch (error: any) {
      setPasswordTone('error');
      setPasswordMessage(error?.message || 'Unable to update password.');
    } finally {
      setIsUpdatingPassword(false);
      window.setTimeout(() => {
        setPasswordMessage('');
        setPasswordTone('idle');
      }, 3600);
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="container-shell py-24 text-center">
        <div className="mx-auto max-w-2xl rounded-[2rem] border tp-card p-10">
          <div className="serif-display text-5xl tp-heading">Settings</div>
          <p className="mt-4 text-sm leading-7 tp-text-soft">
            Please sign in to manage your profile, preferences, and account security.
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
            Manage your appearance, profile details, communication preferences, and
            account security.
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
                <User className="h-4 w-4 tp-accent" />
              </div>
              <div>
                <div className="font-semibold tp-heading">Profile</div>
                <div className="text-xs tp-text-muted">Keep your delivery and account details current</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Full name</span>
                <input
                  type="text"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Phone</span>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  placeholder="+254700000000"
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Default delivery address</span>
                <input
                  type="text"
                  value={defaultShippingAddress}
                  onChange={(event) => setDefaultShippingAddress(event.target.value)}
                  placeholder="Building, estate, or street"
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Default city</span>
                <input
                  type="text"
                  value={defaultShippingCity}
                  onChange={(event) => setDefaultShippingCity(event.target.value)}
                  placeholder="Nairobi"
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Country</span>
                <select
                  value={defaultShippingCountry}
                  onChange={(event) => setDefaultShippingCountry(event.target.value)}
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                >
                  {countryOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Language</span>
                <select
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                >
                  {languageOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Currency</span>
                <select
                  value={preferredCurrency}
                  onChange={(event) => setPreferredCurrency(event.target.value)}
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} · {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                <MapPin className="h-3.5 w-3.5 tp-accent" />
                Saved delivery defaults
              </div>
              <div className="mt-2 text-sm tp-text-soft">
                Checkout will prefill this address and city so repeat orders move faster.
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                <MapPin className="h-3.5 w-3.5 tp-accent" />
                Regional defaults
              </div>
              <div className="mt-2 text-sm leading-7 tp-text-soft">
                Your storefront can now remember {getCountryLabel(defaultShippingCountry)},
                show prices in {getCurrencyLabel(preferredCurrency)}, and prepare support and
                help flows around {getLanguageLabel(preferredLanguage)}.
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] tp-text-muted">Email</div>
              <div className="mt-1 text-sm font-medium tp-heading">{user?.email}</div>
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
              <BinaryToggle
                key={item.label}
                label={item.label}
                description={item.description}
                value={item.value}
                onChange={item.setValue}
              />
            ))}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Preferred contact channel</span>
                <select
                  value={preferredContactChannel}
                  onChange={(event) => setPreferredContactChannel(event.target.value)}
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                >
                  <option value="email">Email first</option>
                  <option value="sms">SMS first</option>
                  <option value="whatsapp">WhatsApp first</option>
                </select>
              </label>

              <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                  <MessageCircle className="h-3.5 w-3.5 tp-accent" />
                  Delivery communication
                </div>
                <div className="mt-2 text-sm leading-7 tp-text-soft">
                  Standard paid orders are planned around a 2-day window. Custom orders follow
                  a 21-day studio timeline. We will queue updates using the channels you enable.
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                Active channels
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {enabledChannels.length ? (
                  enabledChannels.map((channel) => (
                    <span
                      key={channel}
                      className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] tp-heading"
                    >
                      {channel}
                    </span>
                  ))
                ) : (
                  <span className="text-sm tp-text-soft">
                    No notification channels are active right now.
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border tp-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <LockKeyhole className="h-4 w-4 tp-accent" />
              </div>
              <div>
                <div className="font-semibold tp-heading">Password security</div>
                <div className="text-xs tp-text-muted">
                  Update your password or set one alongside social sign-in
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="tp-heading">Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                  style={inputStyle()}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="tp-heading">New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                    style={inputStyle()}
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="tp-heading">Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                    style={inputStyle()}
                  />
                </label>
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 tp-text-muted">
              If this account was created with email and password, enter your current
              password before saving a new one. If you only use Google or Apple, you can
              leave it blank and create a password here.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={updatePassword}
                disabled={isUpdatingPassword}
                className="btn-secondary disabled:opacity-60"
              >
                {isUpdatingPassword ? 'Saving...' : 'Update Password'}
              </button>
              {passwordMessage ? (
                <span
                  className={`text-sm ${
                    passwordTone === 'error' ? 'tp-accent' : 'tp-heading'
                  }`}
                >
                  {passwordMessage}
                </span>
              ) : null}
            </div>
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

            <div className="mb-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] tp-text-muted">
                Policy version
              </div>
              <div className="mt-1 text-sm font-medium tp-heading">
                {user?.acceptedPolicyVersion || 'Pending'}
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

          <section className="rounded-[1.5rem] border tp-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <Truck className="h-4 w-4 tp-accent" />
              </div>
              <div>
                <div className="font-semibold tp-heading">Support and orders</div>
                <div className="text-xs tp-text-muted">
                  Quick links for tracking, care guidance, and direct help
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Link
                href="/delivery"
                className="rounded-[1.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-4 transition hover:border-[var(--tp-border-strong)]"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                  <Truck className="h-3.5 w-3.5 tp-accent" />
                  Track order
                </div>
                <div className="mt-3 text-sm font-semibold tp-heading">Follow delivery progress</div>
                <div className="mt-2 text-sm leading-6 tp-text-soft">
                  Check dispatch timing, delivery windows, and queued updates.
                </div>
              </Link>

              <Link
                href="/help"
                className="rounded-[1.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-4 transition hover:border-[var(--tp-border-strong)]"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                  <Leaf className="h-3.5 w-3.5 tp-accent" />
                  Help search
                </div>
                <div className="mt-3 text-sm font-semibold tp-heading">Search help in plain language</div>
                <div className="mt-2 text-sm leading-6 tp-text-soft">
                  Search the site, delivery guidance, account help, or care answers in one place.
                </div>
              </Link>

              <Link
                href="/contact"
                className="rounded-[1.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-4 transition hover:border-[var(--tp-border-strong)]"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                  <MessageCircle className="h-3.5 w-3.5 tp-accent" />
                  Contact us
                </div>
                <div className="mt-3 text-sm font-semibold tp-heading">Reach the TuloPots team</div>
                <div className="mt-2 text-sm leading-6 tp-text-soft">
                  Use the contact page when you need sourcing help, delivery support, or a direct reply.
                </div>
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
            <button type="button" onClick={save} disabled={isSaving} className="btn-primary disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved ? (
              <span className={`text-sm ${saveTone === 'error' ? 'tp-accent' : 'tp-heading'}`}>
                {saved}
              </span>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border tp-card px-5 py-4">
            {[
              ['Account email', user?.email],
              ['Phone on file', user?.phone || 'Not added'],
              ['Country default', getCountryLabel(user?.defaultShippingCountry || defaultShippingCountry)],
              ['Language', getLanguageLabel(user?.preferredLanguage || preferredLanguage)],
              ['Currency', getCurrencyLabel(user?.preferredCurrency || preferredCurrency)],
              ['Policy acceptance', user?.hasAcceptedPolicies ? 'Accepted' : 'Pending'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-[var(--tp-border)] py-3 last:border-0"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] tp-text-muted">
                    {label}
                  </div>
                  <div className="mt-1 text-sm font-medium tp-heading">{value}</div>
                </div>
                <ChevronRight className="h-4 w-4 tp-text-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
