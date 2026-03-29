import Link from 'next/link';
import { POLICY_EFFECTIVE_LABEL } from '@/lib/policies';

type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="tp-page container-shell py-12 md:py-16">
      <section className="mx-auto max-w-4xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
          {eyebrow}
        </div>
        <h1 className="mt-4 serif-display text-5xl tp-heading md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 tp-text-soft">
          {intro}
        </p>
        <div className="mt-4 text-xs uppercase tracking-[0.16em] tp-text-muted">
          Effective {POLICY_EFFECTIVE_LABEL}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl space-y-5">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[1.75rem] border tp-card p-7">
            <h2 className="serif-display text-4xl tp-heading">{section.title}</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 tp-text-soft">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-10 max-w-4xl rounded-[1.75rem] border tp-surface p-7">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-text-muted">
          Contact
        </div>
        <p className="mt-3 text-sm leading-8 tp-text-soft">
          Questions about these terms or how TuloPots handles data can be sent through our{' '}
          <Link href="/contact" className="tp-accent underline">
            contact page
          </Link>
          . If you need a signed legal review for launch, local counsel should review these
          pages before production use.
        </p>
      </section>
    </main>
  );
}
