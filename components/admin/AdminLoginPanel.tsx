'use client';

import { useState } from 'react';

export function AdminLoginPanel() {
  const [mode, setMode] = useState<'signin' | 'activate'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          mode === 'signin'
            ? {
                email,
                password,
                scope: 'admin',
              }
            : {
                name: name || 'Admin',
                email,
                password,
              }
        ),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to continue.');
        return;
      }

      if (mode === 'activate') {
        const adminLogin = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            scope: 'admin',
          }),
        });

        const adminLoginData = (await adminLogin.json()) as { ok: boolean; error?: string };

        if (!adminLogin.ok || !adminLoginData.ok) {
          setError(adminLoginData.error || 'Admin access was created, but sign-in still failed.');
          return;
        }
      }

      window.location.reload();
    } catch {
      setError('Unable to continue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen px-6 py-16"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--tp-bg) 82%, black 18%) 0%, color-mix(in srgb, var(--tp-bg) 88%, black 12%) 100%)',
        color: 'var(--tp-text)',
      }}
    >
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="flex flex-col justify-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: 'var(--tp-accent)' }}
            >
              TuloPots Admin
            </p>
            <h1
              className="mt-5 max-w-2xl text-5xl leading-[0.95] md:text-7xl"
              style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
            >
              Business control, held with restraint.
            </h1>
            <p
              className="mt-6 max-w-xl text-sm leading-8 md:text-base"
              style={{ color: 'color-mix(in srgb, var(--tp-text) 86%, transparent 14%)' }}
            >
              This entrance is separate from the customer storefront. Sign in with an admin
              account to manage products, orders, Studio briefs, contact messages, and
              newsletter growth from one calm control layer.
            </p>
          </section>

          <section>
            <div
              className="rounded-[2rem] border p-8 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
              style={{
                background: 'color-mix(in srgb, var(--tp-surface) 92%, black 8%)',
                borderColor: 'color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
              }}
            >
              <div className="mb-8">
                <div className="mb-4 flex rounded-full p-1" style={{ background: 'var(--tp-card)' }}>
                  {(['signin', 'activate'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setMode(item);
                        setError('');
                      }}
                      className="flex-1 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        background: mode === item ? 'var(--tp-accent)' : 'transparent',
                        color: mode === item ? '#ffffff' : 'var(--tp-heading)',
                      }}
                    >
                      {item === 'signin' ? 'Sign In' : 'Activate'}
                    </button>
                  ))}
                </div>
                <div
                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
                >
                  {mode === 'signin' ? 'Admin Sign In' : 'First-Time Admin Access'}
                </div>
                <h2
                  className="mt-3 text-3xl"
                  style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
                >
                  {mode === 'signin' ? 'Access the control layer' : 'Claim your admin account'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'activate' ? (
                  <label className="block">
                    <span
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
                    >
                      Name
                    </span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      required
                      className="w-full rounded-[1.25rem] border px-5 py-4 text-sm outline-none transition"
                      style={{
                        borderColor: 'var(--tp-border)',
                        background: 'var(--tp-card)',
                        color: 'var(--tp-heading)',
                      }}
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span
                    className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
                  >
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    className="w-full rounded-[1.25rem] border px-5 py-4 text-sm outline-none transition"
                    style={{
                      borderColor: 'var(--tp-border)',
                      background: 'var(--tp-card)',
                      color: 'var(--tp-heading)',
                    }}
                  />
                </label>

                <label className="block">
                  <span
                    className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
                  >
                    Password
                  </span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    required
                    className="w-full rounded-[1.25rem] border px-5 py-4 text-sm outline-none transition"
                    style={{
                      borderColor: 'var(--tp-border)',
                      background: 'var(--tp-card)',
                      color: 'var(--tp-heading)',
                    }}
                  />
                </label>

                {error ? (
                  <div
                    className="rounded-[1.25rem] border px-4 py-3 text-sm"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--tp-accent) 45%, transparent 55%)',
                      background: 'color-mix(in srgb, var(--tp-accent) 12%, transparent 88%)',
                      color: 'var(--tp-text)',
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.24em] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: 'var(--tp-accent)',
                    color: '#ffffff',
                    boxShadow: '0 16px 34px rgba(0,0,0,0.16)',
                  }}
                >
                  {loading
                    ? 'Please wait…'
                    : mode === 'signin'
                    ? 'Enter Admin'
                    : 'Activate and Enter'}
                </button>

                <p
                  className="text-xs leading-6"
                  style={{ color: 'color-mix(in srgb, var(--tp-text) 68%, transparent 32%)' }}
                >
                  Activation only works for admin emails that already exist in the system or
                  are approved for admin access.
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
