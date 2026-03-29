'use client';

import Link from 'next/link';
import { useStore } from './Providers';

export function Footer() {
  const { isSectionVisible } = useStore();

  return (
    <footer
      className="border-t"
      style={{
        background: 'color-mix(in srgb, var(--tp-heading) 96%, black 4%)',
        borderColor: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.92)',
      }}
    >
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr]">
        <div>
          <div className="serif-display text-3xl">
            Tulo<span style={{ color: 'var(--tp-accent)' }}>Pots</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Handcrafted in Nairobi, Kenya
          </p>
          <p className="mt-1 text-xs text-white/30">EST. 2016</p>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Shop
          </div>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
            {isSectionVisible('collections.indoor') ? (
              <Link href="/indoor" className="transition hover:text-white">
                For Interior Spaces
              </Link>
            ) : null}
            {isSectionVisible('collections.outdoor') ? (
              <Link href="/outdoor" className="transition hover:text-white">
                For Open Spaces
              </Link>
            ) : null}
            {isSectionVisible('collections.pots') ? (
              <Link href="/pots" className="transition hover:text-white">
                Clay Forms
              </Link>
            ) : null}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Help
          </div>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
            {isSectionVisible('faq.entry') ? (
              <Link href="/faq" className="transition hover:text-white">
                FAQ
              </Link>
            ) : null}
            <Link href="/care-guide" className="transition hover:text-white">
              Care Guide
            </Link>
            {isSectionVisible('contact.entry') ? (
              <Link href="/contact" className="transition hover:text-white">
                Contact Us
              </Link>
            ) : null}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Join the TuloPots Community
          </div>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Get care tips, new arrivals and exclusive offers.
          </p>
          <form action="/api/newsletter" method="post" className="mt-5 flex gap-2">
            <input
              name="email"
              type="email"
              placeholder="Your email"
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
            />
            <button
              className="rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:opacity-90"
              style={{ background: 'var(--tp-accent)' }}
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/8 py-5 text-center text-xs text-white/30">
        © 2026 TuloPots. All rights reserved.
      </div>
    </footer>
  );
}
