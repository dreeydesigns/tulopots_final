'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';

export type CartItem = {
  key: string; slug: string; name: string; image: string;
  mode: 'plant' | 'pot'; unitPrice: number; quantity: number; sizeLabel?: string;
};

export type User = {
  id: string; name: string; email: string; phone?: string; isAdmin?: boolean; avatar?: string;
};

export type Theme = 'dark' | 'light';

type Store = {
  isLoggedIn: boolean; setIsLoggedIn: (v: boolean) => void;
  user: User | null; setUser: (u: User | null) => void;
  showAuthModal: boolean; setShowAuthModal: (v: boolean) => void;
  theme: Theme; setTheme: (t: Theme) => void;
  wishlist: string[]; toggleWishlist: (slug: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, cfg?: { mode?: 'plant' | 'pot'; quantity?: number; unitPrice?: number; sizeLabel?: string }) => void;
  updateQty: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
};

const Ctx = createContext<Store | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; }
  catch { return fallback; }
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedInRaw] = useState(false);
  const [user, setUserRaw] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [theme, setThemeRaw] = useState<Theme>('dark');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setIsLoggedInRaw(read('tp-auth', false));
    setUserRaw(read<User | null>('tp-user', null));
    setThemeRaw(read<Theme>('tp-theme', 'dark'));
    setWishlist(read('tp-wishlist', []));
    setCart(read('tp-cart', []));
  }, []);

  useEffect(() => { localStorage.setItem('tp-auth', JSON.stringify(isLoggedIn)); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem('tp-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('tp-theme', JSON.stringify(theme)); }, [theme]);
  useEffect(() => { localStorage.setItem('tp-wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('tp-cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('theme-dark', theme !== 'light');
  }, [theme]);

  const setIsLoggedIn = (v: boolean) => {
    setIsLoggedInRaw(v);
    if (!v) { setUserRaw(null); localStorage.removeItem('tp-user'); }
  };
  const setUser = (u: User | null) => { setUserRaw(u); setIsLoggedInRaw(!!u); };
  const setTheme = (t: Theme) => setThemeRaw(t);
  const toggleWishlist = (slug: string) =>
    setWishlist((cur) => cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);

  const addToCart: Store['addToCart'] = (product, cfg = {}) => {
    const mode = cfg.mode || (product.forcePotOnly || product.decorative ? 'pot' : 'plant');
    const quantity = cfg.quantity || 1;
    const unitPrice = cfg.unitPrice || (mode === 'plant' ? product.price : (product.potOnly || product.price));
    const key = `${product.slug}-${mode}-${cfg.sizeLabel || 'default'}`;
    setCart((cur) => {
      const existing = cur.find((i) => i.key === key);
      if (existing) return cur.map((i) => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      return [...cur, { key, slug: product.slug, name: product.name, image: product.image, mode, unitPrice, quantity, sizeLabel: cfg.sizeLabel }];
    });
  };
  const updateQty = (key: string, delta: number) =>
    setCart((cur) => cur.map((i) => i.key === key ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeItem = (key: string) => setCart((cur) => cur.filter((i) => i.key !== key));

  const value = useMemo(() => ({
    isLoggedIn, setIsLoggedIn, user, setUser, showAuthModal, setShowAuthModal,
    theme, setTheme, wishlist, toggleWishlist, cart, addToCart, updateQty, removeItem,
  }), [isLoggedIn, user, showAuthModal, theme, wishlist, cart]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Store missing');
  return ctx;
};
