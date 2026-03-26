import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/products';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const SITE_KNOWLEDGE = [
  {
    title: 'Indoor collection',
    route: '/indoor',
    keywords: ['indoor', 'living room', 'bedroom', 'office', 'inside', 'home'],
    content:
      'The indoor collection includes handcrafted terracotta pots paired with curated indoor plants for living rooms, bedrooms, offices, kitchens, and studios.',
  },
  {
    title: 'Outdoor collection',
    route: '/outdoor',
    keywords: ['outdoor', 'garden', 'patio', 'balcony', 'terrace', 'outside'],
    content:
      'The outdoor collection includes stronger terracotta pots for patios, balconies, entrances, courtyards, and gardens.',
  },
  {
    title: 'Pots only',
    route: '/pots',
    keywords: ['pots only', 'pot only', 'without plant', 'empty pot', 'just pot'],
    content:
      'The Pots Only collection is for customers who already have their own plant and only want the terracotta pot.',
  },
  {
    title: 'Care guide',
    route: '/care-guide',
    keywords: ['care', 'clean', 'terracotta', 'watering', 'drainage', 'maintenance'],
    content:
      'The Care Guide explains how to care for terracotta, indoor pairings, outdoor care, cleaning, and common troubleshooting.',
  },
  {
    title: 'Studio collection',
    route: '/studio',
    keywords: ['custom', 'studio', 'bulk', 'wholesale', 'many pieces', 'project', 'special order'],
    content:
      'Studio Collection is the custom order flow where users can share inspiration, quantities, dimensions, and styling direction.',
  },
  {
    title: 'Contact page',
    route: '/contact',
    keywords: ['contact', 'call', 'email', 'help', 'support'],
    content:
      'The contact page is the direct route when a customer needs team support, enquiries, or custom follow-up.',
  },
];

const FAQS = [
  {
    q: 'Are TuloPots really handmade?',
    a: 'Yes. Every pot is hand-thrown by artisans in Nairobi, so no two pieces are exactly alike.',
  },
  {
    q: 'Do your pots have drainage holes?',
    a: 'Plant-ready pots include drainage holes. Decorative and sculptural pieces may differ depending on the product.',
  },
  {
    q: 'How do I care for terracotta?',
    a: 'Clean gently with water and a soft cloth, avoid harsh chemicals, and keep drainage open. The Care Guide gives more help at /care-guide.',
  },
  {
    q: 'Do you deliver outside Nairobi?',
    a: 'Yes. TuloPots delivers across Kenya, while Nairobi delivery is usually easier and faster.',
  },
  {
    q: 'Can I order pots without plants?',
    a: 'Yes. Visit /pots for the full Pots Only collection.',
  },
  {
    q: 'Do you accept custom orders?',
    a: 'Yes. Use /studio to begin a Studio Collection custom-order brief.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'The website supports M-Pesa and card payment flows.',
  },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s/-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text: string) {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 2);
}

function scoreText(query: string, text: string) {
  const q = tokenize(query);
  const t = normalize(text);
  let score = 0;
  for (const word of q) {
    if (t.includes(word)) score += 1;
  }
  return score;
}

function getConversationTopic(messages: ChatMessage[]) {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.trim());
  const combined = userMessages.join(' ');
  return combined;
}

function resolveUserIntent(messages: ChatMessage[]) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || '';
  const previousUser =
    [...messages]
      .reverse()
      .filter((m) => m.role === 'user')
      .map((m) => m.content.trim())[1] || '';

  const genericReplies = ['yes', 'yes please', 'okay', 'ok', 'go on', 'continue', 'tell me more', 'please', 'sure'];
  const lower = normalize(lastUser);

  if (genericReplies.includes(lower) && previousUser) {
    return `${previousUser} ${lastUser}`;
  }

  return lastUser;
}

function findProductMatches(query: string) {
  const scored = products
    .map((p: any) => {
      const text = [
        p.name,
        p.short,
        p.category,
        p.size || '',
        p.badge || '',
        p.description || '',
        p.cardDescription || '',
        p.details?.shape || '',
      ].join(' ');
      return { product: p, score: scoreText(query, text) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return scored.map((x) => x.product);
}

function findKnowledgeMatches(query: string) {
  const scored = SITE_KNOWLEDGE
    .map((item) => {
      const text = `${item.title} ${item.route} ${item.keywords.join(' ')} ${item.content}`;
      return { item, score: scoreText(query, text) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.item);
}

function findFaqMatch(query: string) {
  const scored = FAQS
    .map((f) => ({
      faq: f,
      score: scoreText(query, `${f.q} ${f.a}`),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].faq : null;
}

function productLine(p: any) {
  return `• ${p.name} — KSh ${Number(p.price).toLocaleString('en-KE')} (${p.short}) → /product/${p.slug}`;
}

function groundedReply(messages: ChatMessage[]) {
  const intent = resolveUserIntent(messages);
  const topic = getConversationTopic(messages);
  const query = `${topic} ${intent}`.trim();
  const q = normalize(intent);

  if (!q) {
    return {
      reply:
        'Tell me what you need help with — indoor pots, outdoor pots, pots only, care, delivery, payment, or custom orders.',
      needsHuman: false,
    };
  }

  // explicit human handoff
  if (
    q.includes('whatsapp') ||
    q.includes('human') ||
    q.includes('agent') ||
    q.includes('talk to someone') ||
    q.includes('contact team')
  ) {
    return {
      reply:
        'Of course. I can hand this over to the TuloPots team so you can continue on WhatsApp.',
      needsHuman: true,
    };
  }

  // product retrieval
  const productMatches = findProductMatches(query);
  const knowledgeMatches = findKnowledgeMatches(query);
  const faqMatch = findFaqMatch(query);

  // living room / room styling
  if (q.includes('living room') || q.includes('bedroom') || q.includes('office') || q.includes('kitchen')) {
    const indoor = products.filter((p: any) => p.category === 'indoor').slice(0, 4);
    return {
      reply:
        `For that kind of indoor space, these are strong options:\n\n${indoor
          .map(productLine)
          .join('\n')}\n\nYou can browse more at /indoor. If you want, tell me whether you prefer rounded, tall, or minimal shapes and I’ll narrow it down further.`,
      needsHuman: false,
    };
  }

  // custom/studio
  if (
    q.includes('custom') ||
    q.includes('studio') ||
    q.includes('bulk') ||
    q.includes('wholesale') ||
    q.includes('project') ||
    q.includes('many pieces')
  ) {
    return {
      reply:
        'For custom or larger orders, use Studio Collection at /studio. That is where you can share inspiration, quantity, dimensions, and styling direction for a more tailored order.',
      needsHuman: false,
    };
  }

  // care / cleaning / terracotta
  if (
    q.includes('care') ||
    q.includes('clean') ||
    q.includes('terracotta') ||
    q.includes('watering') ||
    q.includes('drainage')
  ) {
    return {
      reply:
        faqMatch?.a ||
        'Terracotta is breathable and plant-friendly. Clean gently with a soft cloth and water, avoid harsh chemicals, and make sure drainage stays open. For more help, visit /care-guide.',
      needsHuman: false,
    };
  }

  // delivery
  if (q.includes('delivery') || q.includes('shipping')) {
    return {
      reply:
        'TuloPots delivers across Kenya. Nairobi delivery is usually easier and faster, while larger orders may qualify for better delivery terms depending on location and order value.',
      needsHuman: false,
    };
  }

  // payment
  if (q.includes('payment') || q.includes('mpesa') || q.includes('m-pesa') || q.includes('card')) {
    return {
      reply:
        'The website supports M-Pesa and card payment flows. If you are stuck during checkout, I can guide you first — and only if that does not solve it, I can hand you to the team on WhatsApp.',
      needsHuman: false,
    };
  }

  // direct FAQ
  if (faqMatch && faqMatch.q) {
    return {
      reply: faqMatch.a,
      needsHuman: false,
    };
  }

  // direct product results
  if (productMatches.length > 0) {
    return {
      reply:
        `Here are the closest matches I found from the website:\n\n${productMatches
          .map(productLine)
          .join('\n')}\n\nIf you want, tell me your space type or preferred size and I’ll narrow it down further.`,
      needsHuman: false,
    };
  }

  // direct route knowledge
  if (knowledgeMatches.length > 0) {
    const top = knowledgeMatches[0];
    return {
      reply: `${top.content}\n\nBest page to open: ${top.route}`,
      needsHuman: false,
    };
  }

  // only now human fallback
  return {
    reply:
      'I could not find a confident answer from the website knowledge alone. I can now connect you to the TuloPots team on WhatsApp so the conversation continues properly.',
    needsHuman: true,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];

    const result = groundedReply(messages);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      reply:
        'I can help with indoor pots, outdoor pots, pots only, care, delivery, payment, and custom orders. Tell me what you need.',
      needsHuman: false,
    });
  }
}