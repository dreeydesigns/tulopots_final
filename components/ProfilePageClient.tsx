'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Heart, Settings2, ShoppingBag, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/components/Providers';

const tabs = [
  { key: 'wishlist', label: 'Saved Pieces', Icon: Heart },
  { key: 'cart', label: 'Cart Snapshot', Icon: ShoppingBag },
  { key: 'settings', label: 'Account Notes', Icon: Settings2 },
] as const;

export function ProfilePageClient({ products }: { products: Product[] }) {
  const { isLoggedIn, wishlist, cart, setShowAuthModal, user } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('wishlist');

  const wishedProducts = useMemo(
    () => products.filter((product) => wishlist.includes(product.slug)),
    [products, wishlist]
  );

  if (!isLoggedIn) {
    return (
      <main className="container-shell py-20 text-center md:py-28">
        <div className="mx-auto max-w-2xl rounded-[2rem] border tp-card p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Account
          </div>
          <h1 className="mt-4 serif-display text-5xl tp-heading">Please sign in</h1>
          <p className="mt-4 text-sm leading-7 tp-text-soft">
            Sign in to see your saved pieces, cart continuity, Studio access, and
            account settings.
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
    <main className="container-shell py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Account
          </div>
          <h1 className="mt-4 serif-display text-5xl tp-heading md:text-6xl">
            Your Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 tp-text-soft">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Your account keeps
            saved forms, checkout continuity, and Studio access in one place.
          </p>
        </div>
        <Link href="/studio" className="btn-primary">
          Open Studio
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              tab === key
                ? 'bg-[var(--tp-accent)] text-[var(--tp-btn-primary-text)]'
                : 'border border-[var(--tp-border)] bg-[var(--tp-card)] text-[var(--tp-text-soft)] hover:border-[var(--tp-border-strong)]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'wishlist' ? (
        <section className="mt-8">
          {wishedProducts.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {wishedProducts.map((product) => (
                <ProductCard key={product.slug} product={product} collection />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border tp-card p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <Heart className="h-5 w-5 tp-accent" />
              </div>
              <div className="mt-4 serif-display text-4xl tp-heading">No saved pieces yet</div>
              <p className="mt-3 max-w-xl text-sm leading-7 tp-text-soft">
                When a form feels right, save it and it will stay here for later
                comparison.
              </p>
            </div>
          )}
        </section>
      ) : null}

      {tab === 'cart' ? (
        <section className="mt-8 rounded-[2rem] border tp-card p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
            <ShoppingBag className="h-5 w-5 tp-accent" />
          </div>
          <div className="mt-4 serif-display text-4xl tp-heading">Cart Snapshot</div>
          <p className="mt-3 max-w-2xl text-sm leading-7 tp-text-soft">
            {cart.length
              ? `${cart.length} cart line item${cart.length === 1 ? '' : 's'} are still available in this browser session.`
              : 'Your active cart is currently empty.'}
          </p>
          <Link href="/cart" className="btn-secondary mt-6 inline-flex">
            Review Cart
          </Link>
        </section>
      ) : null}

      {tab === 'settings' ? (
        <section className="mt-8 rounded-[2rem] border tp-card p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
            <Sparkles className="h-5 w-5 tp-accent" />
          </div>
          <div className="mt-4 serif-display text-4xl tp-heading">Account Notes</div>
          <p className="mt-3 max-w-2xl text-sm leading-7 tp-text-soft">
            Your legal consent, display preferences, and communication settings can
            be managed from the settings page.
          </p>
          <Link href="/settings" className="btn-secondary mt-6 inline-flex">
            Open Settings
          </Link>
        </section>
      ) : null}
    </main>
  );
}
