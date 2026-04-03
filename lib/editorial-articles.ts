import {
  getDefaultManagedPageContent,
  getManagedPageContent,
  type ManagedPageKey,
} from '@/lib/cms';
import type { Product } from '@/lib/products';
import { imageByKey } from '@/lib/site';
import { SITE_URL } from '@/lib/site';

export type EditorialArticle = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  keywords: string[];
  newsletter: {
    subject: string;
    preheader: string;
  };
  cta: {
    label: string;
    href: string;
    text: string;
  };
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  poemTitle: string;
  poemLines: string[];
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
};

async function readManagedPage<K extends ManagedPageKey>(key: K) {
  try {
    return await getManagedPageContent(key);
  } catch {
    return getDefaultManagedPageContent(key);
  }
}

function resolveImage(src: string) {
  return imageByKey[src as keyof typeof imageByKey] || src;
}

function uniqueKeywords(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => String(value || '').split(/[\s,/.()+-]+/))
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 1)
    )
  );
}

function findProduct(products: Product[], matcher: (product: Product) => boolean, fallbackIndex = 0) {
  return products.find(matcher) || products[fallbackIndex];
}

function articleHref(slug: string) {
  return `/journal/${slug}`;
}

function absoluteHref(href: string) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  return `${SITE_URL}${href}`;
}

function htmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function getEditorialArticles(products: Product[]): Promise<EditorialArticle[]> {
  const [aboutPage, careGuidePage, contactPage, deliveryPage] = await Promise.all([
    readManagedPage('about.page'),
    readManagedPage('care-guide.page'),
    readManagedPage('contact.page'),
    readManagedPage('delivery.page'),
  ]);

  const peaceLily = findProduct(products, (product) => product.slug.includes('peace-lily'));
  const snakePlant = findProduct(products, (product) => product.slug.includes('snake-plant'));
  const clayForm = findProduct(products, (product) => product.category === 'pots');
  const outdoor = findProduct(products, (product) => product.category === 'outdoor');
  const studioPick = findProduct(products, (product) => product.slug.includes('workshop-set'), 0);

  return [
    {
      id: 'article:unfinished-room',
      slug: 'why-beautiful-rooms-still-feel-unfinished',
      title: 'Why Beautiful Rooms Still Feel Unfinished',
      eyebrow: 'Editorial Journal',
      summary:
        'A room can have good furniture, strong lighting, and still feel like it is waiting for something. This is usually not a bigger sofa problem. It is a presence problem.',
      intro:
        `${aboutPage.intro} The rooms that stay in the mind usually hold one grounded form that settles the eye without asking for noise.`,
      heroImage: peaceLily?.image || resolveImage(aboutPage.heroImage.src),
      heroAlt: peaceLily?.name || aboutPage.heroImage.alt,
      keywords: uniqueKeywords([
        'unfinished room',
        'space feels empty',
        'interior styling',
        'presence in a room',
        aboutPage.title,
        peaceLily?.name,
      ]),
      newsletter: {
        subject: 'Why beautiful rooms still feel unfinished',
        preheader: 'The missing layer is rarely more furniture. It is usually presence.',
      },
      cta: {
        label: 'Explore Clay Forms',
        href: '/pots',
        text: 'If a room feels polished but still emotionally flat, begin with one clay form that can anchor the eye and soften the atmosphere.',
      },
      sections: [
        {
          heading: 'A room can be complete on paper and still feel absent',
          paragraphs: [
            'Many spaces have every practical thing in place. The seating works. The lighting works. The palette works. Yet the room still feels like it has no breath.',
            'That quiet absence is usually not solved by adding another decorative object. It is solved by placing something that brings weight, texture, and calm at the same time.',
          ],
        },
        {
          heading: 'Presence is what makes a room feel inhabited',
          paragraphs: [
            'A terracotta form does something soft but important. It carries the memory of earth into a finished room. That is why the warmth feels believable instead of staged.',
            `A piece such as ${peaceLily?.name || 'a grounded peace lily pairing'} works because it does not shout for attention. It steadies the room, then lets everything around it breathe better.`,
          ],
        },
        {
          heading: 'What to place first',
          paragraphs: [
            'Start with a corner that already has light but no anchor. A console that looks too bare. A shelf that feels decorative but cold. A bedroom side that needs softness.',
            'Choose one form and let it do less, not more. Premium rooms usually feel expensive because they are edited well, not because they are filled well.',
          ],
        },
      ],
      poemTitle: 'Closing verse',
      poemLines: [
        'When the courtyard empties, the clay still keeps the day.',
        'When the voices fade, the hearth remembers warmth.',
        'A quiet form by the wall can hold a whole evening.',
        'So a room becomes home before anyone speaks.',
      ],
      relatedLinks: [
        { label: 'Clay Forms', href: '/pots' },
        { label: 'For Interior Spaces', href: '/indoor' },
      ],
    },
    {
      id: 'article:accent-piece',
      slug: 'before-you-buy-another-accent-piece-read-this',
      title: 'Before You Buy Another Accent Piece, Read This',
      eyebrow: 'Editorial Journal',
      summary:
        'The easiest way to make a room look busy is to keep layering objects that do not belong to one another. Start with one grounded form before you add anything else.',
      intro:
        'Good styling is rarely about finding more things. It is about finding the one thing that allows the rest of the room to settle.',
      heroImage: clayForm?.image || resolveImage(aboutPage.studioImage.src),
      heroAlt: clayForm?.name || aboutPage.studioImage.alt,
      keywords: uniqueKeywords([
        'accent piece',
        'decor shopping',
        'pot only',
        'with plant',
        clayForm?.name,
        studioPick?.name,
      ]),
      newsletter: {
        subject: 'Before you buy another accent piece, read this',
        preheader: 'The difference between clutter and calm is usually one disciplined choice.',
      },
      cta: {
        label: 'See Pot Only and Placed Options',
        href: '/pots',
        text: 'Compare a clay form on its own with a placed pairing. The better choice is the one that supports the room you already have.',
      },
      sections: [
        {
          heading: 'Not every room needs another object',
          paragraphs: [
            'Some rooms already have enough visual activity. They do not need more novelty. They need one material choice that slows the room down.',
            'That is why a clay form works better than a random accent piece. It adds shape and warmth without introducing visual noise.',
          ],
        },
        {
          heading: 'How to choose between pot only and placed with plant',
          paragraphs: [
            'Choose pot only when you already know the plant you want, or when the room needs shape first and greenery second.',
            'Choose placed with plant when you want the room to feel resolved immediately. It removes one more decision and brings the full mood in a single step.',
          ],
        },
        {
          heading: 'The easier test',
          paragraphs: [
            'Ask a simple question: do I need an object, or do I need a finished moment? If it is the first, start with clay form only. If it is the second, choose the placed pairing.',
            `That is the logic behind pieces like ${studioPick?.name || 'our studio set'} and ${clayForm?.name || 'our clay forms'}: one lets you compose, the other lets you arrive faster.`,
          ],
        },
      ],
      poemTitle: 'Closing verse',
      poemLines: [
        'The river does not gather every stone.',
        'It keeps the ones that teach the water to sing.',
        'So a room stays graceful when the hand chooses lightly.',
        'And clay becomes enough where clutter was not.',
      ],
      relatedLinks: [
        { label: 'Clay Forms', href: '/pots' },
        { label: 'Care Guide', href: '/care-guide' },
      ],
    },
    {
      id: 'article:peace-lily-rule',
      slug: 'the-peace-lily-rule-that-changes-a-room-fast',
      title: 'The Peace Lily Rule That Changes a Room Fast',
      eyebrow: 'Editorial Journal',
      summary:
        'If you want one calm, forgiving placement that immediately softens a room, the peace lily is still one of the strongest answers. It works even better when the vessel is right.',
      intro:
        'The best placements do not fight the room. They calm it. A peace lily does that quickly because its leaves and bloom already carry quiet structure.',
      heroImage: peaceLily?.image || resolveImage(careGuidePage.sections[0]?.cards[0] ? aboutPage.heroImage.src : aboutPage.heroImage.src),
      heroAlt: peaceLily?.name || 'Peace lily in terracotta',
      keywords: uniqueKeywords([
        'peace lily',
        'indoor plant',
        'bedroom plant',
        'living room plant',
        peaceLily?.name,
        snakePlant?.name,
      ]),
      newsletter: {
        subject: 'The peace lily rule that changes a room fast',
        preheader: 'When you want calm without visual effort, start here.',
      },
      cta: {
        label: 'Explore Interior Pairings',
        href: '/indoor',
        text: 'If you want a softer indoor placement, start with the forms built for shelves, corners, bedrooms, and quieter living spaces.',
      },
      sections: [
        {
          heading: 'Why this pairing works so quickly',
          paragraphs: [
            'A peace lily gives you clear leaf shape, clean lift, and softness at once. It looks finished even in restrained rooms.',
            `Placed in ${peaceLily?.name || 'the right terracotta form'}, the plant stops feeling like a temporary houseplant purchase and starts feeling like part of the room’s architecture.`,
          ],
        },
        {
          heading: 'Where it belongs',
          paragraphs: [
            'Use it where the light is calm and indirect. Bedside spaces, sheltered living room corners, dressers, and side consoles tend to work well.',
            'If the room already carries strong lines, let the plant bring softness. If the room is already soft, let the clay bring structure.',
          ],
        },
        {
          heading: 'When to choose something else',
          paragraphs: [
            `If the space needs more vertical strength than softness, move toward ${snakePlant?.name || 'a snake plant pairing'} instead.`,
            'The point is not to copy what looks good online. The point is to choose the living form that solves the room you actually have.',
          ],
        },
      ],
      poemTitle: 'Closing verse',
      poemLines: [
        'In the morning light, the white bloom does not hurry.',
        'It opens like a greeting at the doorway.',
        'Where the clay holds still, the leaf learns peace.',
        'And the room begins to rest with it.',
      ],
      relatedLinks: [
        { label: 'For Interior Spaces', href: '/indoor' },
        peaceLily ? { label: peaceLily.name, href: `/product/${peaceLily.slug}` } : { label: 'Search products', href: '/search' },
      ],
    },
    {
      id: 'article:delivery-question',
      slug: 'the-two-day-delivery-question-everyone-asks',
      title: 'The Two-Day Delivery Question Everyone Asks',
      eyebrow: 'Editorial Journal',
      summary:
        'Here is the simple answer: standard paid orders are planned around two days, while custom work follows a longer studio rhythm. Knowing which route you are on makes the whole process calmer.',
      intro:
        `${deliveryPage.intro} The easiest buying experience is the one that feels clear before it feels fast.`,
      heroImage: outdoor?.image || resolveImage(aboutPage.studioImage.src),
      heroAlt: outdoor?.name || 'Terracotta order ready for delivery',
      keywords: uniqueKeywords([
        '2 days delivery',
        'custom order 21 days',
        'track order',
        'delivery question',
        deliveryPage.standardWindowText,
        deliveryPage.customWindowText,
      ]),
      newsletter: {
        subject: 'The two-day delivery question everyone asks',
        preheader: 'Standard orders and custom work follow different clocks. Here is the simple version.',
      },
      cta: {
        label: 'Track a Paid Order',
        href: '/delivery',
        text: 'If payment is already complete, use delivery tracking first. It is the fastest route to a clear answer.',
      },
      sections: [
        {
          heading: 'Standard orders move on a short window',
          paragraphs: [
            'For stocked pieces, the planning window is around two days after purchase. That gives enough room for confirmation, preparation, and dispatch without promising something careless.',
            'This timing is meant to protect the buying experience. Clear delivery beats vague speed every time.',
          ],
        },
        {
          heading: 'Custom work follows studio time',
          paragraphs: [
            'A custom brief is not a shelf item. It passes through material planning, making, drying, firing, and finishing. That is why the working window is around 21 days unless another timeline is agreed.',
            'That longer path is not delay for its own sake. It is what keeps the result honest.',
          ],
        },
        {
          heading: 'What to do if you need certainty',
          paragraphs: [
            'Use the delivery page for paid orders. Use Studio for custom questions. Use contact only when the first two routes still leave something unclear.',
            'The goal is to remove friction before worry starts. When the path is correct, the answer comes faster.',
          ],
        },
      ],
      poemTitle: 'Closing verse',
      poemLines: [
        'The road to market is short when the basket is ready.',
        'The road to craft is longer because the fire must speak.',
        'Still, both journeys arrive when the hand is patient.',
        'And what is well made never travels in fear.',
      ],
      relatedLinks: [
        { label: 'Delivery Tracking', href: '/delivery' },
        { label: 'Delivery and Returns', href: '/delivery-returns' },
      ],
    },
    {
      id: 'article:care-struggle',
      slug: 'what-to-do-when-a-plant-and-pot-pairing-starts-to-struggle',
      title: 'What to Do When a Plant-and-Pot Pairing Starts to Struggle',
      eyebrow: 'Editorial Journal',
      summary:
        'Most plant problems do not need panic. They need a simpler reading: too much water, poor light, trapped moisture, or a room that is asking for a different placement.',
      intro:
        `${careGuidePage.intro} The fastest fix usually starts with naming the problem gently and clearly.`,
      heroImage: snakePlant?.image || resolveImage(aboutPage.heroImage.src),
      heroAlt: snakePlant?.name || 'Plant care support at TuloPots',
      keywords: uniqueKeywords([
        'plant problem',
        'care guide',
        'yellow leaves',
        'terracotta marks',
        'upload challenge',
        careGuidePage.title,
        ...careGuidePage.troubleshooting.map((entry) => entry.title),
      ]),
      newsletter: {
        subject: 'What to do when a plant and pot pairing starts to struggle',
        preheader: 'Most issues become easier once the problem is named without panic.',
      },
      cta: {
        label: 'Open the Care Guide',
        href: '/care-guide',
        text: 'If the issue is visible, search the care guide first. If it still feels uncertain, upload the challenge and let us look at it with you.',
      },
      sections: [
        {
          heading: 'Do not diagnose everything at once',
          paragraphs: [
            'Start with one clue. A yellowing leaf. A dry edge. A base that stays wet too long. Terracotta usually helps because it gives you a more honest read of moisture than plastic does.',
            'Once you name the first clue, the next step becomes simpler.',
          ],
        },
        {
          heading: 'The usual causes are familiar',
          paragraphs: [
            careGuidePage.troubleshooting[0]?.text ||
              'Most common problems come from water rhythm, light mismatch, or airflow that is weaker than the plant needs.',
            careGuidePage.troubleshooting[1]?.text ||
              'Marks on terracotta, slow drainage, or tired leaves often mean the placement or watering rhythm needs a small correction instead of a dramatic rescue.',
          ],
        },
        {
          heading: 'When to ask for help',
          paragraphs: [
            'Ask for help when the problem has repeated after your first correction, or when the visual signs are too mixed to read with confidence.',
            `That is why ${contactPage.pathways[1]?.title || 'care support'} exists. The point is to make help feel easy, not technical.`,
          ],
        },
      ],
      poemTitle: 'Closing verse',
      poemLines: [
        'When a leaf bends low, the wise hand listens first.',
        'Rain and sun both teach, but never in one voice.',
        'So the grower waits, watches, and waters with sense.',
        'And the green returns by the patience of morning.',
      ],
      relatedLinks: [
        { label: 'Care Guide', href: '/care-guide' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      id: 'article:custom-space',
      slug: 'when-a-space-needs-something-custom-not-something-random',
      title: 'When a Space Needs Something Custom, Not Something Random',
      eyebrow: 'Editorial Journal',
      summary:
        'There comes a point where browsing is no longer the answer. If the room, project, or quantity has too many variables, the better path is a guided Studio brief.',
      intro:
        'Not every space should be solved by picking the nearest product card. Some rooms need listening first, then shape.',
      heroImage: resolveImage(aboutPage.studioImage.src),
      heroAlt: aboutPage.studioImage.alt,
      keywords: uniqueKeywords([
        'studio',
        'custom brief',
        'custom pot',
        'guided sourcing',
        'wholesale',
        'project help',
      ]),
      newsletter: {
        subject: 'When a space needs something custom, not something random',
        preheader: 'If browsing is starting to feel noisy, Studio is usually the better route.',
      },
      cta: {
        label: 'Begin a Studio Brief',
        href: '/studio',
        text: 'Use Studio when the project needs guidance, custom scale, multiple pieces, or a more intentional fit than an ordinary storefront decision.',
      },
      sections: [
        {
          heading: 'Browsing helps until it starts creating noise',
          paragraphs: [
            'A standard collection works well when the need is simple. One shelf. One entry. One room that already knows what it wants.',
            'But larger spaces, hospitality corners, client projects, and custom quantities usually need a quieter conversation before they need a cart.',
          ],
        },
        {
          heading: 'What Studio is really for',
          paragraphs: [
            'Studio is the guided route for placement help, custom briefs, sourcing support, and forms shaped around a real environment.',
            'It is not an admin form disguised as luxury. It is the part of the website built to make complex requests feel calm.',
          ],
        },
        {
          heading: 'What makes a good brief',
          paragraphs: [
            'A strong brief is simple. Tell us the type of space, what is not working yet, and whether you already have images, dimensions, or references.',
            'That is enough to begin. You do not need design jargon to ask for a better fit.',
          ],
        },
      ],
      poemTitle: 'Closing verse',
      poemLines: [
        'The weaver does not choose the thread before seeing the mat.',
        'The potter does not shape the neck before knowing the water.',
        'So the room speaks first, and the craft replies after.',
        'That is how form arrives with purpose.',
      ],
      relatedLinks: [
        { label: 'Studio', href: '/studio' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
  ];
}

export function getEditorialArticleBySlug(articles: EditorialArticle[], slug: string) {
  return articles.find((article) => article.slug === slug) || null;
}

export function buildNewsletterDraftText(article: EditorialArticle) {
  const body = [
    article.title,
    '',
    article.intro,
    '',
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      '',
    ]),
    `CTA: ${article.cta.label} — ${absoluteHref(article.cta.href)}`,
    article.cta.text,
    '',
    article.poemTitle,
    ...article.poemLines,
  ]
    .join('\n')
    .trim();

  return {
    subject: article.newsletter.subject,
    preheader: article.newsletter.preheader,
    body,
  };
}

export function buildNewsletterDraftHtml(article: EditorialArticle) {
  const sectionsHtml = article.sections
    .map(
      (section) => `
        <section style="margin:0 0 24px;">
          <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;margin:0 0 12px;color:#2d2018;">${htmlEscape(section.heading)}</h2>
          ${section.paragraphs
            .map(
              (paragraph) =>
                `<p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#4b3b32;">${htmlEscape(paragraph)}</p>`
            )
            .join('')}
        </section>`
    )
    .join('');

  const poemHtml = article.poemLines
    .map(
      (line) =>
        `<div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.7;color:#5a4335;">${htmlEscape(line)}</div>`
    )
    .join('');

  return `
    <div style="background:#f7f2ea;padding:40px 24px;font-family:Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#fffaf5;border-radius:28px;padding:40px 32px;border:1px solid #eadac9;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#b66a3c;font-weight:700;margin-bottom:12px;">
          ${htmlEscape(article.eyebrow)}
        </div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.08;margin:0 0 16px;color:#241711;">
          ${htmlEscape(article.title)}
        </h1>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.8;color:#4b3b32;">
          ${htmlEscape(article.intro)}
        </p>
        ${sectionsHtml}
        <section style="margin:0 0 28px;padding:24px;border-radius:22px;background:#efe4d8;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a4e2d;font-weight:700;margin-bottom:10px;">
            Continue
          </div>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#3f3029;">
            ${htmlEscape(article.cta.text)}
          </p>
          <a href="${htmlEscape(absoluteHref(article.cta.href))}" style="display:inline-block;background:#b66a3c;color:#fff8f2;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
            ${htmlEscape(article.cta.label)}
          </a>
        </section>
        <section style="border-top:1px solid #eadac9;padding-top:24px;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a4e2d;font-weight:700;margin-bottom:12px;">
            ${htmlEscape(article.poemTitle)}
          </div>
          ${poemHtml}
        </section>
      </div>
    </div>
  `.trim();
}
