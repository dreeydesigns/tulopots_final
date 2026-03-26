import Link from 'next/link';
import { Droplets, Sun, Wind, ShieldAlert, Leaf, Sprout, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Care Guide | TuloPots',
  description: 'Simple care tips for terracotta pots, indoor plants, and outdoor planters from TuloPots.',
};

const tabs = [
  {
    id: 'terracotta',
    title: 'Terracotta Care',
    intro:
      'Terracotta is naturally porous and breathable. That is what makes it beautiful for plants — but it also means it needs a little care.',
    cards: [
      {
        icon: Droplets,
        title: 'Soak before first use',
        text: 'Before planting, soak your terracotta pot in clean water for a few hours. This helps the clay settle and reduces the first-day moisture pull from your plant soil.',
      },
      {
        icon: Wind,
        title: 'Let it breathe',
        text: 'Terracotta performs best when airflow is good. Avoid trapping pots in fully sealed decorative sleeves for long periods.',
      },
      {
        icon: ShieldAlert,
        title: 'Clean gently',
        text: 'Use a soft cloth, mild soap, and water. Avoid harsh chemicals that can stain or weaken the clay surface.',
      },
    ],
  },
  {
    id: 'indoor',
    title: 'Indoor Plant Pairings',
    intro:
      'Our indoor pots are chosen to work beautifully with calm, breathable interiors. Keep light, moisture, and drainage balanced.',
    cards: [
      {
        icon: Leaf,
        title: 'Peace Lily & Monstera',
        text: 'Keep in bright indirect light. Water when the top layer of soil feels dry, not on a fixed daily schedule.',
      },
      {
        icon: Sprout,
        title: 'Snake Plant & ZZ Plant',
        text: 'These are low-maintenance options. Let soil dry properly between watering, especially in cooler rooms.',
      },
      {
        icon: Sun,
        title: 'Aloe & Succulents',
        text: 'Place near bright windows and avoid overwatering. Terracotta helps because it releases excess moisture faster.',
      },
    ],
  },
  {
    id: 'outdoor',
    title: 'Outdoor Pot Care',
    intro:
      'Outdoor pots face stronger sun, dust, wind, and rain. A little maintenance keeps them looking premium and lasting longer.',
    cards: [
      {
        icon: Sun,
        title: 'Strong sunlight is okay',
        text: 'Terracotta handles sun beautifully, but plants inside may still need the right watering rhythm during hotter days.',
      },
      {
        icon: Droplets,
        title: 'Check drainage after rain',
        text: 'Always make sure drainage holes stay open. Standing water can damage roots even when the pot itself is fine.',
      },
      {
        icon: ShieldAlert,
        title: 'Move with care',
        text: 'Larger terracotta pots are heavy. Lift from the base, not the rim, especially after watering.',
      },
    ],
  },
];

const troubleshooting = [
  {
    title: 'White marks on the pot?',
    text: 'That is usually mineral salt buildup from water and soil. Wipe gently with diluted vinegar and rinse with clean water.',
  },
  {
    title: 'Soil drying too fast?',
    text: 'Terracotta naturally breathes. Try slightly more frequent watering, mulch on top, or move the plant to softer indirect light.',
  },
  {
    title: 'Plant leaves turning yellow?',
    text: 'This is often overwatering, poor drainage, or low light. Check the soil and light conditions before watering again.',
  },
  {
    title: 'Outdoor pot fading or dusty?',
    text: 'Dust is normal. Clean with a soft damp cloth and let the clay dry naturally. Avoid glossy chemical finishes.',
  },
];

export default function CareGuidePage() {
  return (
    <main className="min-h-screen bg-[#faf7f4]">
      <section className="border-b border-[#e8dccf] bg-white pt-28 pb-14">
        <div className="container-shell">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">
            Plant & Pot Support
          </div>
          <h1 className="mt-4 serif-display text-5xl text-[#3d2a20] md:text-6xl">
            Care Guide
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8a7a6d] md:text-base">
            Everything you need to keep your terracotta pots beautiful and your plants thriving.
            Simple guidance, written the TuloPots way.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-[#e8dccf] bg-[#fdf9f5] px-4 py-2 text-[#7e6f64]">
              Terracotta care
            </span>
            <span className="rounded-full border border-[#e8dccf] bg-[#fdf9f5] px-4 py-2 text-[#7e6f64]">
              Indoor plants
            </span>
            <span className="rounded-full border border-[#e8dccf] bg-[#fdf9f5] px-4 py-2 text-[#7e6f64]">
              Outdoor pots
            </span>
            <span className="rounded-full border border-[#e8dccf] bg-[#fdf9f5] px-4 py-2 text-[#7e6f64]">
              Easy troubleshooting
            </span>
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-20">
        <div className="space-y-14">
          {tabs.map((section) => (
            <section key={section.id}>
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B66A3C]">
                  {section.title}
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#8a7a6d] md:text-base">
                  {section.intro}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {section.cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="rounded-[1.75rem] border border-[#e8dccf] bg-white p-6 shadow-[0_10px_35px_rgba(90,52,34,0.05)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5ede4]">
                        <Icon className="h-5 w-5 text-[#B66A3C]" />
                      </div>
                      <h3 className="mt-5 serif-display text-2xl text-[#3d2a20]">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#8a7a6d]">
                        {card.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e8dccf] bg-white py-14 md:py-20">
        <div className="container-shell">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">
            Troubleshooting
          </div>
          <h2 className="mt-4 serif-display text-4xl text-[#3d2a20] md:text-5xl">
            Common Questions
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {troubleshooting.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-[#e8dccf] bg-[#fdf9f5] p-6"
              >
                <h3 className="text-lg font-semibold text-[#3d2a20]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#8a7a6d]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-20">
        <div className="rounded-[2rem] border border-[#e8dccf] bg-[#1e100a] px-6 py-10 text-white md:px-10">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c98c5a]">
              Need more help?
            </div>
            <h2 className="mt-4 serif-display text-4xl md:text-5xl">
              Let TuloPots help you choose well
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
              Whether you are styling a home, refreshing a patio, or planning a custom order,
              we can guide you to the right pot and the right plant pairing.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/faq" className="btn-secondary inline-flex items-center gap-2">
                Visit FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}