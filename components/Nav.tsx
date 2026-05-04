'use client';

import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sun,
  Moon,
  User,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from './Providers';

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: 'Admin',
  content: 'Content',
  newsletter: 'Newsletter Workspace',
  profile: 'Profile',
  settings: 'Settings',
  search: 'Search',
  about: 'About',
  contact: 'Contact Us',
  indoor: 'For Interior Spaces',
  outdoor: 'For Open Spaces',
  pots: 'Clay Forms',
  faq: 'Help',
  'care-guide': 'Care Guide',
  delivery: 'Track an Order',
  'delivery-returns': 'Delivery & Returns',
  'privacy-policy': 'Privacy Policy',
  'cookie-policy': 'Cookie Policy',
  terms: 'Terms',
  launch: 'Launch',
  new: 'Our History',
  limited: 'Limited',
  studio: 'Studio',
  learn: 'Learn with Clay',
  inbox: 'Inbox',
  journal: 'Journal',
  cart: 'Cart',
  progress: 'Progress',
};

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function labelForSegment(
  segment: string,
  segments: string[],
  index: number,
  pathname: string
) {
  if (segments[0] === 'product') {
    return index === 0 ? 'Clay Forms' : 'Product';
  }

  if (segments[0] === 'journal') {
    return index === 0 ? 'Journal' : 'Article';
  }

  if (segments[0] === 'admin' && segment === 'studio') {
    return 'Studio';
  }

  if (segments[0] === 'studio' && segment === 'inbox') {
    return 'Inbox';
  }

  if (pathname === '/order-confirmation') {
    return index === 0 ? 'Cart' : 'Order Confirmation';
  }

  return BREADCRUMB_LABELS[segment] || titleCase(segment.replace(/-/g, ' '));
}

function buildBreadcrumbs(pathname: string): Array<[string, string]> {
  if (pathname === '/') {
    return [];
  }

  const segments = pathname.split('/').filter(Boolean);
  const items: Array<[string, string]> = [['Home', '/']];
  let path = '';

  segments.forEach((segment, index) => {
    path += `/${segment}`;
    items.push([labelForSegment(segment, segments, index, pathname), path]);
  });

  return items;
}

export function Nav() {
  const {
    cart,
    isLoggedIn,
    setIsLoggedIn,
    user,
    isSectionVisible,
    setShowAuthModal,
    theme,
    setTheme,
  } = useStore();

  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTinyViewport, setIsTinyViewport] = useState(false);

  const count = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const breadcrumbItems = useMemo(() => buildBreadcrumbs(pathname), [pathname]);

  const links = [
    { label: 'Home', href: '/', visible: true },
    {
      label: 'Indoor',
      href: '/indoor',
      visible: isSectionVisible('collections.indoor'),
    },
    {
      label: 'Outdoor',
      href: '/outdoor',
      visible: isSectionVisible('collections.outdoor'),
    },
    {
      label: 'Pots Only',
      href: '/pots',
      visible: isSectionVisible('collections.pots'),
    },
    { label: 'Learn', href: '/learn', visible: true },
    { label: 'About', href: '/about', visible: true },
    {
      label: 'Contact',
      href: '/contact',
      visible: isSectionVisible('contact.entry'),
    },
  ] as const;

  const isHome = pathname === '/';
  const isLoggedOutHome = isHome && !isLoggedIn;
  const isLoggedInHome = isHome && isLoggedIn;
  const isInternalPage = !isHome;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 320px)');
    const sync = () => setIsTinyViewport(media.matches);

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  let headerClass = '';
  if (isLoggedOutHome) {
    headerClass = isScrolled
      ? 'border-b tp-nav-surface backdrop-blur-md'
      : 'border-transparent tp-nav-surface backdrop-blur-sm';
  } else if (isLoggedInHome) {
    headerClass = isScrolled
      ? 'border-transparent tp-nav-surface backdrop-blur-md'
      : 'border-transparent bg-transparent';
  } else if (isInternalPage) {
    headerClass = 'border-b tp-nav-surface backdrop-blur-md';
  }

  const resolvedHeaderClass = menuOpen
    ? 'border-transparent tp-nav-surface shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl'
    : headerClass;

  const isLightSurface = isLoggedOutHome || isInternalPage;

  const brandClass = isLightSurface ? 'tp-heading' : 'text-white';
  const accentClass = 'tp-accent';

  const navLinkClass = (href: string) => {
    if (isLightSurface) {
      return pathname === href ? 'tp-heading' : 'tp-text-muted hover:tp-heading';
    }
    return pathname === href ? 'text-white' : 'text-white/70 hover:text-white';
  };

  const ghostButtonClass = isLightSurface
    ? 'tp-border tp-surface tp-text hover:opacity-90'
    : 'border-white/20 bg-white/10 text-white hover:bg-white/20';

  const mobilePanelClass = isLightSurface
    ? 'tp-card tp-border backdrop-blur-2xl'
    : 'border-white/12 bg-[rgba(20,12,8,0.78)] text-white backdrop-blur-2xl';

  const mobileBackdropClass = isLightSurface
    ? 'bg-[rgba(247,242,234,0.24)] backdrop-blur-xl'
    : 'bg-[rgba(10,6,4,0.28)] backdrop-blur-xl';
  const navIconButtonClass =
    'cursor-hover inline-flex h-12 w-12 items-center justify-center rounded-full transition';
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300 ${resolvedHeaderClass}`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className={`cursor-hover inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border p-2.5 transition lg:hidden ${ghostButtonClass}`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="min-w-0">
              <Link
                href="/"
                className={`serif-display text-[1.9rem] tracking-tight transition sm:text-3xl ${brandClass}`}
              >
                Tulo<span className={accentClass}>Pots</span>
              </Link>

              {isInternalPage ? (
                <nav
                  aria-label="Breadcrumb"
                  className={`mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
                    isLightSurface ? 'tp-text-muted' : 'text-white/68'
                  }`}
                >
                  {breadcrumbItems.map(([label, href], index) => {
                    const isLast = index === breadcrumbItems.length - 1;

                    return (
                      <span key={href} className="flex min-w-0 items-center gap-2">
                        {isLast ? (
                          <span
                            className={`truncate ${
                              isLightSurface ? 'tp-heading' : 'text-white'
                            }`}
                          >
                            {label}
                          </span>
                        ) : (
                          <Link
                            href={href}
                            className={`truncate transition ${
                              isLightSurface ? 'hover:tp-heading' : 'hover:text-white'
                            }`}
                          >
                            {label}
                          </Link>
                        )}
                        {!isLast ? <span>/</span> : null}
                      </span>
                    );
                  })}
                </nav>
              ) : null}
            </div>
          </div>

          <nav className="hidden items-center gap-4 lg:flex xl:gap-7">
            {links.filter((link) => link.visible).map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-[10px] font-medium uppercase tracking-[0.14em] transition xl:text-[11px] xl:tracking-[0.18em] ${navLinkClass(
                  href
                )}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!isTinyViewport ? (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className={`${navIconButtonClass} border ${ghostButtonClass}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            ) : null}

            <Link
              href="/search"
              className={`${navIconButtonClass} hidden border sm:inline-flex ${ghostButtonClass}`}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            {!isLoggedIn ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`tp-btn-primary cursor-hover ${
                  isTinyViewport ? 'inline-flex' : 'hidden md:inline-flex'
                } min-h-[44px] rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition`}
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                {isTinyViewport ? (
                  <Link
                    href="/cart"
                    className={`${navIconButtonClass} relative border ${ghostButtonClass}`}
                    aria-label="Cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c97d4e] text-[9px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/cart"
                      className={`${navIconButtonClass} relative border ${ghostButtonClass}`}
                      aria-label="Cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {count > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c97d4e] text-[9px] font-bold text-white">
                          {count}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={() => setAccountOpen((s) => !s)}
                      className={navIconButtonClass}
                      style={{
                        background: 'var(--tp-accent-strong)',
                        color: 'var(--tp-btn-primary-text)',
                        boxShadow: 'var(--tp-shadow-soft)',
                      }}
                      aria-label="Account menu"
                    >
                      <User className="h-4 w-4" />
                    </button>
                  </>
                )}

                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border tp-border tp-card shadow-2xl">
                    <div className="border-b tp-border tp-surface px-5 py-4">
                      <div className="text-sm font-semibold tp-text">
                        {user?.name || 'Account'}
                      </div>
                      <div className="truncate text-xs tp-text-muted">{user?.email}</div>

                      {user?.isAdmin && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#5A3422] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          <Shield className="h-2.5 w-2.5" />
                          Admin
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex min-h-[44px] items-center gap-3 px-5 py-3.5 text-sm tp-text hover:opacity-90"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setAccountOpen(false)}
                      className="flex min-h-[44px] items-center gap-3 px-5 py-3.5 text-sm tp-text hover:opacity-90"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="flex min-h-[44px] items-center gap-3 border-t tp-border px-5 py-3.5 text-sm font-semibold tp-accent hover:opacity-90"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setAccountOpen(false);
                      }}
                      className="flex min-h-[44px] w-full items-center gap-3 border-t tp-border px-5 py-3.5 text-sm tp-text hover:opacity-90"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className={`absolute inset-0 ${mobileBackdropClass}`}
          />

          <div className="absolute inset-x-4 top-[84px]">
            <div className={`overflow-hidden rounded-[2rem] border shadow-2xl ${mobilePanelClass}`}>
              <div className="px-5 pb-3 pt-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-text-muted">
                  Explore
                </div>
              </div>

              <nav className="flex flex-col pb-3">
                {links.filter((link) => link.visible).map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`min-h-[44px] px-5 py-3 text-sm uppercase tracking-[0.16em] transition ${navLinkClass(
                      href
                    )}`}
                  >
                    {label}
                  </Link>
                ))}

                <Link
                  href="/search"
                  className={`min-h-[44px] px-5 py-3 text-sm uppercase tracking-[0.16em] transition ${navLinkClass(
                    '/search'
                  )}`}
                >
                  Search
                </Link>

                {!isLoggedIn ? (
                  <div className="px-5 pb-3 pt-2">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowAuthModal(true);
                      }}
                      className="tp-btn-primary inline-flex min-h-[44px] w-full justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    >
                      Sign In
                    </button>
                  </div>
                ) : null}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
