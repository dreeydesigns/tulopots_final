import Image from 'next/image';
import { imageByKey } from '@/lib/site';

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
            TuloPots is a Nairobi-based terracotta studio creating pieces that
            feel grounded, tactile, and quietly beautiful. We work with
            natural Kenyan clay and shape each pot to feel as good in the
            hand as it looks in a room or garden.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem]">
          <Image
            src={imageByKey.clay}
            alt="Workshop"
            width={1200}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          [
            'Craftsmanship',
            'Every piece is formed slowly, with care for proportion, balance, and texture.',
          ],
          [
            'Material honesty',
            'We let terracotta speak through visible clay character and warm natural finish.',
          ],
          [
            'Design-led living',
            'Our forms are made for modern homes, gardens, studios, and thoughtful everyday styling.',
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