'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/Providers';

type StudioBriefListItem = {
  id: string;
  createdAt: string;
  status: string;
  space: string;
  helpType: string;
  summary: string;
};

type StudioInboxResponse = {
  ok: true;
  count: number;
  briefs: StudioBriefListItem[];
};

type StudioInboxError = {
  ok: false;
  error: string;
};

export default function StudioInboxPage() {
  const { isLoggedIn, setIsLoggedIn } = useStore();

  const [briefs, setBriefs] = useState<StudioBriefListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBriefs() {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch('/api/studio', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = (await response.json()) as StudioInboxResponse | StudioInboxError;

        if (!response.ok || !data.ok) {
          const message =
            'error' in data && data.error
              ? data.error
              : 'We could not load studio briefs right now.';
          setError(message);
          return;
        }

        setBriefs(data.briefs);

        if (data.briefs.length > 0) {
          setSelectedId((current) => current || data.briefs[0].id);
        }
      } catch {
        setError('We could not load studio briefs right now.');
      } finally {
        setIsLoading(false);
      }
    }

    loadBriefs();
  }, []);

  const filteredBriefs = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return briefs;

    return briefs.filter((brief) => {
      return (
        brief.id.toLowerCase().includes(term) ||
        brief.space.toLowerCase().includes(term) ||
        brief.helpType.toLowerCase().includes(term) ||
        brief.summary.toLowerCase().includes(term)
      );
    });
  }, [briefs, query]);

  const selectedBrief =
    filteredBriefs.find((brief) => brief.id === selectedId) || filteredBriefs[0] || null;

  useEffect(() => {
    if (!selectedBrief && filteredBriefs.length > 0) {
      setSelectedId(filteredBriefs[0].id);
    }
  }, [filteredBriefs, selectedBrief]);

  async function handleCopySummary() {
    if (!selectedBrief) return;

    try {
      await navigator.clipboard.writeText(selectedBrief.summary);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <main
        className="relative min-h-screen overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at top, rgba(182,106,60,0.12), transparent 32%), linear-gradient(180deg, var(--tp-bg) 0%, color-mix(in srgb, var(--tp-bg) 88%, black 12%) 100%)',
          color: 'var(--tp-text)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.08]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(255,255,255,0.4) 0.8px, transparent 0.8px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
          <div
            className="w-full max-w-2xl rounded-[2rem] border p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.14)] md:p-12"
            style={{
              background: 'color-mix(in srgb, var(--tp-surface) 88%, transparent 12%)',
              borderColor: 'color-mix(in srgb, var(--tp-border) 82%, transparent 18%)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border text-sm tracking-[0.22em]"
              style={{
                borderColor: 'color-mix(in srgb, var(--tp-border) 78%, transparent 22%)',
                color: 'var(--tp-heading)',
              }}
            >
              INBOX
            </div>

            <h1
              className="mx-auto max-w-xl text-3xl font-medium leading-tight md:text-5xl"
              style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
            >
              Studio inbox opens when you are signed in.
            </h1>

            <p
              className="mx-auto mt-5 max-w-xl text-sm leading-7 md:text-base"
              style={{ color: 'var(--tp-text)' }}
            >
              This space is for reviewing captured Studio requests and shaping the next
              response with care.
            </p>

            <button
              type="button"
              onClick={() => setIsLoggedIn(true)}
              className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.22em] transition duration-300 hover:-translate-y-0.5"
              style={{
                background: 'var(--tp-accent)',
                color: '#ffffff',
                boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
              }}
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at top, rgba(182,106,60,0.10), transparent 28%), radial-gradient(circle at 20% 20%, rgba(117,130,91,0.10), transparent 24%), linear-gradient(180deg, color-mix(in srgb, var(--tp-bg) 82%, black 18%) 0%, color-mix(in srgb, var(--tp-bg) 90%, black 10%) 100%)',
        color: 'var(--tp-text)',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(255,255,255,0.45) 0.9px, transparent 0.9px)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: 'color-mix(in srgb, var(--tp-text) 70%, transparent 30%)' }}
            >
              Studio Inbox
            </p>

            <h1
              className="text-4xl font-medium leading-[1.04] md:text-6xl"
              style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
            >
              Briefs that have been entrusted to us.
            </h1>

            <p
              className="mt-5 max-w-2xl text-sm leading-7 md:text-base"
              style={{ color: 'color-mix(in srgb, var(--tp-text) 88%, transparent 12%)' }}
            >
              This is the first internal layer of Studio handoff. Each entry here is a real
              expression captured from the customer-facing Studio flow.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.22em] transition duration-300 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--tp-text)',
                border:
                  '1px solid color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
              }}
            >
              Back to Studio
            </Link>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.22em] transition duration-300 hover:-translate-y-0.5"
              style={{
                background: 'var(--tp-accent)',
                color: '#ffffff',
                boxShadow: '0 16px 34px rgba(0,0,0,0.16)',
              }}
            >
              Refresh Inbox
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section
            className="overflow-hidden rounded-[2rem] border shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--tp-surface) 86%, transparent 14%) 0%, color-mix(in srgb, var(--tp-card) 94%, black 6%) 100%)',
              borderColor: 'color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="border-b px-6 py-5 md:px-7">
              <div className="flex flex-col gap-4">
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{
                      color:
                        'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)',
                    }}
                  >
                    Search briefs
                  </p>
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, space, help type, or summary"
                  className="w-full rounded-[1.2rem] border px-5 py-4 text-sm outline-none transition"
                  style={{
                    borderColor:
                      'color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--tp-text)',
                  }}
                />
              </div>
            </div>

            <div className="max-h-[68vh] overflow-y-auto px-4 py-4 md:px-5">
              {isLoading ? (
                <InboxState
                  title="Loading Studio briefs..."
                  body="We are gathering the latest captured requests."
                />
              ) : error ? (
                <InboxState title="Something interrupted the inbox." body={error} />
              ) : filteredBriefs.length === 0 ? (
                <InboxState
                  title="No Studio briefs yet."
                  body="Once someone completes the Studio flow, their brief will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {filteredBriefs.map((brief) => {
                    const selected = selectedBrief?.id === brief.id;

                    return (
                      <button
                        key={brief.id}
                        type="button"
                        onClick={() => setSelectedId(brief.id)}
                        className="w-full rounded-[1.5rem] border px-5 py-5 text-left transition duration-300 hover:-translate-y-0.5"
                        style={{
                          background: selected
                            ? 'color-mix(in srgb, var(--tp-accent) 16%, transparent 84%)'
                            : 'rgba(255,255,255,0.03)',
                          borderColor: selected
                            ? 'color-mix(in srgb, var(--tp-accent) 45%, transparent 55%)'
                            : 'color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
                          boxShadow: selected
                            ? '0 18px 34px rgba(0,0,0,0.14)'
                            : 'none',
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                              style={{
                                color: 'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)',
                              }}
                            >
                              {brief.id}
                            </p>

                            <p
                              className="mt-3 text-base font-medium leading-7"
                              style={{ color: 'var(--tp-heading)' }}
                            >
                              {brief.helpType || 'Unspecified help'}
                            </p>

                            <p
                              className="mt-1 text-sm leading-7"
                              style={{
                                color: 'color-mix(in srgb, var(--tp-text) 78%, transparent 22%)',
                              }}
                            >
                              {brief.space || 'Unspecified space'}
                            </p>
                          </div>

                          <span
                            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              color: 'var(--tp-text)',
                              border:
                                '1px solid color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
                            }}
                          >
                            {brief.status}
                          </span>
                        </div>

                        <p
                          className="mt-4 line-clamp-3 text-sm leading-7"
                          style={{ color: 'var(--tp-text)' }}
                        >
                          {brief.summary}
                        </p>

                        <p
                          className="mt-4 text-xs"
                          style={{
                            color: 'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)',
                          }}
                        >
                          {new Date(brief.createdAt).toLocaleString()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section
            className="overflow-hidden rounded-[2rem] border shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--tp-surface) 86%, transparent 14%) 0%, color-mix(in srgb, var(--tp-card) 94%, black 6%) 100%)',
              borderColor: 'color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="px-6 py-6 md:px-8 md:py-8">
              {!selectedBrief ? (
                <InboxState
                  title="Select a brief"
                  body="Choose any Studio brief from the left to review its captured direction."
                />
              ) : (
                <>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.26em]"
                    style={{ color: 'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)' }}
                  >
                    Studio brief detail
                  </p>

                  <h2
                    className="mt-4 text-3xl font-medium leading-tight md:text-[2.55rem]"
                    style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
                  >
                    {selectedBrief.helpType || 'Captured direction'}
                  </h2>

                  <p
                    className="mt-4 text-sm leading-7 md:text-base"
                    style={{ color: 'color-mix(in srgb, var(--tp-text) 88%, transparent 12%)' }}
                  >
                    This is the structured summary currently being received from Studio.
                    It confirms the emotional page is now flowing into a visible internal handoff layer.
                  </p>

                  <div
                    className="mt-8 rounded-[1.5rem] border p-5"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--tp-border) 74%, transparent 26%)',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <DetailBlock label="Reference" value={selectedBrief.id} />
                      <DetailBlock
                        label="Received"
                        value={new Date(selectedBrief.createdAt).toLocaleString()}
                      />
                      <DetailBlock label="Status" value={selectedBrief.status} />
                      <DetailBlock label="Space" value={selectedBrief.space || 'Not specified'} />
                    </div>

                    <div className="mt-6">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                        style={{
                          color: 'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)',
                        }}
                      >
                        Captured summary
                      </p>

                      <div className="mt-4 rounded-[1.25rem] border p-4"
                        style={{
                          borderColor:
                            'color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <pre
                          className="whitespace-pre-wrap break-words text-sm leading-7"
                          style={{
                            color: 'var(--tp-text)',
                            fontFamily: 'inherit',
                          }}
                        >
                          {selectedBrief.summary}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/studio"
                      className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.24em] transition duration-300 hover:-translate-y-0.5"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        color: 'var(--tp-text)',
                        border:
                          '1px solid color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
                      }}
                    >
                      Open Studio
                    </Link>

                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.24em] transition duration-300 hover:-translate-y-0.5"
                      style={{
                        background: 'var(--tp-accent)',
                        color: '#ffffff',
                        boxShadow: '0 16px 34px rgba(0,0,0,0.16)',
                      }}
                    >
                      {copied ? 'Summary Copied' : 'Copy Summary'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function InboxState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-center px-6 text-center">
      <h2
        className="text-2xl font-medium leading-tight md:text-4xl"
        style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
      >
        {title}
      </h2>

      <p
        className="mt-4 max-w-md text-sm leading-7 md:text-base"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 88%, transparent 12%)' }}
      >
        {body}
      </p>
    </div>
  );
}

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)' }}
      >
        {label}
      </p>
      <p className="mt-2 text-sm leading-7" style={{ color: 'var(--tp-text)' }}>
        {value}
      </p>
    </div>
  );
}