'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

type Card = {
  title: string;
  subtitle?: string;
  route: string;
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [needsHuman, setNeedsHuman] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello 🌿 What would you like help with today — indoor, outdoor, pots only, care, payment, or custom orders?',
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
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data?.reply || 'I can help with products, care, delivery, payment, and custom orders.',
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
            'Something went wrong while checking the website knowledge. I can continue this with the TuloPots team on WhatsApp if you want.',
        },
      ]);
      setNeedsHuman(true);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  async function continueOnWhatsApp() {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;

    setSendingWhatsApp(true);

    try {
      const summary = messages
        .slice(-8)
        .map((m) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, summary }),
      });

      const data = await res.json();

      if (data?.waLink) {
        window.open(data.waLink, '_blank');
      }

      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSendingWhatsApp(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-[#5A3422] p-4 text-white shadow-[0_10px_30px_rgba(90,52,34,0.25)] transition hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      ) : (
        <div className="w-[92vw] max-w-[390px] overflow-hidden rounded-[1.5rem] border border-[#e8dccf] bg-white shadow-[0_20px_60px_rgba(90,52,34,0.18)]">
          <div className="flex items-center justify-between bg-[#1e100a] px-4 py-3 text-white">
            <div>
              <div className="text-sm font-semibold">TuloPots Assistant</div>
              <div className="text-[11px] text-white/70">Website knowledge support</div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[380px] space-y-3 overflow-y-auto bg-[#faf7f4] p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] whitespace-pre-line rounded-[1rem] px-4 py-3 text-sm leading-7 ${
                  m.role === 'assistant'
                    ? 'bg-white text-[#3d2a20] border border-[#eee4da]'
                    : 'ml-auto bg-[#5A3422] text-white'
                }`}
              >
                {m.content}
              </div>
            ))}

            {cards.length > 0 && (
              <div className="space-y-2">
                {cards.map((card, i) => (
                  <Link
                    key={`${card.route}-${i}`}
                    href={card.route}
                    className="block rounded-[1rem] border border-[#e8dccf] bg-white px-4 py-3 transition hover:border-[#B66A3C] hover:bg-[#fff8f2]"
                  >
                    <div className="text-sm font-semibold text-[#3d2a20]">{card.title}</div>
                    {card.subtitle && (
                      <div className="mt-1 text-xs text-[#8a7a6d]">{card.subtitle}</div>
                    )}
                    <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#B66A3C]">
                      Open {card.route}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {loading && (
              <div className="max-w-[85%] rounded-[1rem] border border-[#eee4da] bg-white px-4 py-3 text-sm text-[#7a6f65]">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>

          <div className="border-t border-[#eee4da] bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage(input);
                }}
                placeholder="Ask about products, care, delivery..."
                className="flex-1 rounded-full border border-[#e8dccf] bg-[#fdf9f6] px-4 py-2.5 text-[13px] text-[#3d2a20] outline-none placeholder:text-[#c0ada2]"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5A3422] text-white transition hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {needsHuman && !sent && (
              <div className="mt-3 rounded-[1rem] border border-[#d9ead7] bg-[#f4fbf4] p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b6f60]">
                  Continue with the TuloPots team
                </div>
                <p className="mt-2 text-xs leading-6 text-[#6e7c70]">
                  I’ve already exhausted the website knowledge. Add your details and continue on WhatsApp.
                </p>

                <div className="mt-3 space-y-2">
                  <input
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[#d8e5d6] px-3 py-2 text-sm outline-none"
                  />
                  <input
                    placeholder="Phone number"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#d8e5d6] px-3 py-2 text-sm outline-none"
                  />
                  <input
                    placeholder="Email (optional)"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full rounded-xl border border-[#d8e5d6] px-3 py-2 text-sm outline-none"
                  />

                  <button
                    onClick={continueOnWhatsApp}
                    disabled={!contactForm.name.trim() || !contactForm.phone.trim() || sendingWhatsApp}
                    className="w-full rounded-full bg-[#2c6e49] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {sendingWhatsApp ? 'Opening WhatsApp...' : 'Continue on WhatsApp'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}