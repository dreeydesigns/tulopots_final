'use client';

import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from './Providers';
import { usePathname } from 'next/navigation';

export function Nav() {
  const {
    cart,
    isLoggedIn,
    setIsLoggedIn,
    user,
    setShowAuthModal,
    theme,
    setTheme,
  } = useStore();

  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();
  const isHome = pathname === '/';

  const count = cart.reduce((s, i) => s + i.quantity, 0);

  const links = [
    ['Home', '/'],
    ['Indoor', '/indoor'],
    ['Outdoor', '/outdoor'],
    ['Pots Only', '/pots'],
    ['About', '/about'],
    ['Contact', '/contact'],
  ] as const;

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
    setOpen(false);
  }, [pathname]);

  let headerClass = '';

  if (isLoggedOutHome) {
    headerClass = isScrolled
      ? 'border-b border-[#e8dccf] bg-[#F7F2EA]/95 backdrop-blur-md'
      : 'border-transparent bg-[#F7F2EA]/72 backdrop-blur-sm';
  } else if (isLoggedInHome) {
    headerClass = isScrolled
      ? 'border-transparent bg-[#222222]/40 backdrop-blur-md'
      : 'border-transparent bg-transparent';
  } else if (isInternalPage) {
    headerClass = 'border-b border-[#e8dccf] bg-[#F7F2EA]/95 backdrop-blur-md';
  }

  const isLightSurface = isLoggedOutHome || isInternalPage;

  const brandClass = isLightSurface ? 'text-[#5A3422]' : 'text-white';
  const accentClass = isLightSurface ? 'text-[#B66A3C]' : 'text-[#d8c0a8]';

  const navLinkClass = (href: string) => {
    if (isLightSurface) {
      return pathname === href
        ? 'text-[#5A3422]'
        : 'text-[#8b7b6e] hover:text-[#5A3422]';
    }

    return pathname === href
      ? 'text-white'
      : 'text-white/70 hover:text-white';
  };

  const iconButtonClass = isLightSurface
    ? 'border-[#dcc9b6] bg-white text-[#5A3422] hover:bg-[#f5ede4]'
    : 'border-white/20 bg-white/10 text-white hover:bg-white/20';

  const signInClass = isLightSurface
    ? 'bg-[#5A3422] text-white hover:opacity-90'
    : 'bg-white/15 text-white backdrop-blur-md hover:bg-white/25';

  const menuButtonClass = isLightSurface
    ? 'bg-[#5A3422] text-white hover:opacity-90'
    : 'border border-white/20 bg-white/10 text-white hover:bg-white/20';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${headerClass}`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className={`serif-display text-3xl tracking-tight transition ${brandClass}`}>
          Tulo<span className={accentClass}>Pots</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
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
            className={`cursor-hover rounded-full border p-2.5 transition ${iconButtonClass}`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            href="/search"
            className={`cursor-hover rounded-full border p-2.5 transition ${iconButtonClass}`}
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link
            href="/cart"
            className={`cursor-hover relative rounded-full border p-2.5 transition ${iconButtonClass}`}
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
              className={`cursor-hover hidden rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition md:inline-flex ${signInClass}`}
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen((s) => !s)}
                className={`cursor-hover rounded-full p-2.5 transition ${menuButtonClass}`}
              >
                <Menu className="h-4 w-4" />
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-3xl border border-[#eaded3] bg-white shadow-2xl">
                  <div className="border-b border-[#f0e6df] bg-[#fdf9f5] px-5 py-4">
                    <div className="text-sm font-semibold text-[#3d2a20]">
                      {user?.name || 'Account'}
                    </div>
                    <div className="truncate text-xs text-[#9a8a80]">{user?.email}</div>

                    {user?.isAdmin && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#5A3422] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        <Shield className="h-2.5 w-2.5" /> Admin
                      </span>
                    )}
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#5a4a3f] hover:bg-[#F7F2EA]"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#5a4a3f] hover:bg-[#F7F2EA]"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>

                  {user?.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 border-t border-[#f0e6df] px-5 py-3.5 text-sm font-semibold text-[#5A3422] hover:bg-[#F7F2EA]"
                    >
                      <Shield className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 border-t border-[#f0e6df] px-5 py-3.5 text-sm text-[#5a4a3f] hover:bg-[#F7F2EA]"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}