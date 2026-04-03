'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { HistoryPageContent } from '@/lib/cms';
import { imageByKey } from '@/lib/site';

type HistoryPageProps = {
  content: HistoryPageContent;
};

function resolveImage(src: string) {
  const normalized = src.trim();
  if (!normalized) {
    return imageByKey.workshop;
  }

  return imageByKey[normalized as keyof typeof imageByKey] || normalized;
}

export function HistoryPage({ content }: HistoryPageProps) {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [hasMounted, setHasMounted] = useState(false);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  const chapters = useMemo(
    () =>
      content.chapters.map((chapter) => ({
        ...chapter,
        imageSrc: resolveImage(chapter.image.src),
      })),
    [content.chapters]
  );

  const galleryImages = useMemo(
    () =>
      content.galleryImages.map((item) => ({
        ...item,
        imageSrc: resolveImage(item.image.src),
      })),
    [content.galleryImages]
  );

  useEffect(() => {
    setHasMounted(true);

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleKeys((current) => {
          const next = { ...current };
          let changed = false;

          entries.forEach((entry) => {
            const key = entry.target.getAttribute('data-history-key');
            if (!key) return;

            if (entry.isIntersecting && !next[key]) {
              next[key] = true;
              changed = true;
            }
          });

          return changed ? next : current;
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -12% 0px',
      }
    );

    chapterRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="tp-page overflow-x-hidden pb-20 pt-24 md:pb-24 lg:pt-28">
      <section className="container-shell">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr] xl:items-end xl:gap-14">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] tp-accent">
                {content.eyebrow}
              </div>
              <h1 className="mt-5 serif-display text-5xl leading-[0.92] tp-heading md:text-6xl xl:text-7xl">
                {content.title}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 tp-text-soft md:text-lg">
                {content.intro}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={content.primaryCta.href} className="btn-primary">
                  {content.primaryCta.label}
                </Link>
                <Link href={content.secondaryCta.href} className="btn-secondary">
                  {content.secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.4rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
              <div className="relative aspect-[4/4.9] overflow-hidden sm:aspect-[5/4.8] xl:aspect-[4/4.7]">
                <Image
                  src={resolveImage(content.leadImage.src)}
                  alt={content.leadImage.alt}
                  fill
                  priority
                  sizes="(max-width: 1279px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,12,8,0.56)] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="max-w-xl rounded-[1.65rem] border border-white/18 bg-[rgba(20,12,8,0.52)] px-5 py-5 backdrop-blur-md">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(247,242,234,0.72)]">
                      The Line
                    </div>
                    <div className="mt-3 serif-display text-2xl leading-[1.08] text-[var(--tp-cream)] md:text-[2.35rem]">
                      {content.quote}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex justify-center md:mt-20">
            <div className="max-w-4xl text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] tp-accent">
                The Story of Tulo
              </div>
              <p className="mx-auto mt-4 max-w-3xl serif-display text-3xl leading-[1.18] tp-heading md:text-4xl lg:text-[3.25rem]">
                A room does not change when more things enter it. It changes when the right
                presence arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-16 space-y-20 md:mt-24 md:space-y-28 xl:space-y-36">
        {chapters.map((chapter, index) => {
          const revealed = !hasMounted || index === 0 || Boolean(visibleKeys[chapter.label]);
          const reverse = index % 2 === 1;

          return (
            <article
              key={chapter.label}
              ref={(node) => {
                chapterRefs.current[index] = node;
              }}
              data-history-key={chapter.label}
              className="grid gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14"
            >
              <div className={`lg:col-span-5 ${reverse ? 'lg:order-2' : ''}`}>
                <div className="lg:sticky lg:top-28">
                  <div
                    className={`overflow-hidden rounded-[2.2rem] border bg-[var(--tp-card)] transition duration-700 ease-out ${
                      revealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ borderColor: 'var(--tp-border)' }}
                  >
                    <div className="relative aspect-[5/5.4] overflow-hidden md:aspect-[5/4.3] lg:aspect-[4/4.8]">
                      <Image
                        src={chapter.imageSrc}
                        alt={chapter.image.alt}
                        fill
                        sizes="(max-width: 1023px) 100vw, 40vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,12,8,0.16)] via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-7 ${reverse ? 'lg:order-1' : ''}`}>
                <div
                  className={`relative transition duration-700 ease-out ${
                    revealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  }`}
                >
                  <div className="pointer-events-none absolute -left-2 top-0 select-none serif-display text-[5rem] leading-none text-[var(--tp-accent)]/10 md:text-[7rem] xl:text-[8.5rem]">
                    0{index + 1}
                  </div>

                  <div className="relative rounded-[2.2rem] border bg-[var(--tp-card)] px-6 py-7 md:px-8 md:py-8 xl:px-10 xl:py-10">
                    <div
                      className="inline-flex rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        background: 'var(--tp-accent-soft)',
                        color: 'var(--tp-accent)',
                      }}
                    >
                      {chapter.label}
                    </div>

                    <h2 className="mt-5 max-w-3xl serif-display text-4xl leading-[1.02] tp-heading md:text-5xl xl:text-[3.65rem]">
                      {chapter.title}
                    </h2>

                    <p className="mt-6 max-w-3xl text-base leading-8 tp-text-soft md:text-lg">
                      {chapter.body}
                    </p>

                    <div
                      className="mt-7 max-w-3xl border-l-2 pl-5 text-lg leading-8 tp-heading md:text-xl"
                      style={{ borderColor: 'var(--tp-accent)' }}
                    >
                      {chapter.highlight}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {chapter.facts.map((fact) => (
                        <span
                          key={fact}
                          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          style={{
                            borderColor: 'var(--tp-border)',
                            background: 'var(--tp-surface)',
                            color: 'var(--tp-text)',
                          }}
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="container-shell mt-20 md:mt-28">
        <div className="rounded-[2.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-6 py-8 md:px-8 md:py-10 xl:px-10">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
              {content.galleryEyebrow}
            </div>
            <h2 className="mt-4 serif-display text-4xl leading-[1.04] tp-heading md:text-5xl">
              {content.galleryTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 tp-text-soft">
              {content.galleryIntro}
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {galleryImages.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-[1.85rem] border border-[var(--tp-border)] bg-[var(--tp-surface)]"
              >
                <div className="relative aspect-[4/4.4]">
                  <Image
                    src={item.imageSrc}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-5 py-5">
                  <h3 className="serif-display text-[2rem] leading-[1.05] tp-heading">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 tp-text-soft">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-20 md:mt-28">
        <div className="rounded-[2.6rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-6 py-10 text-center md:px-10 md:py-14">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            {content.closingEyebrow}
          </div>
          <h2 className="mx-auto mt-4 max-w-4xl serif-display text-4xl leading-[1.02] tp-heading md:text-5xl xl:text-[3.7rem]">
            {content.closingTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 tp-text-soft md:text-lg">
            {content.closingBody}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={content.primaryCta.href} className="btn-primary">
              {content.primaryCta.label}
            </Link>
            <Link href={content.secondaryCta.href} className="btn-secondary">
              {content.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
