'use client';
import { useState } from 'react';
import { Sun, Moon, Bell, Shield, User, Palette, ChevronRight } from 'lucide-react';
import { useStore } from '@/components/Providers';
import Link from 'next/link';

export default function SettingsPage() {
  const { isLoggedIn, user, theme, setTheme, setShowAuthModal } = useStore();
  const [saved, setSaved] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const save = () => { setSaved('Settings saved!'); setTimeout(() => setSaved(''), 3000); };

  if (!isLoggedIn) return (
    <main className="container-shell py-24 text-center">
      <div className="serif-display text-5xl text-[#4b3428]">Settings</div>
      <p className="mt-4 text-[#76675c]">Please sign in to access your settings.</p>
      <button onClick={() => setShowAuthModal(true)} className="mt-6 btn-primary">Sign In</button>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#F7F2EA] pt-24 pb-16">
      <div className="container-shell max-w-3xl">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">Account</div>
          <h1 className="mt-2 serif-display text-5xl text-[#3d2a20]">Settings</h1>
          <p className="mt-2 text-sm text-[#9a8a80]">Manage your preferences, notifications, and account options.</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Appearance */}
          <section className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ede4]"><Palette className="h-4 w-4 text-[#B66A3C]" /></div>
              <div><div className="font-semibold text-[#3d2a20]">Appearance</div><div className="text-xs text-[#9a8a80]">Choose your preferred theme</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([['light', <Sun key="s" className="h-5 w-5 text-[#e6a44a]" />, 'bg-[#fff8f0]', 'Warm & bright'],
                ['dark', <Moon key="m" className="h-5 w-5 text-[#c98c5a]" />, 'bg-[#1e100a]', 'Rich & moody']] as const).map(([t, icon, bg, desc]) => (
                <button key={t} onClick={() => setTheme(t as any)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition ${theme === t ? 'border-[#B66A3C] bg-[#fdf5ee]' : 'border-[#e8dccf] bg-[#fafaf8] hover:border-[#d8c9bc]'}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} shadow`}>{icon}</div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#3d2a20]">{t === 'light' ? 'Light Mode' : 'Dark Mode'}</div>
                    <div className="text-xs text-[#9a8a80]">{desc}</div>
                  </div>
                  {theme === t && <div className="ml-auto h-2 w-2 rounded-full bg-[#B66A3C]" />}
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ede4]"><Bell className="h-4 w-4 text-[#B66A3C]" /></div>
              <div><div className="font-semibold text-[#3d2a20]">Notifications</div><div className="text-xs text-[#9a8a80]">Choose how we reach you</div></div>
            </div>
            {[
              { label: 'Email notifications', desc: 'Order updates, shipping, receipts', value: emailNotifs, set: setEmailNotifs },
              { label: 'SMS / WhatsApp notifications', desc: 'Delivery reminders via phone', value: smsNotifs, set: setSmsNotifs },
              { label: 'Newsletter', desc: 'New arrivals, tips & offers', value: newsletter, set: setNewsletter },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#f5ede4] last:border-0">
                <div><div className="text-sm font-medium text-[#3d2a20]">{item.label}</div><div className="text-xs text-[#9a8a80]">{item.desc}</div></div>
                <button onClick={() => item.set(!item.value)} className={`relative h-6 w-11 rounded-full transition-colors ${item.value ? 'bg-[#B66A3C]' : 'bg-[#e0d0c1]'}`}>
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </section>

          {/* Account info */}
          <section className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ede4]"><User className="h-4 w-4 text-[#B66A3C]" /></div>
              <div><div className="font-semibold text-[#3d2a20]">Account Info</div><div className="text-xs text-[#9a8a80]">Your profile details</div></div>
            </div>
            {([['Name', user?.name], ['Email', user?.email], ...(user?.phone ? [['Phone', user.phone]] : []), ] as [string, string | undefined][]).map(([label, val]) => (
           
              <div key={label} className="flex items-center justify-between rounded-2xl bg-[#fdf9f5] px-4 py-3 mb-2 last:mb-0">
                <div><div className="text-[10px] uppercase tracking-[0.12em] text-[#b0a09a]">{label}</div><div className="text-sm font-medium text-[#3d2a20]">{val || '—'}</div></div>
                <ChevronRight className="h-4 w-4 text-[#c0ada2]" />
              </div>
            ))}
          </section>

          {user?.isAdmin && (
            <section className="rounded-[1.5rem] border border-[#5A3422]/20 bg-[#5A3422]/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5A3422]"><Shield className="h-4 w-4 text-white" /></div>
                <div><div className="font-semibold text-[#3d2a20]">Admin Access</div><div className="text-xs text-[#9a8a80]">You have full admin privileges</div></div>
              </div>
              <Link href="/admin" className="btn-primary inline-flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Open Admin Dashboard
              </Link>
            </section>
          )}

          <div className="flex items-center gap-4">
            <button onClick={save} className="btn-primary">Save Settings</button>
            {saved && <span className="text-sm text-green-600 font-medium">{saved}</span>}
          </div>
        </div>
      </div>
    </main>
  );
}
