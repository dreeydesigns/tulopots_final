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
import { useStore } from './Providers';
import { usePathname } from 'next/navigation';

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

  const count = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

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

  const isLightSurface = isLoggedOutHome || isInternalPage;

  const brandClass = isLightSurface ? 'tp-heading' : 'text-white';
  const accentClass = 'tp-accent';

  const navLinkClass = (href: string) => {
    if (isLightSurface) {
      return pathname === href
        ? 'tp-heading'
        : 'tp-text-muted hover:tp-heading';
    }
    return pathname === href
      ? 'text-white'
      : 'text-white/70 hover:text-white';
  };

  const ghostButtonClass = isLightSurface
    ? 'tp-border tp-surface tp-text hover:opacity-90'
    : 'border-white/20 bg-white/10 text-white hover:bg-white/20';

  const mobilePanelClass = isLightSurface
    ? 'tp-card tp-border'
    : 'border-white/10 bg-[#120b07]/92 text-white';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${headerClass}`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className={`cursor-hover inline-flex rounded-full border p-2.5 transition lg:hidden ${ghostButtonClass}`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <Link
              href="/"
              className={`serif-display text-3xl tracking-tight transition ${brandClass}`}
            >
              Tulo<span className={accentClass}>Pots</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            {links.filter((link) => link.visible).map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-[11px] font-medium uppercase tracking-[0.18em] transition ${navLinkClass(
                  href
                )}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className={`cursor-hover rounded-full border p-2.5 transition ${ghostButtonClass}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link
              href="/search"
              className={`cursor-hover hidden rounded-full border p-2.5 transition sm:inline-flex ${ghostButtonClass}`}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/cart"
              className={`cursor-hover relative rounded-full border p-2.5 transition ${ghostButtonClass}`}
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c97d4e] text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            {!isLoggedIn ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="tp-btn-primary cursor-hover hidden rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition md:inline-flex"
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((s) => !s)}
                  className="tp-btn-primary cursor-hover inline-flex rounded-full p-2.5 transition"
                  aria-label="Account menu"
                >
                  <User className="h-4 w-4" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border tp-border tp-card shadow-2xl">
                    <div className="border-b tp-border tp-surface px-5 py-4">
                      <div className="text-sm font-semibold tp-text">
                        {user?.name || 'Account'}
                      </div>
                      <div className="truncate text-xs tp-text-muted">
                        {user?.email}
                      </div>

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
                      className="flex items-center gap-3 px-5 py-3.5 text-sm tp-text hover:opacity-90"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-sm tp-text hover:opacity-90"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 border-t tp-border px-5 py-3.5 text-sm font-semibold tp-accent hover:opacity-90"
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
                      className="flex w-full items-center gap-3 border-t tp-border px-5 py-3.5 text-sm tp-text hover:opacity-90"
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
        <div className="fixed inset-x-4 top-[84px] z-40 lg:hidden">
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
                  className={`px-5 py-3 text-sm uppercase tracking-[0.16em] transition ${navLinkClass(
                    href
                  )}`}
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/search"
                className={`px-5 py-3 text-sm uppercase tracking-[0.16em] transition ${navLinkClass(
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
                    className="tp-btn-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  >
                    Sign In
                  </button>
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
