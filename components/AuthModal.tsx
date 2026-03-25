'use client';
import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useStore } from './Providers';

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

  if (!showAuthModal) return null;

  const close = () => { setShowAuthModal(false); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    await new Promise((r) => setTimeout(r, 700));
    const isAdmin = email.toLowerCase().includes('admin') || email === 'andrew@tulopots.com';
    setUser({
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email, phone: phone || undefined, isAdmin,
    });
    setLoading(false);
    close();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="relative w-full max-w-md mx-4 rounded-[2rem] bg-white shadow-2xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-[#f0e6df]">
          <button onClick={close} className="absolute top-5 right-5 rounded-full p-2 text-[#9a8a80] hover:bg-[#f7f0ea] transition">
            <X className="h-4 w-4" />
          </button>
          <div className="serif-display text-3xl text-[#3d2a20]">Tulo<span className="text-[#B66A3C]">Pots</span></div>
          <p className="mt-1 text-sm text-[#9a8a80]">{tab === 'signin' ? 'Welcome back' : 'Create your account'}</p>
          <div className="mt-5 flex gap-1 rounded-full bg-[#f7f0ea] p-1">
            {(['signin', 'signup'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${tab === t ? 'bg-[#5A3422] text-white shadow' : 'text-[#9a8a80] hover:text-[#5A3422]'}`}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
          {tab === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c0ada2]" />
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] pl-11 pr-5 py-3.5 text-sm text-[#3d2a20] outline-none focus:border-[#B66A3C] transition" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c0ada2]" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
              className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] pl-11 pr-5 py-3.5 text-sm text-[#3d2a20] outline-none focus:border-[#B66A3C] transition" />
          </div>
          {tab === 'signup' && (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c0ada2]" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone e.g. +254700000000"
                className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] pl-11 pr-5 py-3.5 text-sm text-[#3d2a20] outline-none focus:border-[#B66A3C] transition" />
            </div>
          )}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c0ada2]" />
            <input required type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full rounded-full border border-[#e8dccf] bg-[#fdf9f6] pl-11 pr-12 py-3.5 text-sm text-[#3d2a20] outline-none focus:border-[#B66A3C] transition" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c0ada2] hover:text-[#5A3422] transition">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading}
            className="mt-1 w-full rounded-full bg-[#5A3422] py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60">
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
          <p className="text-center text-xs text-[#b0a09a]">
            {tab === 'signin' ? (<>No account?{' '}<button type="button" onClick={() => setTab('signup')} className="text-[#B66A3C] underline">Sign up</button></>) :
              (<>Have an account?{' '}<button type="button" onClick={() => setTab('signin')} className="text-[#B66A3C] underline">Sign in</button></>)}
          </p>
          <p className="text-center text-[10px] text-[#c8b8b0]">Admin tip: use admin@tulopots.com or andrew@tulopots.com for admin access</p>
        </form>
      </div>
    </div>
  );
}
