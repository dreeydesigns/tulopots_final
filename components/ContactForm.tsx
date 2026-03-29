'use client';

import { useState } from 'react';

type SubmitState = {
  tone: 'idle' | 'success' | 'error';
  message: string;
};

export function ContactForm() {
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

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
          Subject
        </label>
        <select
          name="subject"
          className="tp-input rounded-2xl px-5 py-3.5 text-sm outline-none transition"
          style={{ borderWidth: '1px', color: 'var(--tp-text)' }}
          defaultValue="General Inquiry"
        >
          <option>General Inquiry</option>
          <option>Custom Order</option>
          <option>Plant Care Help</option>
          <option>Wholesale</option>
          <option>Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
          Message
        </label>
        <textarea
          name="message"
          placeholder="Tell us what you need..."
          className="tp-input min-h-[140px] resize-none rounded-2xl px-5 py-4 text-sm outline-none transition"
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
