import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEditorialArticleBySlug, getEditorialArticles } from '@/lib/editorial-articles';
import { getCatalogProducts } from '@/lib/catalog';

export async function generateStaticParams() {
  const products = await getCatalogProducts({ visibleOnly: true });
  const articles = await getEditorialArticles(products);

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const products = await getCatalogProducts({ visibleOnly: true });
  const articles = await getEditorialArticles(products);
  const article = getEditorialArticleBySlug(articles, slug);

  if (!article) {
    return {
      title: 'Journal | TuloPots',
    };
  }

  return {
    title: `${article.title} | TuloPots`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [{ url: article.heroImage }],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getCatalogProducts({ visibleOnly: true });
  const articles = await getEditorialArticles(products);
  const article = getEditorialArticleBySlug(articles, slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
            {article.eyebrow}
          </div>
          <h1 className="mt-4 serif-display text-5xl leading-[1.04] text-[var(--tp-heading)] md:text-6xl">
            {article.title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[var(--tp-text)]/74">
            {article.intro}
          </p>
        </div>

        <div className="relative mt-10 h-[22rem] overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] md:h-[30rem]">
          <Image src={article.heroImage} alt={article.heroAlt} fill className="object-cover" />
        </div>

        <div className="mt-10 space-y-8">
          {article.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8"
            >
              <h2 className="serif-display text-4xl leading-tight text-[var(--tp-heading)]">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-[var(--tp-text)]/76">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-accent)]">
            Continue
          </div>
          <p className="mt-4 text-base leading-8 text-[var(--tp-text)]/76">{article.cta.text}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={article.cta.href} className="btn-primary">
              {article.cta.label}
            </Link>
            {article.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-heading)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-accent)]">
            {article.poemTitle}
          </div>
          <div className="mt-5 space-y-2 serif-display text-3xl leading-snug text-[var(--tp-heading)]">
            {article.poemLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
