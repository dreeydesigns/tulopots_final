import {
  getDefaultManagedPageContent,
  getManagedPageContent,
  resolveCmsImage,
} from '@/lib/cms';
import type { Product } from '@/lib/products';
import { SITE_URL } from '@/lib/site';

export type EditorialArticle = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  keywords: string[];
  newsletter: {
    subject: string;
    preheader: string;
  };
  cta: {
    label: string;
    href: string;
    text: string;
  };
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  poemTitle: string;
  poemLines: string[];
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
};

function articleHref(slug: string) {
  return `/journal/${slug}`;
}

function absoluteHref(href: string) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  return `${SITE_URL}${href}`;
}

function htmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function uniqueKeywords(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => String(value || '').split(/[\s,/.()+-]+/))
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 1)
    )
  );
}

export async function getEditorialLibraryContent() {
  try {
    return await getManagedPageContent('journal.library');
  } catch {
    return getDefaultManagedPageContent('journal.library');
  }
}

export async function getEditorialArticles(_products: Product[]): Promise<EditorialArticle[]> {
  const library = await getEditorialLibraryContent();

  return library.articles
    .filter((article) => article.visible)
    .map((article) => ({
      id: `article:${article.slug}`,
      slug: article.slug,
      title: article.title,
      eyebrow: article.eyebrow,
      summary: article.summary,
      intro: article.intro,
      heroImage: resolveCmsImage(article.heroImage.src),
      heroAlt: article.heroImage.alt,
      keywords: uniqueKeywords([
        article.slug,
        article.title,
        article.summary,
        article.intro,
        article.newsletter.subject,
        article.newsletter.preheader,
        article.poemTitle,
        ...article.keywords,
        ...article.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
        ...article.poemLines,
        ...article.relatedLinks.flatMap((link) => [link.label, link.href]),
      ]),
      newsletter: article.newsletter,
      cta: article.cta,
      sections: article.sections,
      poemTitle: article.poemTitle,
      poemLines: article.poemLines,
      relatedLinks: article.relatedLinks,
    }));
}

export function getEditorialArticleBySlug(articles: EditorialArticle[], slug: string) {
  return articles.find((article) => article.slug === slug) || null;
}

export function buildNewsletterDraftText(article: EditorialArticle) {
  const body = [
    article.title,
    '',
    article.intro,
    '',
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      '',
    ]),
    `CTA: ${article.cta.label} — ${absoluteHref(article.cta.href)}`,
    article.cta.text,
    '',
    article.poemTitle,
    ...article.poemLines,
  ]
    .join('\n')
    .trim();

  return {
    subject: article.newsletter.subject,
    preheader: article.newsletter.preheader,
    body,
  };
}

export function buildNewsletterDraftHtml(article: EditorialArticle) {
  const sectionsHtml = article.sections
    .map(
      (section) => `
        <section style="margin:0 0 24px;">
          <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;margin:0 0 12px;color:#2d2018;">${htmlEscape(section.heading)}</h2>
          ${section.paragraphs
            .map(
              (paragraph) =>
                `<p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#4b3b32;">${htmlEscape(paragraph)}</p>`
            )
            .join('')}
        </section>`
    )
    .join('');

  const poemHtml = article.poemLines
    .map(
      (line) =>
        `<div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.7;color:#5a4335;">${htmlEscape(line)}</div>`
    )
    .join('');

  return `
    <div style="background:#f7f2ea;padding:40px 24px;font-family:Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#fffaf5;border-radius:28px;padding:40px 32px;border:1px solid #eadac9;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#b66a3c;font-weight:700;margin-bottom:12px;">
          ${htmlEscape(article.eyebrow)}
        </div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.08;margin:0 0 16px;color:#241711;">
          ${htmlEscape(article.title)}
        </h1>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.85;color:#4b3b32;">
          ${htmlEscape(article.intro)}
        </p>
        <img src="${htmlEscape(article.heroImage)}" alt="${htmlEscape(article.heroAlt)}" style="width:100%;height:auto;border-radius:24px;display:block;margin:0 0 28px;" />
        ${sectionsHtml}
        <section style="margin:28px 0 0;padding:24px;border-radius:24px;background:#f4eadf;border:1px solid #eadac9;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b66a3c;font-weight:700;margin-bottom:10px;">
            Continue
          </div>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#4b3b32;">
            ${htmlEscape(article.cta.text)}
          </p>
          <a href="${htmlEscape(absoluteHref(article.cta.href))}" style="display:inline-block;background:#b66a3c;color:#fffaf5;text-decoration:none;border-radius:999px;padding:14px 22px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">
            ${htmlEscape(article.cta.label)}
          </a>
        </section>
        <section style="margin:28px 0 0;padding:24px;border-radius:24px;background:#fff;border:1px solid #eadac9;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b66a3c;font-weight:700;margin-bottom:14px;">
            ${htmlEscape(article.poemTitle)}
          </div>
          ${poemHtml}
        </section>
      </div>
    </div>
  `.trim();
}

export function buildArticleHref(article: EditorialArticle) {
  return articleHref(article.slug);
}
