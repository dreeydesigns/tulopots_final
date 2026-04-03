'use client';

import { Search, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';

type GuideEntry = {
  title: string;
  body: string;
  section: string;
};

type CareGuideExplorerCopy = {
  searchEyebrow: string;
  searchTitle: string;
  uploadEyebrow: string;
  uploadTitle: string;
  uploadBody: string;
};

export function CareGuideExplorer({
  entries,
  copy,
}: {
  entries: GuideEntry[];
  copy: CareGuideExplorerCopy;
}) {
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'idle' | 'error' | 'success'>('idle');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return entries;
    }

    return entries.filter((entry) =>
      `${entry.section} ${entry.title} ${entry.body}`.toLowerCase().includes(normalized)
    );
  }, [entries, query]);

  async function uploadImage(file: File) {
    setUploading(true);
    setFeedback('');
    setFeedbackTone('idle');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/uploads/support-image', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        imageUrl?: string;
      };

      if (!response.ok || !data.ok || !data.imageUrl) {
        throw new Error(data.error || 'Unable to upload that image.');
      }

      setImageUrl(data.imageUrl);
    } catch (error: any) {
      setFeedbackTone('error');
      setFeedback(error?.message || 'Unable to upload that image.');
    } finally {
      setUploading(false);
    }
  }

  async function submitHelpRequest() {
    setSending(true);
    setFeedback('');
    setFeedbackTone('idle');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', 'Plant Care Help');
      formData.append('message', message);
      formData.append('context', 'care-guide');
      if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Unable to send your care request.');
      }

      setName('');
      setEmail('');
      setMessage('');
      setImageUrl('');
      setFeedbackTone('success');
      setFeedback(data.message || 'Your care request has been sent.');
    } catch (error: any) {
      setFeedbackTone('error');
      setFeedback(error?.message || 'Unable to send your care request.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="border-t border-[var(--tp-border)] bg-[var(--tp-card)] py-14 md:py-20">
      <div className="container-shell grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            {copy.searchEyebrow}
          </div>
          <h2 className="mt-4 serif-display text-4xl tp-heading md:text-5xl">
            {copy.searchTitle}
          </h2>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 tp-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search terracotta, leaves, watering, drainage..."
              className="tp-input w-full rounded-full py-4 pl-12 pr-4 text-sm outline-none"
              style={{ borderWidth: '1px' }}
            />
          </div>

          <div className="mt-6 space-y-3">
            {filtered.slice(0, 8).map((entry) => (
              <div
                key={`${entry.section}-${entry.title}`}
                className="rounded-[1.25rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-4"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-accent">
                  {entry.section}
                </div>
                <div className="mt-2 text-sm font-semibold tp-heading">{entry.title}</div>
                <div className="mt-2 text-sm leading-7 tp-text-soft">{entry.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            {copy.uploadEyebrow}
          </div>
          <h2 className="mt-4 serif-display text-4xl tp-heading md:text-5xl">
            {copy.uploadTitle}
          </h2>
          <p className="mt-4 text-sm leading-7 tp-text-soft">
            {copy.uploadBody}
          </p>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="tp-input rounded-[1rem] px-4 py-3 text-sm outline-none"
                style={{ borderWidth: '1px' }}
              />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                type="email"
                className="tp-input rounded-[1rem] px-4 py-3 text-sm outline-none"
                style={{ borderWidth: '1px' }}
              />
            </div>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe the problem, the plant, the light, and how long it has been happening."
              className="tp-input min-h-[160px] rounded-[1.5rem] px-4 py-4 text-sm outline-none"
              style={{ borderWidth: '1px' }}
            />

            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed px-5 py-8 text-center"
              style={{
                borderColor: 'var(--tp-border)',
                background: 'var(--tp-surface)',
              }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadImage(file);
                  }
                }}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <UploadCloud className="h-5 w-5 tp-accent" />
              </div>
              <div className="text-sm font-medium tp-heading">
                {uploading ? 'Preparing your image...' : 'Upload a care photo'}
              </div>
              <div className="text-xs leading-6 tp-text-muted">
                We crop it automatically so the support team sees a clean, consistent view.
              </div>
            </label>

            {imageUrl ? (
              <div className="overflow-hidden rounded-[1.25rem] border border-[var(--tp-border)] bg-[var(--tp-surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Uploaded care challenge" className="h-64 w-full object-cover" />
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void submitHelpRequest()}
              disabled={sending}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send Care Request'}
            </button>

            {feedback ? (
              <div
                className="rounded-[1rem] px-4 py-3 text-sm"
                style={{
                  background:
                    feedbackTone === 'error'
                      ? 'color-mix(in srgb, var(--tp-accent) 10%, var(--tp-card) 90%)'
                      : 'color-mix(in srgb, var(--tp-success) 12%, var(--tp-card) 88%)',
                  color:
                    feedbackTone === 'error'
                      ? 'var(--tp-accent)'
                      : 'var(--tp-heading)',
                }}
              >
                {feedback}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
