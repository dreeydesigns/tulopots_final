import { products } from '@/lib/products';
import { CHAT_FAQS, CHAT_KNOWLEDGE } from './chat-knowledge';

export type ChatCard = {
  title: string;
  subtitle?: string;
  route: string;
};

export type ChatResult = {
  reply: string;
  needsHuman: boolean;
  cards: ChatCard[];
};

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(text: string) {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 1);
}

function formatPrice(price: number | string) {
  return `KSh ${Number(price).toLocaleString('en-KE')}`;
}

function productCard(product: any): ChatCard {
  return {
    title: product.name,
    subtitle: formatPrice(product.price),
    route: `/product/${product.slug}`,
  };
}

function productLine(product: any) {
  return `• ${product.name} — ${formatPrice(product.price)} → /product/${product.slug}`;
}

function similarity(a: string, b: string) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.includes(y) || y.includes(x)) return 0.9;

  const ax = words(x);
  const by = words(y);
  let hits = 0;

  for (const wa of ax) {
    for (const wb of by) {
      if (wa === wb) {
        hits += 1;
        break;
      }
      if (wa.length > 3 && wb.length > 3) {
        if (wa.startsWith(wb.slice(0, 3)) || wb.startsWith(wa.slice(0, 3))) {
          hits += 0.7;
          break;
        }
        if (wa.includes(wb.slice(0, 4)) || wb.includes(wa.slice(0, 4))) {
          hits += 0.6;
          break;
        }
      }
    }
  }

  return hits / Math.max(ax.length, by.length, 1);
}

function resolveIntent(messages: ChatMessage[]) {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.trim());

  const last = userMessages[userMessages.length - 1] || '';
  const previous = userMessages[userMessages.length - 2] || '';

  const followUps = ['yes', 'yes please', 'okay', 'ok', 'continue', 'go on', 'tell me more', 'please', 'sure'];

  if (followUps.includes(normalize(last)) && previous) {
    return `${previous} ${last}`;
  }

  return userMessages.join(' ');
}

function findProducts(query: string) {
  return products
    .map((product: any) => {
      const haystack = [
        product.name,
        product.short || '',
        product.category,
        product.badge || '',
        product.description || '',
        product.cardDescription || '',
        product.sku || '',
      ].join(' ');

      return {
        product,
        score: similarity(query, haystack),
      };
    })
    .filter((x) => x.score > 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.product);
}

function findKnowledge(query: string) {
  return CHAT_KNOWLEDGE
    .map((entry) => {
      const haystack = `${entry.title} ${entry.route} ${entry.text} ${(entry.tags || []).join(' ')}`;
      return {
        entry,
        score: similarity(query, haystack),
      };
    })
    .filter((x) => x.score > 0.18)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.entry);
}

function findFaq(query: string) {
  return CHAT_FAQS
    .map((faq) => ({
      faq,
      score: similarity(query, `${faq.q} ${faq.a}`),
    }))
    .filter((x) => x.score > 0.18)
    .sort((a, b) => b.score - a.score)[0]?.faq;
}

export function getChatReply(messages: ChatMessage[]): ChatResult {
  const query = resolveIntent(messages);
  const q = normalize(query);

  if (!q) {
    return {
      reply:
        'Tell me what you need help with — indoor pots, outdoor pots, pots only, care, payment, delivery, or custom orders.',
      needsHuman: false,
      cards: [],
    };
  }

  if (['hello', 'hi', 'hey'].includes(q)) {
    return {
      reply:
        'Hello 🌿 What would you like help with today — indoor, outdoor, pots only, care, payment, or custom orders?',
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
      reply:
        'Of course. I can continue this with the TuloPots team on WhatsApp.',
      needsHuman: true,
      cards: [],
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
        `For that type of indoor space, these are strong options:\n\n${indoor
          .map(productLine)
          .join('\n')}\n\nYou can browse more at /indoor.`,
      needsHuman: false,
      cards: indoor.map(productCard),
    };
  }

  if (
    q.includes('custom') ||
    q.includes('studio') ||
    q.includes('bulk') ||
    q.includes('project') ||
    q.includes('wholesale')
  ) {
    return {
      reply:
        'For custom or larger orders, the best place to start is Studio Collection.',
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
        'TuloPots delivers across Kenya. Nairobi delivery is usually easier and faster, and larger orders may qualify for better delivery terms depending on order value and location.',
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
        `Here are the closest matches I found:\n\n${matchedProducts
          .map(productLine)
          .join('\n')}\n\nIf you want, tell me your space type, preferred size, or whether you want it with a plant or as pot only.`,
      needsHuman: false,
      cards: matchedProducts.map(productCard),
    };
  }

  const matchedKnowledge = findKnowledge(query);
  if (matchedKnowledge.length > 0) {
    const top = matchedKnowledge[0];
    return {
      reply: `${top.text}\n\nBest page to open: ${top.route}`,
      needsHuman: false,
      cards: matchedKnowledge.slice(0, 3).map((entry) => ({
        title: entry.title,
        route: entry.route,
      })),
    };
  }

  return {
    reply:
      'I could not find a confident answer from the website knowledge base alone. I can now continue this with the TuloPots team on WhatsApp.',
    needsHuman: true,
    cards: [],
  };
}