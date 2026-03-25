import { BRAND, imageByKey } from '@/lib/site';
import { Mail, MapPin, Phone } from 'lucide-react';

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export const metadata = {
  title: 'Contact Us | TuloPots',
  description: 'Contact TuloPots in Nairobi for pots, plants, studio commissions, and wholesale inquiries.',
};

const INFO = [
  { Icon: MapPin,    title: 'Visit Us',    text: 'Ngong Road, Nairobi, Kenya' },
  { Icon: Phone,     title: 'Call Us',     text: BRAND.phone },
  { Icon: Mail,      title: 'Email Us',    text: BRAND.emailPrimary },
  { Icon: ClockIcon, title: 'Open Hours',  text: 'Mon–Sat, 9AM – 6PM EAT' },
] as const;

export default function Page() {
  return (
    <main className="min-h-screen bg-[#faf7f4] pb-16">
      {/* Header */}
      <div className="bg-white pt-28 pb-10 text-center border-b border-[#e8dccf]">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">Get in Touch</div>
        <h1 className="mt-3 serif-display text-5xl text-[#2d1e16] md:text-6xl">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[#7a6b5f]">
          Have a question about our pots, plants, or custom orders? We would love to hear from you.
        </p>
      </div>

      <div className="container-shell">
        {/* Info cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INFO.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-[1.5rem] border border-[#e8dccf] bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf0e6]">
                <Icon className="h-4.5 w-4.5 text-[#B66A3C]" style={{ height: 18, width: 18 }} />
              </div>
              <div className="serif-display text-2xl text-[#3d2a1e]">{title}</div>
              <div className="text-sm leading-7 text-[#7a6b5f]">{text}</div>
            </div>
          ))}
        </div>

        {/* Form + Map */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Contact form */}
          <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-8">
            <h2 className="serif-display text-4xl text-[#3d2a1e]">Send Us a Message</h2>
            <p className="mt-2 text-sm leading-7 text-[#7a6d61]">
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <form action="/api/contact" method="post" className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7a6e]">Name</label>
                  <input
                    name="name"
                    placeholder="Your name"
                    className="rounded-2xl border border-[#e6d9cd] bg-[#fdfaf7] px-5 py-3.5 text-sm outline-none focus:border-[#c4a888] transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7a6e]">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-2xl border border-[#e6d9cd] bg-[#fdfaf7] px-5 py-3.5 text-sm outline-none focus:border-[#c4a888] transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7a6e]">Subject</label>
                <select
                  name="subject"
                  className="rounded-2xl border border-[#e6d9cd] bg-[#fdfaf7] px-5 py-3.5 text-sm text-[#5a4a3f] outline-none focus:border-[#c4a888] transition"
                >
                  <option>General Inquiry</option>
                  <option>Custom Order</option>
                  <option>Plant Care Help</option>
                  <option>Wholesale</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7a6e]">Message</label>
                <textarea
                  name="message"
                  placeholder="Tell us what you need..."
                  className="min-h-[140px] resize-none rounded-2xl border border-[#e6d9cd] bg-[#fdfaf7] px-5 py-4 text-sm outline-none focus:border-[#c4a888] transition"
                />
              </div>

              <button className="btn-primary block w-full text-center">Send Message</button>
            </form>
          </div>

          {/* Google Map */}
          <div className="overflow-hidden rounded-[1.5rem] border border-[#e8dccf] bg-white">
            <iframe
              title="TuloPots Location — Nairobi"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.199997936854!2d36.7817!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22ba8cbbf%3A0x66fb2be11a4c6de5!2sNgong%20Road%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 480 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
