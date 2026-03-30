'use client';

import { useState } from 'react';

type SubmitState = {
  tone: 'idle' | 'success' | 'error';
  message: string;
};

export function ContactForm({ context = 'contact-page' }: { context?: string }) {
  const [state, setState] = useState<SubmitState>({
    tone: 'idle',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setState({ tone: 'idle', message: '' });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get('phone') ?? '').trim();
    const preferredReply = String(formData.get('preferredReply') ?? '').trim();
    const originalMessage = String(formData.get('message') ?? '').trim();
    const notes = [];

    if (phone) {
      notes.push(`Phone / WhatsApp: ${phone}`);
    }

    if (preferredReply) {
      notes.push(`Preferred reply channel: ${preferredReply}`);
    }

    if (notes.length) {
      formData.set('message', `${originalMessage}\n\n${notes.join('\n')}`);
    }

    formData.set('context', context);

    try {
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
        throw new Error(data.error || 'We could not send your message just now.');
      }

      form.reset();
      setState({
        tone: 'success',
        message: data.message || 'Thank you. Your message is on its way to us.',
      });
    } catch (error: any) {
      setState({
        tone: 'error',
        message: error?.message || 'We could not send your message just now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
      <input type="hidden" name="context" value={context} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
            Name
          </label>
          <input
            name="name"
            placeholder="Your name"
            className="tp-input rounded-2xl px-5 py-3.5 text-sm outline-none transition"
            style={{ borderWidth: '1px' }}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="tp-input rounded-2xl px-5 py-3.5 text-sm outline-none transition"
            style={{ borderWidth: '1px' }}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
            Phone or WhatsApp
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="+254700000000"
            className="tp-input rounded-2xl px-5 py-3.5 text-sm outline-none transition"
            style={{ borderWidth: '1px' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
            Preferred reply
          </label>
          <select
            name="preferredReply"
            className="tp-input rounded-2xl px-5 py-3.5 text-sm outline-none transition"
            style={{ borderWidth: '1px', color: 'var(--tp-text)' }}
            defaultValue="email"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
          Subject
        </label>
        <select
          name="subject"
          className="tp-input rounded-2xl px-5 py-3.5 text-sm outline-none transition"
          style={{ borderWidth: '1px', color: 'var(--tp-text)' }}
          defaultValue="General conversation"
        >
          <option>General conversation</option>
          <option>Studio / Custom Order</option>
          <option>Delivery support</option>
          <option>Plant Care Help</option>
          <option>Wholesale</option>
          <option>Press / Collaboration</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
          Message
        </label>
        <textarea
          name="message"
          placeholder="Tell us what you need, where the piece will live, or what kind of help would be most useful."
          className="tp-input min-h-[160px] resize-none rounded-2xl px-5 py-4 text-sm outline-none transition"
          style={{ borderWidth: '1px' }}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary block w-full text-center disabled:opacity-60"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      <div className="rounded-[1.5rem] bg-[var(--tp-surface)] px-4 py-4 text-sm leading-7 tp-text-soft">
        Most messages receive a reply within one working day. If your order is already paid and
        you only need a delivery update, use the tracking page for the fastest answer.
      </div>

      <p className="text-xs leading-6 tp-text-muted">
        By sending a message, you agree to our{' '}
        <a href="/privacy-policy" className="tp-accent underline">
          Privacy Policy
        </a>
        . We only use your details to respond and support your request.
      </p>

      {state.message ? (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            background:
              state.tone === 'error'
                ? 'color-mix(in srgb, var(--tp-accent) 10%, var(--tp-card) 90%)'
                : 'color-mix(in srgb, var(--tp-success) 12%, var(--tp-card) 88%)',
            color:
              state.tone === 'error'
                ? 'var(--tp-accent)'
                : 'color-mix(in srgb, var(--tp-heading) 86%, transparent 14%)',
          }}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
