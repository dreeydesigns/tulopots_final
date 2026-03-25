'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Leaf } from 'lucide-react';
import { useStore } from './Providers';

type Message = { role: 'user' | 'assistant'; content: string };

const INITIAL: Message = {
  role: 'assistant',
  content: "Hi! I'm Tula 🌿 Your TuloPots assistant. I can help you find the perfect pot, answer questions about plants, delivery, or payments. What are you looking for today?",
};

export function Chatbot() {
  const { user } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'chat' | 'collect' | 'done'>('chat');
  const [leadName, setLeadName] = useState(user?.name || '');
  const [leadPhone, setLeadPhone] = useState(user?.phone || '');
  const [leadEmail, setLeadEmail] = useState(user?.email || '');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // After 4+ user messages, suggest handoff
  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const showHandoff = userMsgCount >= 3 && stage === 'chat';

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((cur) => [...cur, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((cur) => [...cur, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((cur) => [...cur, { role: 'assistant', content: 'Sorry, something went wrong. Please WhatsApp us at +254700000000.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendToWhatsApp() {
    const summary = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' | ');

    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: leadName, phone: leadPhone, email: leadEmail, summary }),
    });
    const data = await res.json();

    if (data.waLink) {
      window.open(data.waLink, '_blank');
      setStage('done');
      setMessages((cur) => [...cur, {
        role: 'assistant',
        content: `Thank you ${leadName || 'there'}! 🌿 Your enquiry has been sent to the TuloPots team via WhatsApp. They'll follow up with you shortly at ${leadPhone}.`,
      }]);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-[150] flex h-14 w-14 items-center justify-center rounded-full bg-[#5A3422] text-white shadow-2xl transition hover:scale-105 hover:bg-[#4a2c1c]"
        aria-label="Open chat"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[149] flex w-[340px] max-h-[520px] flex-col rounded-[1.5rem] border border-[#e8dccf] bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#5A3422] px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Tula</div>
              <div className="text-[10px] text-white/70">TuloPots AI Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdf9f6]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                  m.role === 'user'
                    ? 'bg-[#5A3422] text-white rounded-br-sm'
                    : 'bg-white border border-[#e8dccf] text-[#3d2a20] rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#e8dccf] rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-2 w-2 rounded-full bg-[#c0ada2] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp handoff prompt */}
            {showHandoff && stage === 'chat' && (
              <div className="rounded-2xl bg-[#fdf5ee] border border-[#e8dccf] p-3 text-xs text-[#76675c]">
                <div className="font-semibold text-[#3d2a20] mb-1">Want us to follow up?</div>
                Share your contact details and the TuloPots team will reach out on WhatsApp.
                <button onClick={() => setStage('collect')} className="mt-2 w-full rounded-full bg-[#5A3422] py-2 text-xs font-semibold text-white">
                  Yes, follow up on WhatsApp →
                </button>
              </div>
            )}

            {/* Lead collection form */}
            {stage === 'collect' && (
              <div className="rounded-2xl bg-white border border-[#e8dccf] p-4 space-y-2">
                <div className="text-xs font-semibold text-[#3d2a20]">Your contact details</div>
                <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Your name"
                  className="w-full rounded-xl border border-[#e6d9cd] px-3 py-2 text-xs outline-none focus:border-[#B66A3C]" />
                <input value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="Phone e.g. +254700000000"
                  className="w-full rounded-xl border border-[#e6d9cd] px-3 py-2 text-xs outline-none focus:border-[#B66A3C]" />
                <input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email (optional)"
                  className="w-full rounded-xl border border-[#e6d9cd] px-3 py-2 text-xs outline-none focus:border-[#B66A3C]" />
                <button onClick={sendToWhatsApp} disabled={!leadPhone}
                  className="w-full rounded-full bg-[#25D366] py-2.5 text-xs font-semibold text-white disabled:opacity-50">
                  Send to WhatsApp 💬
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {stage !== 'done' && (
            <div className="flex gap-2 border-t border-[#e8dccf] bg-white p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about pots, plants, delivery…"
                className="flex-1 rounded-full border border-[#e6d9cd] bg-[#fdf9f6] px-4 py-2.5 text-xs outline-none focus:border-[#B66A3C] transition"
              />
              <button onClick={send} disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5A3422] text-white disabled:opacity-50 transition hover:opacity-90">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
