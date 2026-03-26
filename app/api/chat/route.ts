import { NextRequest, NextResponse } from 'next/server';
import { products, faqItems } from '@/lib/products';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatResult = {
  reply: string;
  needsHuman: boolean;
  cards?: Array<{
    title: string;
    subtitle?: string;
    route: string;
  }>;
};

const KNOWLEDGE_PAGES = [
  {
    title: 'Indoor Collection',
    route: '/indoor',
    text: 'Indoor terracotta pots and plant pairings for living rooms, bedrooms, offices, kitchens, and studios.',
  },
  {
    title: 'Outdoor Collection',
    route: '/outdoor',
    text: 'Outdoor terracotta pots for patios, balconies, gardens, entrances, terraces, and courtyards.',
  },
  {
    title: 'Pots Only',
    route: '/pots',
    text: 'Terracotta pots without plants for customers who already have their own plant.',
  },
  {
    title: 'Care Guide',
    route: '/care-guide',
    text: 'Terracotta care, cleaning, drainage, plant care, watering, and troubleshooting.',
  },
  {
    title: 'Studio Collection',
    route: '/studio',
    text: 'Custom orders, bulk orders, inspiration upload, dimensions, and styling direction.',
  },
  {
    title: 'FAQ',
    route: '/faq',
    text: 'Frequently asked questions about handmade quality, delivery, returns, pots only, and custom orders.',
  },
  {
    title: 'Contact',
    route: '/contact',
    text: 'Direct support and enquiries for follow-up.',
  },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s/-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function words(text: string) {
  return normalize(text).split(' ').filter((w) => w.length > 2);
}

function score(query: string, text: string) {
  const q = words(query);
  const hay = normalize(text);
  let total = 0;
  for (const w of q) {
    if (hay.includes(w)) total += 1;
  }
  return total;
}

function resolveQuery(messages: ChatMessage[]) {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.trim());
  const last = userMessages[userMessages.length - 1] || '';
  const prev = userMessages[userMessages.length - 2] || '';

  const followUps = ['yes', 'yes please', 'okay', 'ok', 'continue', 'go on', 'tell me more', 'please', 'sure'];
  if (followUps.includes(normalize(last)) && prev) {
    return `${prev} ${last}`;
  }

  return userMessages.join(' ');
}

function productCard(p: any) {
  return {
    title: p.name,
    subtitle: `KSh ${Number(p.price).toLocaleString('en-KE')}`,
    route: `/product/${p.slug}`,
  };
}

function productLine(p: any) {
  return `• ${p.name} — KSh ${Number(p.price).toLocaleString('en-KE')} → /product/${p.slug}`;
}

function findProducts(query: string) {
  return products
    .map((p: any) => ({
      product: p,
      score: score(
        query,
        [
          p.name,
          p.short,
          p.category,
          p.badge || '',
          p.description || '',
          p.cardDescription || '',
          p.sku || '',
        ].join(' ')
      ),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.product);
}

function findPages(query: string) {
  return KNOWLEDGE_PAGES
    .map((p) => ({
      page: p,
      score: score(query, `${p.title} ${p.route} ${p.text}`),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.page);
}

function findFaq(query: string) {
  const ranked = [...faqItems]
    .map(([q, a]) => ({
      q,
      a,
      score: score(query, `${q} ${a}`),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score > 0 ? ranked[0] : null;
}

function groundedReply(messages: ChatMessage[]): ChatResult {
  const query = resolveQuery(messages);
  const q = normalize(query);

  if (!q) {
    return {
      reply: 'Tell me what you need help with — indoor pots, outdoor pots, pots only, care, delivery, payment, or custom orders.',
      needsHuman: false,
    };
  }

  if (q === 'hello' || q === 'hi' || q === 'hey') {
    return {
      reply: 'Hello 🌿 What would you like help with today — indoor, outdoor, pots only, care, payment, or custom orders?',
      needsHuman: false,
      cards: [
        { title: 'Indoor Collection', route: '/indoor' },
        { title: 'Outdoor Collection', route: '/outdoor' },
        { title: 'Pots Only', route: '/pots' },
      ],
    };
  }

  if (
    q.includes('whatsapp') ||
    q.includes('human') ||
    q.includes('agent') ||
    q.includes('talk to someone')
  ) {
    return {
      reply: 'Of course. I can hand this over to the TuloPots team on WhatsApp.',
      needsHuman: true,
    };
  }

  if (
    q.includes('living room') ||
    q.includes('bedroom') ||
    q.includes('office') ||
    q.includes('kitchen')
  ) {
    const indoor = products.filter((p: any) => p.category === 'indoor').slice(0, 3);
    return {
      reply:
        `For that kind of indoor space, these are strong options:\n\n${indoor.map(productLine).join('\n')}\n\nYou can also browse /indoor.`,
      needsHuman: false,
      cards: indoor.map(productCard),
    };
  }

  if (
    q.includes('custom') ||
    q.includes('studio') ||
    q.includes('bulk') ||
    q.includes('wholesale') ||
    q.includes('project')
  ) {
    return {
      reply: 'For custom or larger orders, the best place to start is Studio Collection.',
      needsHuman: false,
      cards: [{ title: 'Studio Collection', subtitle: 'Custom orders', route: '/studio' }],
    };
  }

  if (
    q.includes('care') ||
    q.includes('clean') ||
    q.includes('terracotta') ||
    q.includes('watering') ||
    q.includes('drainage')
  ) {
    const faq = findFaq(query);
    return {
      reply:
        faq?.a ||
        'Terracotta is breathable and plant-friendly. Clean gently with a soft cloth and water, avoid harsh chemicals, and keep drainage open.',
      needsHuman: false,
      cards: [{ title: 'Care Guide', subtitle: 'Plant & pot support', route: '/care-guide' }],
    };
  }

  if (q.includes('delivery') || q.includes('shipping')) {
    return {
      reply:
        'TuloPots delivers across Kenya. Nairobi delivery is usually easier and faster, and larger orders may qualify for better delivery terms depending on value and location.',
      needsHuman: false,
      cards: [{ title: 'Contact', subtitle: 'Delivery help', route: '/contact' }],
    };
  }

  if (q.includes('payment') || q.includes('mpesa') || q.includes('m-pesa') || q.includes('card')) {
    return {
      reply:
        'The website supports M-Pesa and card payment flows. If checkout gives you trouble, I can guide you first before handing you to the team.',
      needsHuman: false,
      cards: [{ title: 'Cart / Checkout', subtitle: 'Payment flow', route: '/cart' }],
    };
  }

  const faq = findFaq(query);
  if (faq) {
    return {
      reply: faq.a,
      needsHuman: false,
      cards: [{ title: 'FAQ', subtitle: 'More answers', route: '/faq' }],
    };
  }

  const matchedProducts = findProducts(query);
  if (matchedProducts.length > 0) {
    return {
      reply:
        `Here are the closest matches I found:\n\n${matchedProducts.map(productLine).join('\n')}\n\nIf you want, tell me your space type, preferred size, or whether you want it with a plant or as pot only.`,
      needsHuman: false,
      cards: matchedProducts.map(productCard),
    };
  }

  const matchedPages = findPages(query);
  if (matchedPages.length > 0) {
    const top = matchedPages[0];
    return {
      reply: `${top.text}\n\nBest page to open: ${top.route}`,
      needsHuman: false,
      cards: matchedPages.slice(0, 3).map((p) => ({
        title: p.title,
        route: p.route,
      })),
    };
  }

  return {
    reply:
      'I could not find a confident answer from the website knowledge base alone. I can now continue this with the TuloPots team on WhatsApp.',
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
      reply: 'I can help with products, care, delivery, payment, and custom orders. Tell me what you need.',
      needsHuman: false,
    });
  }
}