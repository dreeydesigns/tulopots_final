'use client';

import { useEffect, useState } from 'react';
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

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, setUser } = useStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!showAuthModal) {
      setError('');
      setPassword('');
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const close = () => {
    setShowAuthModal(false);
    setError('');
    setPassword('');
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="border-b border-[#f0e6df] px-8 pb-6 pt-8">
          <button
            onClick={close}
            className="absolute right-5 top-5 rounded-full p-2 text-[#9a8a80] transition hover:bg-[#f7f0ea]"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="serif-display text-3xl text-[#3d2a20]">
            Tulo<span className="text-[#B66A3C]">Pots</span>
          </div>
          <p className="mt-1 text-sm text-[#9a8a80]">
            {tab === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
          <div className="mt-5 flex gap-1 rounded-full bg-[#f7f0ea] p-1">
            {(['signin', 'signup'] as const).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setTab(item);
                  setError('');
                }}
                className={`flex-1 rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                  tab === item
                    ? 'bg-[#5A3422] text-white shadow'
                    : 'text-[#9a8a80] hover:text-[#5A3422]'
                }`}
              >
                {item === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-6">
          {tab === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c0ada2]" />
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] py-3.5 pl-11 pr-5 text-sm text-[#3d2a20] outline-none transition focus:border-[#B66A3C]"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c0ada2]" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] py-3.5 pl-11 pr-5 text-sm text-[#3d2a20] outline-none transition focus:border-[#B66A3C]"
            />
          </div>
          {tab === 'signup' && (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c0ada2]" />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone e.g. +254700000000"
                className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] py-3.5 pl-11 pr-5 text-sm text-[#3d2a20] outline-none transition focus:border-[#B66A3C]"
              />
            </div>
          )}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c0ada2]" />
            <input
              required
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] py-3.5 pl-11 pr-12 text-sm text-[#3d2a20] outline-none transition focus:border-[#B66A3C]"
            />
            <button
              type="button"
              onClick={() => setShowPw((state) => !state)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c0ada2] transition hover:text-[#5A3422]"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-[#5A3422] py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
          <p className="text-center text-xs text-[#b0a09a]">
            {tab === 'signin' ? (
              <>
                No account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-[#B66A3C] underline"
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
                  className="text-[#B66A3C] underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <p className="text-center text-[10px] text-[#c8b8b0]">
            Use your TuloPots account for checkout, reviews, Studio, and saved pieces.
          </p>
        </form>
      </div>
    </div>
  );
}
