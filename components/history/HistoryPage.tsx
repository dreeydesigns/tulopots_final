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
    <main className="tp-page overflow-x-hidden pb-28 pt-28 lg:pt-32">
      <section className="container-shell lg:flex lg:min-h-[calc(100svh-7rem)] lg:items-center">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 xl:grid-cols-[0.92fr_1.08fr] xl:items-end xl:gap-20">
            <div className="max-w-2xl xl:max-w-[34rem]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] tp-accent">
                {content.eyebrow}
              </div>
              <h1 className="mt-5 serif-display text-5xl leading-[0.92] tp-heading md:text-6xl xl:text-7xl">
                {content.title}
              </h1>
              <p className="mt-8 max-w-xl text-base leading-9 tp-text-soft md:text-lg">
                {content.intro}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={content.primaryCta.href} className="btn-primary">
                  {content.primaryCta.label}
                </Link>
                <Link href={content.secondaryCta.href} className="btn-secondary">
                  {content.secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.4rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
              <div className="relative aspect-[4/4.9] overflow-hidden sm:aspect-[5/4.8] xl:aspect-[4/4.7] xl:min-h-[42rem]">
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
                  <div className="max-w-xl rounded-[1.65rem] border border-white/18 bg-[rgba(20,12,8,0.52)] px-6 py-6 backdrop-blur-md">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(247,242,234,0.72)]">
                      The Line
                    </div>
                    <div className="mt-4 serif-display text-2xl leading-[1.14] text-[var(--tp-cream)] md:text-[2.35rem]">
                      {content.quote}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center md:mt-24 xl:mt-28">
            <div className="max-w-4xl text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] tp-accent">
                The Story of Tulo
              </div>
              <p className="mx-auto mt-5 max-w-3xl serif-display text-3xl leading-[1.22] tp-heading md:text-4xl lg:text-[3.25rem]">
                A room does not change when more things enter it. It changes when the right
                presence arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-20 space-y-24 md:mt-28 md:space-y-32 xl:space-y-40">
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
              className="grid gap-10 lg:min-h-[92svh] lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-16"
            >
              <div className={`lg:col-span-5 ${reverse ? 'lg:order-2' : ''}`}>
                <div className="lg:sticky lg:top-28">
                  <div
                    className={`overflow-hidden rounded-[2.2rem] border bg-[var(--tp-card)] transition duration-700 ease-out ${
                      revealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ borderColor: 'var(--tp-border)' }}
                  >
                    <div className="relative aspect-[5/5.5] overflow-hidden md:aspect-[5/4.4] lg:aspect-[4/4.9]">
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

                  <div className="relative rounded-[2.2rem] border bg-[var(--tp-card)] px-7 py-8 md:px-9 md:py-10 xl:px-12 xl:py-12">
                    <div
                      className="inline-flex rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        background: 'var(--tp-accent-soft)',
                        color: 'var(--tp-accent)',
                      }}
                    >
                      {chapter.label}
                    </div>

                    <h2 className="mt-6 max-w-3xl serif-display text-4xl leading-[1.08] tp-heading md:text-5xl xl:text-[3.65rem]">
                      {chapter.title}
                    </h2>

                    <p className="mt-8 max-w-3xl text-base leading-9 tp-text-soft md:text-lg">
                      {chapter.body}
                    </p>

                    <div
                      className="mt-9 max-w-3xl border-l-2 pl-6 text-lg leading-9 tp-heading md:text-xl"
                      style={{ borderColor: 'var(--tp-accent)' }}
                    >
                      {chapter.highlight}
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3">
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

      <section className="container-shell mt-24 md:mt-32 lg:flex lg:min-h-[92svh] lg:items-center">
        <div className="w-full rounded-[2.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-7 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
              {content.galleryEyebrow}
            </div>
            <h2 className="mt-5 serif-display text-4xl leading-[1.08] tp-heading md:text-5xl xl:text-[3.4rem]">
              {content.galleryTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-9 tp-text-soft">
              {content.galleryIntro}
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
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
                <div className="px-6 py-6">
                  <h3 className="serif-display text-[2rem] leading-[1.1] tp-heading">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-8 tp-text-soft">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-24 md:mt-32 lg:flex lg:min-h-[92svh] lg:items-center">
        <div className="w-full rounded-[2.6rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-7 py-12 text-center md:px-12 md:py-16 xl:px-14 xl:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            {content.closingEyebrow}
          </div>
          <h2 className="mx-auto mt-5 max-w-4xl serif-display text-4xl leading-[1.08] tp-heading md:text-5xl xl:text-[3.7rem]">
            {content.closingTitle}
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 tp-text-soft md:text-lg">
            {content.closingBody}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
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
