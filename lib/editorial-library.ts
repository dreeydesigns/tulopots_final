export type EditorialLibraryImageRef = {
  src: string;
  alt: string;
};

export type EditorialLibrarySection = {
  heading: string;
  paragraphs: string[];
};

export type EditorialLibraryLink = {
  label: string;
  href: string;
};

export type EditorialLibraryArticle = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  intro: string;
  visible: boolean;
  heroImage: EditorialLibraryImageRef;
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
  sections: EditorialLibrarySection[];
  poemTitle: string;
  poemLines: string[];
  relatedLinks: EditorialLibraryLink[];
};

export type EditorialLibraryContent = {
  eyebrow: string;
  title: string;
  intro: string;
  articles: EditorialLibraryArticle[];
};

export const defaultEditorialLibraryContent: EditorialLibraryContent = {
  eyebrow: 'TuloPots Journal',
  title: 'Articles that explain the room behind the choice.',
  intro:
    'Clear reads on clay forms, placement, care, delivery, and Studio guidance. Each article stays easy to follow, easy to share, and easy to revisit from search.',
  articles: [
    {
      slug: 'why-beautiful-rooms-still-feel-unfinished',
      title: 'Why Beautiful Rooms Still Feel Unfinished',
      eyebrow: 'Editorial Journal',
      summary:
        'A room can have good furniture, strong lighting, and still feel like it is waiting for something. That missing layer is usually presence.',
      intro:
        'Some rooms look complete but still feel emotionally light. The issue is rarely another accent piece. The issue is usually the absence of one grounded form that settles the room.',
      visible: true,
      heroImage: {
        src: 'indoor1',
        alt: 'A grounded clay form placed in an interior space',
      },
      keywords: [
        'unfinished room',
        'space feels empty',
        'presence',
        'interior styling',
        'calm room',
        'clay form',
      ],
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
            'Many spaces have every practical piece in place. The lighting works. The seating works. The palette works. Yet the room still feels like it has no breath.',
            'That quiet absence is rarely solved by adding more objects. It is solved by placing something that brings weight, texture, and calm at the same time.',
          ],
        },
        {
          heading: 'Presence is what makes a room feel inhabited',
          paragraphs: [
            'Terracotta carries the memory of earth into a finished room. That is why the warmth feels believable instead of staged.',
            'When the form is right, the room stops asking for more. It becomes quieter without becoming empty.',
          ],
        },
        {
          heading: 'What to place first',
          paragraphs: [
            'Begin with a corner that already has light but no anchor: a console, a shelf, an entry, or a bedside surface that feels visually thin.',
            'Choose one form and let it do less, not more. Premium rooms usually feel expensive because they are edited well, not because they are filled well.',
          ],
        },
      ],
      poemTitle: 'Closing Lines',
      poemLines: [
        'When the calabash leaves the mat,',
        'the hut keeps its walls but loses its calm.',
        'Place what gives the room its breath.',
      ],
      relatedLinks: [
        { label: 'View Clay Forms', href: '/pots' },
        { label: 'Read About TuloPots', href: '/about' },
      ],
    },
    {
      slug: 'before-you-buy-another-accent-piece-read-this',
      title: 'Before You Buy Another Accent Piece, Read This',
      eyebrow: 'Editorial Journal',
      summary:
        'The difference between clutter and calm is usually one disciplined choice. Not every room needs another object.',
      intro:
        'Some rooms already have enough visual activity. They do not need more novelty. They need one material choice that slows the room down.',
      visible: true,
      heroImage: {
        src: 'productStudio',
        alt: 'A refined terracotta form styled with restraint',
      },
      keywords: [
        'accent piece',
        'clutter',
        'calm room',
        'pot only',
        'plant pairing',
        'editing a room',
      ],
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
            'Some rooms already have enough movement. They do not need another loud layer. They need one honest form that brings balance.',
            'That is why a clay form works better than a random accent piece. It adds shape and warmth without introducing visual noise.',
          ],
        },
        {
          heading: 'How to choose between pot only and placed with plant',
          paragraphs: [
            'Choose pot only when you already know the plant you want, or when the room needs shape first and greenery second.',
            'Choose the placed version when you want the room to feel resolved immediately. It removes one more decision and brings the mood in a single step.',
          ],
        },
        {
          heading: 'The easier test',
          paragraphs: [
            'Ask a simple question: do I need an object, or do I need a finished moment?',
            'If it is the first, start with clay only. If it is the second, choose the placed pairing and let the room arrive faster.',
          ],
        },
      ],
      poemTitle: 'Closing Lines',
      poemLines: [
        'The wise weaver leaves space between threads,',
        'because beauty is not made by crowding.',
        'Choose the one form that quiets the room.',
      ],
      relatedLinks: [
        { label: 'Open Clay Forms', href: '/pots' },
        { label: 'For Interior Spaces', href: '/indoor' },
      ],
    },
    {
      slug: 'the-peace-lily-rule-that-changes-a-room-fast',
      title: 'The Peace Lily Rule That Changes a Room Fast',
      eyebrow: 'Editorial Journal',
      summary:
        'When you want calm without visual effort, start with a softer plant pairing that settles quickly into the room.',
      intro:
        'There are forms that announce themselves, and there are forms that steady a room quietly. A softer plant pairing belongs to the second group.',
      visible: true,
      heroImage: {
        src: 'indoor2',
        alt: 'A calm plant pairing placed indoors',
      },
      keywords: [
        'peace lily',
        'interior pairing',
        'living room styling',
        'bedroom styling',
        'quiet room',
      ],
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
          heading: 'Why this pairing works quickly',
          paragraphs: [
            'The right pairing softens a room fast because it brings both shape and life without feeling decorative for decoration’s sake.',
            'A quieter plant line works well where you want relief, not noise.',
          ],
        },
        {
          heading: 'Where to place it',
          paragraphs: [
            'Think of bedroom corners, side tables, reading spaces, and living room edges that already have light but feel unfinished.',
            'The best placement is usually the one that settles the room instead of taking over it.',
          ],
        },
        {
          heading: 'What to avoid',
          paragraphs: [
            'Do not force a soft pairing into a crowded surface. Give it breathing space.',
            'If the room is already busy, edit first. Then let the form do the quieter work.',
          ],
        },
      ],
      poemTitle: 'Closing Lines',
      poemLines: [
        'Rain does not shout to soften the earth.',
        'It falls, and the ground remembers itself.',
        'Choose the form that calms without effort.',
      ],
      relatedLinks: [
        { label: 'See Interior Spaces', href: '/indoor' },
        { label: 'Read the Care Guide', href: '/care-guide' },
      ],
    },
    {
      slug: 'the-two-day-delivery-question-everyone-asks',
      title: 'The Two-Day Delivery Question Everyone Asks',
      eyebrow: 'Editorial Journal',
      summary:
        'Standard paid orders are planned around a two-day delivery window, while custom Studio work follows a longer making rhythm.',
      intro:
        'Delivery becomes calmer when the timing is clear. Standard orders and custom work do not move at the same pace, and the right expectation protects both the customer and the craft.',
      visible: true,
      heroImage: {
        src: 'outdoor1',
        alt: 'Editorial delivery moment for a terracotta order',
      },
      keywords: [
        'delivery time',
        '2 days delivery',
        '21 day custom order',
        'tracking',
        'dispatch',
      ],
      newsletter: {
        subject: 'The two-day delivery question everyone asks',
        preheader: 'What moves in two days, what takes longer, and why that difference matters.',
      },
      cta: {
        label: 'Track a Paid Order',
        href: '/delivery',
        text: 'Use the delivery page for paid orders and the Studio route for custom timelines. The correct path gives you the clearest answer fastest.',
      },
      sections: [
        {
          heading: 'What the two-day window means',
          paragraphs: [
            'Paid standard orders are planned around a two-day delivery window after purchase. That is the operating target we communicate clearly.',
            'Access, destination, and final coordination can shift the exact handover time, but the two-day promise is the normal path for standard fulfilled orders.',
          ],
        },
        {
          heading: 'Why custom work follows a different clock',
          paragraphs: [
            'A custom brief is not a shelf item. It passes through planning, making, drying, firing, and finishing.',
            'That longer path is not delay for its own sake. It is what keeps the result honest. That is why custom work is planned around twenty-one days unless another schedule is agreed.',
          ],
        },
        {
          heading: 'How to get the clearest answer',
          paragraphs: [
            'Use the delivery page for paid orders. Use Studio for custom questions.',
            'The goal is to remove friction before worry starts. When the route is correct, the answer comes faster.',
          ],
        },
      ],
      poemTitle: 'Closing Lines',
      poemLines: [
        'The millet in the pot and the seed in the soil',
        'do not answer to the same morning.',
        'Know which rhythm your order belongs to.',
      ],
      relatedLinks: [
        { label: 'Open Delivery Tracking', href: '/delivery' },
        { label: 'Delivery and Returns', href: '/delivery-returns' },
      ],
    },
    {
      slug: 'what-to-do-when-a-plant-and-pot-pairing-starts-to-struggle',
      title: 'What to Do When a Plant and Pot Pairing Starts to Struggle',
      eyebrow: 'Editorial Journal',
      summary:
        'Most care issues become easier once the problem is named without panic. Start with one clue, not every clue at once.',
      intro:
        'When a pairing begins to look tired, the first mistake is often emotional overcorrection. The better move is to slow down and name the first visible clue clearly.',
      visible: true,
      heroImage: {
        src: 'productStudio',
        alt: 'A plant and terracotta pairing receiving care attention',
      },
      keywords: [
        'care help',
        'yellow leaves',
        'watering',
        'plant problem',
        'terracotta care',
      ],
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
            'Start with one clue: a yellowing leaf, a dry edge, or a base that stays wet too long.',
            'Once you name the first clue, the next step becomes simpler. Terracotta helps because it gives you a more honest read of moisture than plastic does.',
          ],
        },
        {
          heading: 'The usual causes are familiar',
          paragraphs: [
            'Most common problems come from water rhythm, light mismatch, or airflow that is weaker than the plant needs.',
            'Marks on terracotta, slow drainage, or tired leaves often mean the placement or watering rhythm needs a small correction instead of a dramatic rescue.',
          ],
        },
        {
          heading: 'When to ask for help',
          paragraphs: [
            'Ask for help when the problem repeats after your first correction, or when the visual signs are too mixed to read with confidence.',
            'The point of care support is to make help feel easy, not technical.',
          ],
        },
      ],
      poemTitle: 'Closing Lines',
      poemLines: [
        'The healer listens first to one drum,',
        'then hears the whole village clearly.',
        'Start with one sign, and the answer will open.',
      ],
      relatedLinks: [
        { label: 'Open the Care Guide', href: '/care-guide' },
        { label: 'Contact Support', href: '/contact' },
      ],
    },
    {
      slug: 'when-a-space-needs-something-custom-not-something-random',
      title: 'When a Space Needs Something Custom, Not Something Random',
      eyebrow: 'Editorial Journal',
      summary:
        'If browsing is starting to feel noisy, Studio is usually the better route. Some spaces need guidance before they need a cart.',
      intro:
        'A standard collection works well when the need is simple. But larger rooms, client projects, hospitality corners, and custom quantities usually need a quieter conversation first.',
      visible: true,
      heroImage: {
        src: 'workshop',
        alt: 'Clay work in the studio preparing custom forms',
      },
      keywords: [
        'studio',
        'custom order',
        'brief',
        'designer help',
        'guided sourcing',
        'bespoke',
      ],
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
            'A standard collection works well when the need is simple: one shelf, one entry, or one room that already knows what it wants.',
            'But larger spaces and custom quantities usually need a calmer conversation before they need a cart.',
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
      poemTitle: 'Closing Lines',
      poemLines: [
        'The elder carves for the doorway he has seen,',
        'not for the doorway he imagines.',
        'When the space is specific, let the answer be shaped for it.',
      ],
      relatedLinks: [
        { label: 'Open Studio', href: '/studio' },
        { label: 'Contact TuloPots', href: '/contact' },
      ],
    },
  ],
};
