'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { faqItems } from '@/lib/products';
import { useStore } from '@/components/Providers';

export default function Page() {
  const router = useRouter();
  const { isSectionVisible } = useStore();
  const [open, setOpen] = useState(0);
  const visible = isSectionVisible('faq.entry');

  useEffect(() => {
    if (!visible) {
      router.replace('/');
    }
  }, [router, visible]);

  if (!visible) {
    return null;
  }

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
          Help Centre
        </div>
        <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--tp-text)]/72">
          Everything you need to know about TuloPots, our clay forms, and how
          they live in interior spaces and open spaces.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {faqItems.map(([question, answer], index) => (
          <div
            key={question}
            className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6"
          >
            <button
              onClick={() => setOpen(open === index ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 text-left"
              type="button"
            >
              <span className="serif-display text-3xl text-[var(--tp-heading)] md:text-4xl">
                {question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-[var(--tp-text)]/60 transition ${
                  open === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {open === index ? (
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--tp-text)]/75">
                {answer}
                {question.includes('care') ? (
                  <>
                    {' '}
                    See our{' '}
                    <Link
                      href="/care-guide"
                      className="text-[var(--tp-accent)] underline"
                    >
                      Care Guide
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}
