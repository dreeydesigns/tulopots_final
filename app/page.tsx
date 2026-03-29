'use client';

import LoggedInHome from '../components/home/LoggedInHome';
import LoggedOutHome from '../components/home/LoggedOutHome';
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

export default function Page() {
  const { isLoggedIn, isSectionVisible } = useStore();
  const loggedInVisible = isSectionVisible('home.logged_in');
  const loggedOutVisible = isSectionVisible('home.logged_out');

  if (isLoggedIn && loggedInVisible) {
    return <LoggedInHome />;
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
