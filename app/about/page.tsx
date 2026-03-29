import type { Metadata } from 'next';
import Image from 'next/image';
import { imageByKey, BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about the TuloPots studio in Nairobi, Kenya, and the clay-first philosophy behind its handcrafted terracotta forms.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `About ${BRAND.name}`,
    description:
      'The clay-first philosophy and Nairobi studio story behind TuloPots handcrafted terracotta forms.',
    url: `${SITE_URL}/about`,
    images: [imageByKey.clay],
  },
};

export default function Page() {
  return (
    <main className="tp-page container-shell py-12 md:py-16">
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            About TuloPots
          </div>
          <h1 className="mt-4 serif-display text-6xl tp-heading">
            Clay, patience, and the warmth of handmade living.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 tp-text-soft">
            TuloPots is a Nairobi-based terracotta studio creating forms that feel grounded,
            tactile, and quietly beautiful. We work with natural Kenyan clay and shape each piece
            to hold warmth, balance, and calm in the spaces people live with every day.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem]">
          <Image
            src={imageByKey.clay}
            alt="Clay work in the TuloPots Nairobi studio"
            width={1200}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          [
            'Rooted in craft',
            'Every piece is formed slowly, with care for proportion, balance, and the quiet character of clay.',
          ],
          [
            'Material honesty',
            'We let terracotta speak through visible clay texture, breathable surfaces, and restrained finish.',
          ],
          [
            'Crafted for living',
            'Our forms are made for interior spaces, open spaces, studios, and the rhythms of everyday placement.',
          ],
        ].map(([title, body]) => (
          <div key={title as string} className="rounded-[2rem] tp-card p-8">
            <h2 className="serif-display text-4xl tp-heading">{title}</h2>
            <p className="mt-4 text-base leading-8 tp-text-soft">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
