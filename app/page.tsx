'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import LoggedInHome from '../components/home/LoggedInHome';
import LoggedOutHome from '../components/home/LoggedOutHome';
import { FindYourForm } from '../components/guide/FindYourForm';
import { useStore } from '../components/Providers';

function HomeUnavailable() {
  return (
    <main className="container-shell py-28 text-center">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-8 py-14">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
          TuloPots
        </div>
        <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)]">
          The homepage is resting for a moment
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--tp-text)]/72">
          This section has been hidden from the content controls. Turn it back on
          from admin to restore the storefront view.
        </p>
      </div>
    </main>
  );
}

function CompactHome({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <main className="container-shell flex min-h-screen items-center justify-center py-28 text-center">
      <div className="w-full max-w-sm rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 py-12">
        <div className="serif-display text-4xl tp-heading">
          Tulo<span className="tp-accent">Pots</span>
        </div>
        <p className="mx-auto mt-4 max-w-[18rem] text-sm leading-7 tp-text-soft">
          Quiet clay presence for homes, studios, and open spaces.
        </p>
        <Link href="/pots" className="btn-primary mt-6 inline-flex">
          {isLoggedIn ? 'Explore Forms' : 'Explore the Collection'}
        </Link>
      </div>
    </main>
  );
}

export default function Page() {
  const { isLoggedIn, isSectionVisible } = useStore();
  const [isTinyViewport, setIsTinyViewport] = useState(false);
  const loggedInVisible = isSectionVisible('home.logged_in');
  const loggedOutVisible = isSectionVisible('home.logged_out');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(max-width: 320px)');
    const sync = () => setIsTinyViewport(media.matches);

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
    };
  }, []);

  if (isTinyViewport) {
    if (!loggedInVisible && !loggedOutVisible) {
      return <HomeUnavailable />;
    }

    return (
      <>
        <CompactHome isLoggedIn={isLoggedIn} />
        {isLoggedIn && loggedInVisible ? <FindYourForm /> : null}
      </>
    );
  }

  if (isLoggedIn && loggedInVisible) {
    return (
      <>
        <LoggedInHome />
        <FindYourForm />
      </>
    );
  }

  if (!isLoggedIn && loggedOutVisible) {
    return <LoggedOutHome />;
  }

  if (loggedOutVisible) {
    return <LoggedOutHome />;
  }

  if (loggedInVisible) {
    return <LoggedInHome />;
  }

  return <HomeUnavailable />;
}
