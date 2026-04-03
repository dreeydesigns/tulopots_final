'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ExternalLink, Mail, Newspaper } from 'lucide-react';

type NewsletterArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  href: string;
  subject: string;
  preheader: string;
  textBody: string;
  htmlBody: string;
};

type HubSpotMarketingConfig = {
  enabled: boolean;
  manageUrl: string;
  listsUrl: string;
  contactsUrl: string;
};

export function NewsletterWorkspace({
  articles,
  hubspot,
}: {
  articles: NewsletterArticle[];
  hubspot: HubSpotMarketingConfig;
}) {
  const [selectedId, setSelectedId] = useState(articles[0]?.id || '');
  const [copied, setCopied] = useState('');

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedId) || articles[0] || null,
    [articles, selectedId]
  );

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => {
        setCopied((current) => (current === key ? '' : current));
      }, 1800);
    } catch {
      setCopied('');
    }
  }

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
              Newsletter Workspace
            </div>
            <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
              Turn TuloPots articles into newsletter-ready drafts.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--tp-text)]/72">
              Each article below already has a subject line, preheader, plain-text draft, and HTML
              draft. Open HubSpot, choose a template, then copy in the version you want.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-heading)]"
            >
              Back to Admin
            </Link>
            <Link
              href="/admin/content?key=journal.library"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-heading)]"
            >
              Edit Journal Library
            </Link>
            <a
              href={hubspot.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--tp-accent)] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-btn-primary-text)]"
            >
              <Mail className="h-4 w-4" />
              Open HubSpot Email Builder
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                01
              </div>
              <div className="mt-2 text-lg text-[var(--tp-heading)]">Choose an article</div>
              <p className="mt-2 text-sm leading-6 text-[var(--tp-text)]/72">
                Pick the topic that matches the audience you want to speak to this week.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                02
              </div>
              <div className="mt-2 text-lg text-[var(--tp-heading)]">Copy the draft</div>
              <p className="mt-2 text-sm leading-6 text-[var(--tp-text)]/72">
                Use the ready-made subject, preheader, plain text, or HTML draft below.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                03
              </div>
              <div className="mt-2 text-lg text-[var(--tp-heading)]">Send from HubSpot</div>
              <p className="mt-2 text-sm leading-6 text-[var(--tp-text)]/72">
                Drop the copy into HubSpot, select your list, preview the send, then schedule it.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={hubspot.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
            >
              Email builder
              <ExternalLink className="h-3.5 w-3.5 text-[var(--tp-accent)]" />
            </a>
            <a
              href={hubspot.listsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
            >
              Subscriber lists
              <ExternalLink className="h-3.5 w-3.5 text-[var(--tp-accent)]" />
            </a>
            <a
              href={hubspot.contactsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
            >
              Contacts
              <ExternalLink className="h-3.5 w-3.5 text-[var(--tp-accent)]" />
            </a>
          </div>

          {!hubspot.enabled ? (
            <div className="mt-5 rounded-[1.5rem] bg-[var(--tp-surface)] px-4 py-4 text-sm leading-7 text-[var(--tp-text)]/72">
              HubSpot is not connected yet. Add `HUBSPOT_PRIVATE_APP_TOKEN`,
              `HUBSPOT_NEWSLETTER_LIST_ID`, and `HUBSPOT_PORTAL_ID` in Vercel, then reopen this page.
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5 md:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-accent)]">
              Article bank
            </div>
            <div className="mt-2 text-lg text-[var(--tp-heading)]">
              Choose the newsletter you want to build
            </div>
            <div className="mt-5 space-y-3">
              {articles.map((article) => {
                const active = article.id === selectedId;

                return (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => setSelectedId(article.id)}
                    className="w-full rounded-[1.5rem] border p-4 text-left transition"
                    style={{
                      borderColor: active ? 'var(--tp-accent)' : 'var(--tp-border)',
                      background: active ? 'var(--tp-surface)' : 'var(--tp-card)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[var(--tp-accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                        Article
                      </span>
                      <Newspaper className="h-4 w-4 text-[var(--tp-text)]/55" />
                    </div>
                    <div className="mt-3 serif-display text-3xl leading-tight text-[var(--tp-heading)]">
                      {article.title}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--tp-text)]/72">
                      {article.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5 md:p-6">
            {selectedArticle ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-accent)]">
                      Selected draft
                    </div>
                    <div className="mt-3 serif-display text-4xl leading-tight text-[var(--tp-heading)]">
                      {selectedArticle.title}
                    </div>
                  </div>
                  <Link
                    href={selectedArticle.href}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
                  >
                    Open article
                  </Link>
                </div>

                <div className="mt-4">
                  <Link
                    href="/admin/content?key=journal.library"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
                  >
                    Edit this in CMS
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                        Subject line
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyValue('subject', selectedArticle.subject)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
                      >
                        {copied === 'subject' ? <Check className="h-3.5 w-3.5 text-[var(--tp-accent)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--tp-accent)]" />}
                        {copied === 'subject' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--tp-heading)]">
                      {selectedArticle.subject}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                        Preheader
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyValue('preheader', selectedArticle.preheader)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
                      >
                        {copied === 'preheader' ? <Check className="h-3.5 w-3.5 text-[var(--tp-accent)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--tp-accent)]" />}
                        {copied === 'preheader' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--tp-heading)]">
                      {selectedArticle.preheader}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                        Plain-text newsletter draft
                      </div>
                      <div className="mt-1 text-sm text-[var(--tp-text)]/72">
                        Best for quick edits before pasting into HubSpot.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyValue('text', selectedArticle.textBody)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
                    >
                      {copied === 'text' ? <Check className="h-3.5 w-3.5 text-[var(--tp-accent)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--tp-accent)]" />}
                      {copied === 'text' ? 'Copied' : 'Copy text'}
                    </button>
                  </div>
                  <pre className="mt-4 max-h-[22rem] overflow-auto whitespace-pre-wrap rounded-[1rem] bg-[var(--tp-card)] p-4 text-sm leading-7 text-[var(--tp-text)]/78">
                    {selectedArticle.textBody}
                  </pre>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]">
                        HTML newsletter draft
                      </div>
                      <div className="mt-1 text-sm text-[var(--tp-text)]/72">
                        Use this when you want a styled email base inside the HubSpot editor.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyValue('html', selectedArticle.htmlBody)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
                    >
                      {copied === 'html' ? <Check className="h-3.5 w-3.5 text-[var(--tp-accent)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--tp-accent)]" />}
                      {copied === 'html' ? 'Copied' : 'Copy HTML'}
                    </button>
                  </div>
                  <pre className="mt-4 max-h-[22rem] overflow-auto whitespace-pre-wrap rounded-[1rem] bg-[var(--tp-card)] p-4 text-xs leading-6 text-[var(--tp-text)]/76">
                    {selectedArticle.htmlBody}
                  </pre>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] bg-[var(--tp-surface)] p-6 text-sm leading-7 text-[var(--tp-text)]/72">
                No article drafts are ready yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
