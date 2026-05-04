'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useStore } from './Providers';

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

type Card = {
  title: string;
  subtitle?: string;
  route: string;
};

type ChatbotOpenDetail = {
  message?: string;
};

export function Chatbot() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [needsHuman, setNeedsHuman] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'What can I help you with today: finding a clay form, checking delivery progress, care guidance, payment support, or a Studio request?',
    },
  ]);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [sent, setSent] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => undefined);
  const activeSearch =
    searchParams.get('q') ||
    searchParams.get('query') ||
    searchParams.get('search') ||
    '';
  const quickPrompts = useMemo(() => {
    const prompts: string[] = [];

    if (activeSearch) {
      prompts.push(`Show me pieces like ${activeSearch}`);
    }

    if (pathname === '/indoor' || pathname === '/') {
      prompts.push('What indoor pots do you have?');
    } else if (pathname === '/outdoor') {
      prompts.push('What outdoor pots do you have?');
    } else if (pathname === '/pots') {
      prompts.push('Show me pots only, no plant');
    } else {
      prompts.push('What pots are available?');
    }

    if (pathname !== '/delivery') {
      prompts.push('Track my order');
    }

    if (pathname !== '/care-guide') {
      prompts.push('Help me with plant care');
    }

    if (pathname !== '/studio') {
      prompts.push('Tell me about Studio');
    }

    return Array.from(new Set(prompts)).slice(0, 4);
  }, [activeSearch, isLoggedIn, pathname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, needsHuman, cards]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setNeedsHuman(false);
    setSent(false);
    setCards([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          pathname,
          search: searchParams.toString(),
          accountType: user?.isAdmin ? 'admin' : isLoggedIn ? 'customer' : 'guest',
        }),
      });
      const data = await res.json();

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data?.reply ||
            'I can help with clay forms, plant pairings, care, delivery, payment, and Studio briefs.',
        },
      ]);
      setNeedsHuman(Boolean(data?.needsHuman));
      setCards(Array.isArray(data?.cards) ? data.cards : []);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'I could not reach the live website knowledge right now. If you want, I can carry this into WhatsApp with the TuloPots team.',
        },
      ]);
      setNeedsHuman(true);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  useEffect(() => {
    const openHandler = (event: Event) => {
      const detail = (event as CustomEvent<ChatbotOpenDetail>).detail;
      const message = detail?.message?.trim();

      setOpen(true);

      if (message) {
        void sendMessageRef.current(message);
      }
    };

    window.addEventListener('tp-chatbot-open', openHandler as EventListener);

    return () => {
      window.removeEventListener('tp-chatbot-open', openHandler as EventListener);
    };
  }, []);

  async function continueOnWhatsApp() {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;

    setSendingWhatsApp(true);

    try {
      const summary = messages
        .slice(-8)
        .map((message) => `${message.role === 'user' ? 'Customer' : 'Assistant'}: ${message.content}`)
        .join('\n');

      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, summary }),
      });
      const data = await res.json();

      if (data?.waLink) {
        window.open(data.waLink, '_blank', 'noopener,noreferrer');
      }

      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSendingWhatsApp(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full p-4 text-[var(--tp-btn-primary-text)] shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition hover:scale-105"
          style={{ background: 'var(--tp-accent)' }}
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      ) : (
        <div
          className="flex w-[92vw] max-w-[390px] flex-col overflow-hidden rounded-[1.5rem] border shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
          style={{
            maxHeight: 'min(88vh, 680px)',
            borderColor: 'var(--tp-border)',
            background: 'var(--tp-card)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--tp-heading) 90%, black 10%) 0%, color-mix(in srgb, var(--tp-bg) 18%, var(--tp-heading) 82%) 100%)',
              color: 'var(--tp-btn-primary-text)',
            }}
          >
            <div>
              <div className="text-sm font-semibold">TuloPots Assistant</div>
              <div
                className="text-[11px]"
                style={{
                  color:
                    'color-mix(in srgb, var(--tp-btn-primary-text) 70%, transparent 30%)',
                }}
              >
                Storefront guidance and Studio support
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 transition hover:bg-white/10"
              aria-label="Close chat assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-4"
            style={{ background: 'var(--tp-surface)' }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[88%] whitespace-pre-line rounded-[1rem] px-4 py-3 text-sm leading-7 ${
                  message.role === 'assistant' ? 'border' : 'ml-auto'
                }`}
                style={{
                  borderColor:
                    message.role === 'assistant' ? 'var(--tp-border)' : 'transparent',
                  background:
                    message.role === 'assistant' ? 'var(--tp-card)' : 'var(--tp-accent)',
                  color:
                    message.role === 'assistant'
                      ? 'var(--tp-heading)'
                      : 'var(--tp-btn-primary-text)',
                }}
              >
                {message.content}
              </div>
            ))}

            {cards.length > 0 ? (
              <div className="space-y-2">
                {cards.map((card, index) => (
                  <Link
                    key={`${card.route}-${index}`}
                    href={card.route}
                    className="block rounded-[1rem] border px-4 py-3 transition"
                    style={{
                      borderColor: 'var(--tp-border)',
                      background: 'var(--tp-card)',
                    }}
                  >
                    <div className="text-sm font-semibold tp-heading">{card.title}</div>
                    {card.subtitle ? (
                      <div className="mt-1 text-xs tp-text-muted">{card.subtitle}</div>
                    ) : null}
                    <div className="mt-1 text-[11px] uppercase tracking-[0.12em] tp-accent">
                      Open {card.route}
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {loading ? (
              <div
                className="max-w-[85%] rounded-[1rem] border px-4 py-3 text-sm"
                style={{
                  borderColor: 'var(--tp-border)',
                  background: 'var(--tp-card)',
                  color: 'var(--tp-text-soft)',
                }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : null}

            {needsHuman && !sent ? (
              <div
                className="rounded-[1rem] border p-3"
                style={{
                  borderColor:
                    'color-mix(in srgb, var(--tp-success) 34%, var(--tp-border) 66%)',
                  background:
                    'color-mix(in srgb, var(--tp-success) 12%, var(--tp-surface) 88%)',
                }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{ color: 'var(--tp-success)' }}
                >
                  Continue with the TuloPots team
                </div>
                <p className="mt-2 text-xs leading-6 tp-text-soft">
                  Share your details below and we can continue on WhatsApp.
                </p>

                <div className="mt-3 space-y-2">
                  <input
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(event) =>
                      setContactForm({ ...contactForm, name: event.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={inputStyle()}
                  />
                  <input
                    placeholder="Phone number"
                    value={contactForm.phone}
                    onChange={(event) =>
                      setContactForm({ ...contactForm, phone: event.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={inputStyle()}
                  />
                  <input
                    placeholder="Email (optional)"
                    value={contactForm.email}
                    onChange={(event) =>
                      setContactForm({ ...contactForm, email: event.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={inputStyle()}
                  />

                  <button
                    onClick={continueOnWhatsApp}
                    disabled={
                      !contactForm.name.trim() ||
                      !contactForm.phone.trim() ||
                      sendingWhatsApp
                    }
                    className="w-full rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: 'var(--tp-success)',
                      color: 'var(--tp-btn-primary-text)',
                    }}
                  >
                    {sendingWhatsApp ? 'Opening WhatsApp...' : 'Continue on WhatsApp'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="border-t p-3"
            style={{
              borderColor: 'var(--tp-border)',
              background: 'var(--tp-card)',
            }}
          >
            {quickPrompts.length ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={loading}
                    className="rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition disabled:opacity-50"
                    style={{
                      borderColor: 'var(--tp-border)',
                      background: 'var(--tp-surface)',
                      color: 'var(--tp-heading)',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void sendMessage(input);
                  }
                }}
                placeholder="Ask about forms, care, delivery, or Studio..."
                className="flex-1 rounded-full border px-4 py-2.5 text-[13px] outline-none"
                style={{
                  borderColor: 'var(--tp-border)',
                  background: 'var(--tp-surface)',
                  color: 'var(--tp-heading)',
                }}
              />
              <button
                onClick={() => void sendMessage(input)}
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-90 disabled:opacity-40"
                style={{
                  background: 'var(--tp-accent)',
                  color: 'var(--tp-btn-primary-text)',
                }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function inputStyle() {
  return {
    borderColor: 'var(--tp-border)',
    background: 'var(--tp-card)',
    color: 'var(--tp-heading)',
  };
}
