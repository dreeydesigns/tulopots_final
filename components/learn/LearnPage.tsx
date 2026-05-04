'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { ArrowRight, CheckCircle, Clock, Users, Loader2 } from 'lucide-react';
import { imageByKey } from '@/lib/site';

type ClassType = {
  id: string;
  badge: string;
  badgeColor: string;
  name: string;
  tagline: string;
  description: string;
  duration: string;
  audience: string;
  groupSize: string;
  price: string;
  priceNote?: string;
  includes: string[];
  image: string;
  accent: string;
};

const CLASSES: ClassType[] = [
  {
    id: 'open-wheel',
    badge: 'Adults',
    badgeColor: '#8A4E2D',
    name: 'Open Wheel',
    tagline: 'Your first vessel starts here.',
    description:
      'Sit at a potter\'s wheel for the first time and feel what 8,000 years of craft feels like in your hands. You\'ll learn to centre clay, open a form, and pull up your first cylinder. No experience needed — only curiosity.',
    duration: '2.5 hours',
    audience: 'Adults 18+',
    groupSize: 'Max 6 per session',
    price: 'KSh 3,500',
    includes: ['Clay & tools', 'Apron', 'Firing of 1–2 pieces', 'Refreshments'],
    image: imageByKey.workshop,
    accent: '#B66A3C',
  },
  {
    id: 'first-touch',
    badge: 'All Ages',
    badgeColor: '#75825B',
    name: 'First Touch',
    tagline: 'Hand-building for complete beginners.',
    description:
      'No wheel, no pressure. This session is about feeling clay respond to your hands through pinching, coiling, and slab-building. You leave with a piece that is genuinely yours — uneven edges and all.',
    duration: '2 hours',
    audience: 'Ages 10 and up',
    groupSize: 'Max 8 per session',
    price: 'KSh 2,800',
    includes: ['Clay & tools', 'Apron', 'Firing of 1 piece', 'Guided instruction'],
    image: imageByKey.indoor1,
    accent: '#75825B',
  },
  {
    id: 'clay-and-kids',
    badge: 'Kids',
    badgeColor: '#C07B3A',
    name: 'Clay & Kids',
    tagline: 'Tactile learning for young hands.',
    description:
      'Children learn best when their hands are busy. This session gives kids aged 6–14 unstructured time with clay alongside gentle guidance. They build, reshape, laugh, and walk out holding something they made themselves.',
    duration: '90 minutes',
    audience: 'Ages 6–14',
    groupSize: 'Max 10 per session',
    price: 'KSh 2,200',
    priceNote: 'per child',
    includes: ['Clay & tools', 'Apron provided', 'Firing of 1 piece', 'Parents welcome to watch'],
    image: imageByKey.indoor2,
    accent: '#C07B3A',
  },
  {
    id: 'two-at-the-wheel',
    badge: 'Couples',
    badgeColor: '#6B3A2A',
    name: 'Two at the Wheel',
    tagline: 'A date you will not forget.',
    description:
      'Side by side at two wheels with a guide who knows when to step in and when to let you figure it out together. You\'ll laugh more than you expect, make more mess than you plan, and leave with a story.',
    duration: '2.5 hours',
    audience: 'Couples & pairs',
    groupSize: 'Private session for 2',
    price: 'KSh 7,500',
    priceNote: 'per pair',
    includes: ['Clay & tools', 'Aprons', 'Firing of 2 pieces', 'Drinks included', 'Private session'],
    image: imageByKey.clay,
    accent: '#6B3A2A',
  },
  {
    id: 'schools-groups',
    badge: 'Schools & Groups',
    badgeColor: '#4A6741',
    name: 'Studio Visits',
    tagline: 'Bring a class. Leave with context.',
    description:
      'Schools, teens, and groups of up to 30 visit the studio for a guided session combining a tour of the production floor, a short talk on Kenyan clay craft, and hands-on time making a piece to take home.',
    duration: 'Half or full day',
    audience: 'Schools, teens, corporates',
    groupSize: '15–30 people',
    price: 'From KSh 1,800',
    priceNote: 'per person',
    includes: ['Studio tour', 'Clay session', 'Firing included', 'Custom scheduling'],
    image: imageByKey.outdoor1,
    accent: '#4A6741',
  },
  {
    id: 'eight-week',
    badge: 'Course',
    badgeColor: '#2D1A0F',
    name: '8-Week Clay Course',
    tagline: 'For those who want to actually learn.',
    description:
      'Eight two-hour sessions that take you from your first centred lump of clay to a finished, glazed set you\'re proud to use. Structured but unhurried. We cover wheel throwing, trimming, surface decoration, and glazing.',
    duration: '8 × 2-hour sessions',
    audience: 'Adults 18+ committed to learning',
    groupSize: 'Max 6 per cohort',
    price: 'KSh 22,000',
    includes: ['All clay & tools', 'Apron', 'All firings', 'Final glazed set', 'Certificate'],
    image: imageByKey.productStudio,
    accent: '#2D1A0F',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Pick your session',
    body: 'Choose the class that fits your pace — a single afternoon, a date night, a kids\' session, or a full course.',
  },
  {
    number: '02',
    title: 'Book a date',
    body: 'Fill in the short form below. We\'ll confirm within 24 hours with your exact date, location, and what to bring.',
  },
  {
    number: '03',
    title: 'Come as you are',
    body: 'Wear clothes you don\'t mind marking. Everything else — clay, tools, aprons, instruction — is already here waiting.',
  },
];

const FAQ = [
  {
    q: 'Do I need any experience?',
    a: 'None at all. Every session is designed for complete beginners. The guide sets the pace.',
  },
  {
    q: 'What should I wear?',
    a: 'Something you don\'t mind getting clay on. Clay washes out, but it does mark. Aprons are provided.',
  },
  {
    q: 'When do I get my finished pieces?',
    a: 'Pieces go through bisque firing and glaze firing. Allow 2–3 weeks from your session date.',
  },
  {
    q: 'Can I book a private group?',
    a: 'Yes. Private sessions for birthdays, team events, school groups, and corporate away-days are available. Use the form and mention your group size.',
  },
  {
    q: 'Where is the studio?',
    a: 'TuloPots studio is in Nairobi. Exact address and directions are sent with your booking confirmation.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'Cancellations with more than 48 hours notice are fully refunded or rescheduled. Cancellations under 48 hours can be rescheduled once.',
  },
];

type FormState = 'idle' | 'sending' | 'sent' | 'error';

export function LearnPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', groupSize: '1', notes: '' });
  const [formState, setFormState] = useState<FormState>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm(classId?: string) {
    if (classId) setSelectedClass(classId);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !selectedClass) return;
    setFormState('sending');
    try {
      await fetch('/api/learn/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, classId: selectedClass }),
      });
      setFormState('sent');
    } catch {
      setFormState('error');
    }
  }

  return (
    <main className="tp-page">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <Image
          src={imageByKey.workshop}
          alt="TuloPots clay studio workshop"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        <div className="relative container-shell pb-16 md:pb-24 xl:pb-32">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60 mb-5">
            TuloPots Studio — Nairobi
          </p>
          <h1
            className="serif-display text-white leading-[0.9]"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 7rem)' }}
          >
            Where clay meets<br />first-time hands.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-7 text-white/72">
            Wheel sessions, hand-building workshops, couples evenings, school visits, and an 8-week course — all held in our working studio in Nairobi.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => scrollToForm()}
              className="tp-btn-primary inline-flex items-center gap-2 rounded-full px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]"
            >
              Book a Class
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#classes"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/18"
            >
              See All Sessions
            </a>
          </div>

          {/* audience pills */}
          <div className="mt-10 flex flex-wrap gap-2">
            {['Adults', 'Kids', 'Couples', 'Schools & Groups', '8-Week Course'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/80"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY LEARN HERE ───────────────────────────────────────────── */}
      <section className="container-shell py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              title: 'A working studio, not a classroom.',
              body: 'You learn next to potters who are making things for sale. That changes the energy in the room in ways that matter.',
            },
            {
              title: 'Small groups. Real attention.',
              body: 'Every session is capped at 6–10 people. Your guide is close enough to correct your grip before the clay collapses.',
            },
            {
              title: 'Nairobi-made, from the earth up.',
              body: 'The clay is Kenyan. The techniques are old. What you make here belongs to this city.',
            },
          ].map((item) => (
            <div key={item.title} className="border-t-2 pt-7 tp-border">
              <h3 className="serif-display text-[22px] leading-tight tp-heading">{item.title}</h3>
              <p className="mt-4 text-[15px] leading-7 tp-text-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLASS GRID ───────────────────────────────────────────────── */}
      <section id="classes" className="container-shell pb-20 md:pb-28">
        <div className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.26em] tp-accent">Studio Sessions</p>
          <h2 className="serif-display mt-4 tp-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>
            Six ways to start.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {CLASSES.map((cls) => (
            <article
              key={cls.id}
              className="group flex flex-col overflow-hidden rounded-[1.75rem] tp-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden tp-surface-soft">
                <Image
                  src={cls.image}
                  alt={cls.name}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span
                  className="absolute left-4 top-4 rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white"
                  style={{ background: cls.accent }}
                >
                  {cls.badge}
                </span>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">{cls.tagline}</p>
                  <h3 className="serif-display mt-1 text-[28px] text-white leading-none">{cls.name}</h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-[14px] leading-7 tp-text-soft flex-1">{cls.description}</p>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-5 tp-border">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] tp-text-muted">Duration</p>
                    <p className="mt-1 text-[12px] font-semibold tp-text">{cls.duration}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] tp-text-muted">For</p>
                    <p className="mt-1 text-[12px] font-semibold tp-text">{cls.audience}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] tp-text-muted">Price</p>
                    <p className="mt-1 text-[12px] font-semibold tp-accent">{cls.price}</p>
                    {cls.priceNote && (
                      <p className="text-[9px] tp-text-muted">{cls.priceNote}</p>
                    )}
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {cls.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[12px] tp-text-soft">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 tp-accent" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => scrollToForm(cls.id)}
                  className="mt-6 w-full rounded-full py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:opacity-90"
                  style={{ background: cls.accent, color: '#fff' }}
                >
                  Book this class
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="tp-surface-soft py-20 md:py-24">
        <div className="container-shell">
          <div className="mb-14 text-center">
            <p className="text-[11px] uppercase tracking-[0.26em] tp-accent">The process</p>
            <h2 className="serif-display mt-4 tp-heading" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)' }}>
              Three steps. That is it.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 tp-border"
                >
                  <span className="serif-display text-[22px] tp-accent">{step.number}</span>
                </div>
                <h3 className="serif-display text-[20px] tp-heading">{step.title}</h3>
                <p className="mt-3 text-[14px] leading-7 tp-text-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8-WEEK COURSE CALLOUT ─────────────────────────────────────── */}
      <section className="container-shell py-20 md:py-28">
        <div className="relative overflow-hidden rounded-[2rem]">
          <Image
            src={imageByKey.clay}
            alt="8-week clay course"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/60 to-black/20" />
          <div className="relative grid items-center gap-10 p-8 md:grid-cols-[1fr_auto] md:p-14 xl:p-20">
            <div>
              <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/80">
                8-Week Course
              </span>
              <h2
                className="serif-display mt-5 text-white leading-[0.92]"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)' }}
              >
                For those who want<br />to actually learn.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/72">
                Eight sessions. Eight weeks. From your first centred lump of clay to a finished, glazed set you use every morning. Cohorts are capped at 6 — smaller than a pottery class anywhere else in Nairobi.
              </p>
              <ul className="mt-6 space-y-2">
                {['Wheel throwing from day one', 'Trimming, surface work, and glazing', 'All clay, all firings, all tools included', 'Certificate on completion — KSh 22,000'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[13px] text-white/80">
                    <CheckCircle className="h-4 w-4 text-[#d0824d] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 md:min-w-[180px]">
              <button
                onClick={() => scrollToForm('eight-week')}
                className="tp-btn-primary rounded-full px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-center"
              >
                Apply for Course
              </button>
              <p className="text-center text-[10px] text-white/40 uppercase tracking-[0.14em]">
                Ongoing intake
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOKING FORM ─────────────────────────────────────────────── */}
      <section ref={formRef} id="book" className="tp-surface-soft py-20 md:py-28">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <p className="text-[11px] uppercase tracking-[0.26em] tp-accent">Booking</p>
              <h2 className="serif-display mt-4 tp-heading" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}>
                Reserve your place.
              </h2>
              <p className="mt-4 text-[15px] leading-7 tp-text-soft">
                Fill in the form. We confirm within 24 hours with your date, location, and everything to bring.
              </p>
            </div>

            {formState === 'sent' ? (
              <div className="rounded-[1.75rem] border p-10 text-center tp-card tp-border">
                <CheckCircle className="mx-auto h-12 w-12 tp-accent mb-4" />
                <h3 className="serif-display text-[26px] tp-heading">We have your request.</h3>
                <p className="mt-3 text-[15px] tp-text-soft">
                  Expect a confirmation message within 24 hours with your exact session details.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-[1.75rem] border p-7 md:p-10 tp-card tp-border space-y-5"
              >
                {/* class selector */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted mb-2">
                    Which session?
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                    className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none tp-border tp-surface tp-text"
                  >
                    <option value="">Select a class or course</option>
                    {CLASSES.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} — {cls.price} · {cls.duration}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted mb-2">
                      Your name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none tp-border tp-surface tp-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted mb-2">
                      Phone / WhatsApp
                    </label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none tp-border tp-surface tp-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted mb-2">
                    Email address
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none tp-border tp-surface tp-text"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted mb-2">
                      Preferred date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none tp-border tp-surface tp-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted mb-2">
                      Group size
                    </label>
                    <select
                      value={form.groupSize}
                      onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
                      className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none tp-border tp-surface tp-text"
                    >
                      {['1', '2', '3', '4', '5', '6', '7–10', '10–20', '20+'].map((n) => (
                        <option key={n} value={n}>{n} {n === '1' ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted mb-2">
                    Anything we should know? (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Ages of children, accessibility needs, special occasion..."
                    className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none resize-none tp-border tp-surface tp-text"
                  />
                </div>

                {formState === 'error' && (
                  <p className="text-[13px] text-red-500">
                    Something went wrong. Please try again or WhatsApp us directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === 'sending'}
                  className="tp-btn-primary w-full rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {formState === 'sending' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    <>Request Booking <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                <p className="text-center text-[11px] tp-text-muted">
                  We confirm within 24 hours. No payment required upfront.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="container-shell py-20 md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.26em] tp-accent">Questions</p>
            <h2 className="serif-display mt-4 tp-heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              What people ask first.
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={item.q}
                className="overflow-hidden rounded-[1.25rem] border tp-card tp-border"
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[15px] font-semibold tp-heading">{item.q}</span>
                  <span className="ml-4 text-[18px] tp-accent shrink-0">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-[14px] leading-7 tp-text-soft">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
      <section className="container-shell pb-24">
        <div className="rounded-[2rem] tp-card tp-border px-8 py-12 md:px-14 md:py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.26em] tp-accent">Ready to start</p>
          <h2 className="serif-display mt-4 tp-heading" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)' }}>
            The clay has been waiting.
          </h2>
          <p className="mt-4 mx-auto max-w-md text-[15px] leading-7 tp-text-soft">
            Pick a session, send us a message, and we will sort the rest. First class or fiftieth — you are welcome here.
          </p>
          <button
            onClick={() => scrollToForm()}
            className="tp-btn-primary mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]"
          >
            Book Now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
