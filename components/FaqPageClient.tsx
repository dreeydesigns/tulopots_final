'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useStore } from '@/components/Providers';

type FaqItem = {
  question: string;
  answer: string;
  linkText?: string;
  linkHref?: string;
};

export function FaqPageClient({
  eyebrow,
  title,
  intro,
  items,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  items: FaqItem[];
}) {
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
          {eyebrow}
        </div>
        <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--tp-text)]/72">
          {intro}
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.question}
            className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6"
          >
            <button
              onClick={() => setOpen(open === index ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 text-left"
              type="button"
            >
              <span className="serif-display text-3xl text-[var(--tp-heading)] md:text-4xl">
                {item.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-[var(--tp-text)]/60 transition ${
                  open === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {open === index ? (
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--tp-text)]/75">
                {item.answer}
                {item.linkText && item.linkHref ? (
                  <>
                    {' '}
                    <Link href={item.linkHref} className="text-[var(--tp-accent)] underline">
                      {item.linkText}
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
