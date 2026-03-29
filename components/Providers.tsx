'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Product } from '@/lib/products';

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  image: string;
  mode: 'plant' | 'pot';
  unitPrice: number;
  quantity: number;
  sizeLabel?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  avatar?: string;
};

export type Theme = 'dark' | 'light';

export type SiteSectionVisibility = {
  key: string;
  label: string;
  route?: string;
  visible: boolean;
};

type Store = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  refreshSession: () => Promise<void>;
  siteSections: SiteSectionVisibility[];
  isSectionVisible: (key: string) => boolean;
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  cart: CartItem[];
  addToCart: (
    product: Product,
    cfg?: {
      mode?: 'plant' | 'pot';
      quantity?: number;
      unitPrice?: number;
      sizeLabel?: string;
    }
  ) => void;
  updateQty: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
};

type ThemeTransitionState = {
  active: boolean;
  nextTheme: Theme;
  phase: 'idle' | 'cover' | 'reveal';
  key: number;
};

const Ctx = createContext<Store | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function Providers({
  children,
  initialUser = null,
  initialSiteSections = [],
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialSiteSections?: SiteSectionVisibility[];
}) {
  const [isLoggedIn, setIsLoggedInRaw] = useState(Boolean(initialUser));
  const [user, setUserRaw] = useState<User | null>(initialUser);
  const [siteSections] = useState<SiteSectionVisibility[]>(initialSiteSections);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [theme, setThemeRaw] = useState<Theme>('dark');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [themeTransition, setThemeTransition] = useState<ThemeTransitionState>({
    active: false,
    nextTheme: 'light',
    phase: 'idle',
    key: 0,
  });

  const transitionTimers = useRef<number[]>([]);
  const isHydrated = useRef(false);

  const clearThemeTimers = () => {
    transitionTimers.current.forEach((id) => window.clearTimeout(id));
    transitionTimers.current = [];
  };

  async function refreshSession() {
    try {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
      });
      const data = (await response.json()) as {
        ok: boolean;
        user: User | null;
        isLoggedIn: boolean;
      };

      if (!response.ok || !data.ok) {
        setUserRaw(null);
        setIsLoggedInRaw(false);
        return;
      }

      setUserRaw(data.user);
      setIsLoggedInRaw(data.isLoggedIn);
    } catch {
      setUserRaw(null);
      setIsLoggedInRaw(false);
    }
  }

  useEffect(() => {
    setThemeRaw(read<Theme>('tp-theme', 'dark'));
    setWishlist(read('tp-wishlist', []));
    setCart(read('tp-cart', []));
    isHydrated.current = true;

    if (!initialUser) {
      void refreshSession();
    }

    return () => {
      if (typeof window !== 'undefined') {
        clearThemeTimers();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('tp-theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tp-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('tp-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('theme-dark', theme !== 'light');
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('theme-transitioning', themeTransition.active);
    root.classList.toggle(
      'theme-transition-light',
      themeTransition.active && themeTransition.nextTheme === 'light'
    );
    root.classList.toggle(
      'theme-transition-dark',
      themeTransition.active && themeTransition.nextTheme === 'dark'
    );

    return () => {
      root.classList.remove('theme-transitioning');
      root.classList.remove('theme-transition-light');
      root.classList.remove('theme-transition-dark');
    };
  }, [themeTransition]);

  const setIsLoggedIn = (value: boolean) => {
    if (value) {
      setShowAuthModal(true);
      return;
    }

    void fetch('/api/auth/logout', {
      method: 'POST',
    }).finally(() => {
      setUserRaw(null);
      setIsLoggedInRaw(false);
      setShowAuthModal(false);
    });
  };

  const setUser = (nextUser: User | null) => {
    setUserRaw(nextUser);
    setIsLoggedInRaw(!!nextUser);
  };

  const isSectionVisible = (key: string) =>
    siteSections.find((section) => section.key === key)?.visible ?? true;

  const setTheme = (nextTheme: Theme) => {
    if (nextTheme === theme) return;

    if (!isHydrated.current || typeof window === 'undefined') {
      setThemeRaw(nextTheme);
      return;
    }

    clearThemeTimers();

    setThemeTransition((prev) => ({
      active: true,
      nextTheme,
      phase: 'cover',
      key: prev.key + 1,
    }));

    transitionTimers.current.push(
      window.setTimeout(() => {
        setThemeRaw(nextTheme);
        setThemeTransition((prev) => ({
          ...prev,
          phase: 'reveal',
        }));
      }, 430)
    );

    transitionTimers.current.push(
      window.setTimeout(() => {
        setThemeTransition((prev) => ({
          ...prev,
          active: false,
          phase: 'idle',
        }));
      }, 1180)
    );
  };

  const toggleWishlist = (slug: string) =>
    setWishlist((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
    );

  const addToCart: Store['addToCart'] = (product, cfg = {}) => {
    const mode =
      cfg.mode || (product.forcePotOnly || product.decorative ? 'pot' : 'plant');
    const quantity = cfg.quantity || 1;
    const unitPrice =
      cfg.unitPrice ||
      (mode === 'plant' ? product.price : product.potOnly || product.price);
    const key = `${product.slug}-${mode}-${cfg.sizeLabel || 'default'}`;

    setCart((cur) => {
      const existing = cur.find((item) => item.key === key);
      if (existing) {
        return cur.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      return [
        ...cur,
        {
          key,
          slug: product.slug,
          name: product.name,
          image: product.image,
          mode,
          unitPrice,
          quantity,
          sizeLabel: cfg.sizeLabel,
        },
      ];
    });
  };

  const updateQty = (key: string, delta: number) =>
    setCart((cur) =>
      cur.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );

  const removeItem = (key: string) =>
    setCart((cur) => cur.filter((item) => item.key !== key));

  const value = useMemo(
    () => ({
      isLoggedIn,
      setIsLoggedIn,
      user,
      setUser,
      refreshSession,
      siteSections,
      isSectionVisible,
      showAuthModal,
      setShowAuthModal,
      theme,
      setTheme,
      wishlist,
      toggleWishlist,
      cart,
      addToCart,
      updateQty,
      removeItem,
    }),
    [isLoggedIn, user, showAuthModal, theme, wishlist, cart, siteSections]
  );

  return (
    <Ctx.Provider value={value}>
      {children}

      <div
        key={themeTransition.key}
        aria-hidden="true"
        className={`theme-wash-overlay ${
          themeTransition.active ? 'is-active' : ''
        } ${themeTransition.phase === 'reveal' ? 'is-reveal' : ''} ${
          themeTransition.nextTheme === 'light' ? 'to-light' : 'to-dark'
        }`}
      >
        <div className="theme-wash-core" />
        <div className="theme-wash-beam" />
        <div className="theme-wash-shine" />
      </div>

      <style jsx global>{`
        html.theme-transitioning,
        html.theme-transitioning body {
          overflow-x: hidden;
        }

        html[data-theme='light'] body,
        html[data-theme='dark'] body {
          background: var(--tp-bg);
          color: var(--tp-text);
        }

        body {
          transition:
            background-color 380ms ease,
            color 380ms ease;
        }

        .theme-wash-overlay {
          position: fixed;
          inset: -12%;
          pointer-events: none;
          z-index: 999999;
          opacity: 0;
          overflow: hidden;
          mix-blend-mode: screen;
        }

        .theme-wash-overlay.is-active {
          opacity: 1;
        }

        .theme-wash-core,
        .theme-wash-beam,
        .theme-wash-shine {
          position: absolute;
          inset: 0;
        }

        .theme-wash-overlay.to-light .theme-wash-core {
          background:
            radial-gradient(circle at 18% 52%, rgba(255, 245, 232, 0.32) 0%, rgba(255, 245, 232, 0.14) 22%, rgba(255, 245, 232, 0) 48%),
            linear-gradient(90deg, rgba(255, 242, 225, 0.00) 0%, rgba(255, 245, 235, 0.08) 24%, rgba(255, 250, 243, 0.20) 48%, rgba(255, 248, 239, 0.08) 76%, rgba(255, 248, 239, 0.00) 100%);
        }

        .theme-wash-overlay.to-dark .theme-wash-core {
          background:
            radial-gradient(circle at 18% 52%, rgba(255, 196, 144, 0.10) 0%, rgba(255, 196, 144, 0.06) 22%, rgba(255, 196, 144, 0) 48%),
            linear-gradient(90deg, rgba(36, 18, 10, 0.00) 0%, rgba(68, 36, 20, 0.08) 24%, rgba(125, 74, 44, 0.14) 48%, rgba(68, 36, 20, 0.08) 76%, rgba(36, 18, 10, 0.00) 100%);
        }

        .theme-wash-beam {
          width: 42%;
          left: -42%;
          top: -8%;
          bottom: -8%;
          transform: skewX(-18deg);
          filter: blur(18px);
        }

        .theme-wash-overlay.to-light .theme-wash-beam {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 252, 247, 0.20) 18%,
            rgba(255, 255, 255, 0.72) 48%,
            rgba(255, 247, 236, 0.18) 82%,
            rgba(255, 255, 255, 0) 100%
          );
          box-shadow:
            0 0 60px rgba(255, 255, 255, 0.26),
            0 0 120px rgba(255, 246, 232, 0.16);
        }

        .theme-wash-overlay.to-dark .theme-wash-beam {
          background: linear-gradient(
            90deg,
            rgba(255, 210, 170, 0) 0%,
            rgba(214, 149, 98, 0.08) 18%,
            rgba(255, 204, 156, 0.22) 48%,
            rgba(180, 120, 72, 0.08) 82%,
            rgba(255, 210, 170, 0) 100%
          );
          box-shadow:
            0 0 50px rgba(208, 130, 77, 0.18),
            0 0 110px rgba(125, 74, 44, 0.10);
        }

        .theme-wash-shine {
          background:
            radial-gradient(circle at 82% 24%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 22%),
            radial-gradient(circle at 68% 78%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0) 24%);
          opacity: 0.55;
        }

        .theme-wash-overlay.is-active .theme-wash-beam {
          animation: tulopots-theme-sweep 980ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        .theme-wash-overlay.is-active .theme-wash-core {
          animation: tulopots-theme-fade 980ms ease forwards;
        }

        .theme-wash-overlay.is-active .theme-wash-shine {
          animation: tulopots-theme-shine 980ms ease forwards;
        }

        .theme-wash-overlay.is-reveal {
          mix-blend-mode: soft-light;
        }

        @keyframes tulopots-theme-sweep {
          0% {
            left: -42%;
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          50% {
            left: 36%;
            opacity: 1;
          }
          100% {
            left: 112%;
            opacity: 0;
          }
        }

        @keyframes tulopots-theme-fade {
          0% {
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          64% {
            opacity: 0.86;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes tulopots-theme-shine {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          24% {
            opacity: 0.72;
          }
          100% {
            opacity: 0;
            transform: scale(1.02);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .theme-wash-overlay,
          .theme-wash-core,
          .theme-wash-beam,
          .theme-wash-shine {
            animation: none !important;
            transition: none !important;
          }

          body {
            transition: none !important;
          }
        }
      `}</style>
    </Ctx.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Store missing');
  return ctx;
};
