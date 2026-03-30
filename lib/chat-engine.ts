import { getCatalogProducts, getSiteSections } from '@/lib/catalog';
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

type ChatContext = {
  pathname?: string;
  search?: string;
  accountType?: 'guest' | 'customer' | 'admin';
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
    .filter((word) => word.length > 1);
}

function formatPrice(price: number | string) {
  return `KSh ${Number(price).toLocaleString('en-KE')}`;
}

function similarity(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.9;

  const leftWords = words(left);
  const rightWords = words(right);
  let hits = 0;

  for (const leftWord of leftWords) {
    for (const rightWord of rightWords) {
      if (leftWord === rightWord) {
        hits += 1;
        break;
      }

      if (leftWord.length > 3 && rightWord.length > 3) {
        if (
          leftWord.startsWith(rightWord.slice(0, 3)) ||
          rightWord.startsWith(leftWord.slice(0, 3))
        ) {
          hits += 0.7;
          break;
        }
      }
    }
  }

  return hits / Math.max(leftWords.length, rightWords.length, 1);
}

function resolveIntent(messages: ChatMessage[]) {
  const userMessages = messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content.trim());
  const last = userMessages[userMessages.length - 1] || '';
  const previous = userMessages[userMessages.length - 2] || '';
  const followUps = ['yes', 'yes please', 'okay', 'ok', 'continue', 'go on', 'tell me more', 'please', 'sure'];

  if (followUps.includes(normalize(last)) && previous) {
    return `${previous} ${last}`;
  }

  return userMessages.join(' ');
}

function productCard(product: any): ChatCard {
  return {
    title: product.name,
    subtitle: `${formatPrice(product.price)} · ${product.category === 'indoor' ? 'For Interior Spaces' : product.category === 'outdoor' ? 'For Open Spaces' : 'Clay Forms'}`,
    route: `/product/${product.slug}`,
  };
}

function productLine(product: any) {
  return `• ${product.name} — ${formatPrice(product.price)} → /product/${product.slug}`;
}

function findFaq(query: string) {
  return CHAT_FAQS
    .map((faq) => ({
      faq,
      score: similarity(query, `${faq.q} ${faq.a}`),
    }))
    .filter((entry) => entry.score > 0.18)
    .sort((left, right) => right.score - left.score)[0]?.faq;
}

function searchProducts(query: string, products: any[]) {
  return products
    .map((product) => {
      const haystack = [
        product.name,
        product.short || '',
        product.category,
        product.badge || '',
        product.description || '',
        product.cardDescription || '',
        product.sku || '',
        product.details?.shape || '',
        product.details?.finish || '',
      ].join(' ');

      return {
        product,
        score: similarity(query, haystack),
      };
    })
    .filter((entry) => entry.score > 0.18)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((entry) => entry.product);
}

function searchKnowledge(query: string, visibleRoutes: Set<string>) {
  return CHAT_KNOWLEDGE
    .filter((entry) => visibleRoutes.has(entry.route) || entry.route.startsWith('/product'))
    .map((entry) => {
      const haystack = `${entry.title} ${entry.route} ${entry.text} ${(entry.tags || []).join(' ')}`;
      return {
        entry,
        score: similarity(query, haystack),
      };
    })
    .filter((entry) => entry.score > 0.18)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((entry) => entry.entry);
}

function getContextPrompt(context?: ChatContext) {
  const parts = [];

  if (context?.pathname) {
    parts.push(`Current page: ${context.pathname}`);
  }

  if (context?.search) {
    parts.push(`Current search: ${context.search}`);
  }

  if (context?.accountType) {
    parts.push(`Account type: ${context.accountType}`);
  }

  return parts.join(' · ');
}

export async function getChatReply(
  messages: ChatMessage[],
  context?: ChatContext
): Promise<ChatResult> {
  const query = resolveIntent(messages);
  const normalizedQuery = normalize(query);
  const [products, sections] = await Promise.all([
    getCatalogProducts({ visibleOnly: true }),
    getSiteSections(),
  ]);
  const visibleRoutes = new Set(
    sections.filter((section) => section.visible && section.route).map((section) => section.route!)
  );
  visibleRoutes.add('/care-guide');
  visibleRoutes.add('/delivery-returns');
  visibleRoutes.add('/terms');
  visibleRoutes.add('/privacy-policy');
  visibleRoutes.add('/contact');
  visibleRoutes.add('/search');

  if (!normalizedQuery) {
    return {
      reply:
        'Ask me about a clay form, care guidance, delivery timing, order tracking, or Studio support.',
      needsHuman: false,
      cards: [],
    };
  }

  if (['hello', 'hi', 'hey'].includes(normalizedQuery)) {
    return {
      reply:
        'Tell me what you are trying to do and I will search the website with you: find a form, track an order, compare pieces, review care guidance, or reach the studio team.',
      needsHuman: false,
      cards: [
        { title: 'Search', subtitle: 'Find a clay form', route: '/search' },
        { title: 'Care Guide', subtitle: 'Plant and terracotta help', route: '/care-guide' },
        { title: 'Studio', subtitle: 'Custom work and briefs', route: '/studio' },
      ],
    };
  }

  if (
    normalizedQuery.includes('track') ||
    normalizedQuery.includes('where is my order') ||
    normalizedQuery.includes('delivery status')
  ) {
    return {
      reply:
        'You can check the latest delivery progress from the order tracking flow. Paid standard orders are planned around a 2-day delivery window, while custom work follows a longer studio timeline.',
      needsHuman: false,
      cards: [
        { title: 'Track an Order', subtitle: 'Order progress and delivery timing', route: '/delivery' },
        { title: 'Delivery & Returns', subtitle: 'Policy and delivery windows', route: '/delivery-returns' },
      ],
    };
  }

  if (
    normalizedQuery.includes('account') ||
    normalizedQuery.includes('settings') ||
    normalizedQuery.includes('notifications')
  ) {
    const accountType = context?.accountType || 'guest';
    return {
      reply:
        accountType === 'guest'
          ? 'You will need to sign in before you can manage settings, saved pieces, and notification preferences.'
          : `You can manage profile details, delivery preferences, and notification channels from Settings. ${getContextPrompt(context)}`.trim(),
      needsHuman: false,
      cards: accountType === 'guest'
        ? [{ title: 'Sign in', subtitle: 'Open the account flow', route: '/settings' }]
        : [
            { title: 'Settings', subtitle: 'Profile and notification controls', route: '/settings' },
            { title: 'Profile', subtitle: 'Saved pieces and account view', route: '/profile' },
          ],
    };
  }

  if (
    normalizedQuery.includes('studio') ||
    normalizedQuery.includes('custom') ||
    normalizedQuery.includes('bulk') ||
    normalizedQuery.includes('project')
  ) {
    return {
      reply:
        'Studio is the right place for custom work, larger briefs, and emotionally-led guidance on what belongs in a space.',
      needsHuman: false,
      cards: [{ title: 'Studio', subtitle: 'Custom orders and briefs', route: '/studio' }],
    };
  }

  if (
    normalizedQuery.includes('care') ||
    normalizedQuery.includes('watering') ||
    normalizedQuery.includes('terracotta') ||
    normalizedQuery.includes('drainage') ||
    normalizedQuery.includes('yellow leaves')
  ) {
    const faq = findFaq(query);
    return {
      reply:
        faq?.a ||
        'Terracotta is breathable and dries faster than sealed surfaces, so balance watering with light, airflow, and drainage rather than following a rigid routine.',
      needsHuman: false,
      cards: [
        { title: 'Care Guide', subtitle: 'Search support and upload a challenge', route: '/care-guide' },
        { title: 'Contact', subtitle: 'Ask the team directly', route: '/contact' },
      ],
    };
  }

  if (
    normalizedQuery.includes('payment') ||
    normalizedQuery.includes('mpesa') ||
    normalizedQuery.includes('m-pesa') ||
    normalizedQuery.includes('card')
  ) {
    return {
      reply:
        'The checkout flow supports both M-Pesa and card payment. If something failed during checkout, I can send you to cart or order tracking next.',
      needsHuman: false,
      cards: [
        { title: 'Cart', subtitle: 'Retry checkout', route: '/cart' },
        { title: 'Track an Order', subtitle: 'Confirm whether payment landed', route: '/delivery' },
      ],
    };
  }

  const faq = findFaq(query);
  if (faq) {
    return {
      reply: faq.a,
      needsHuman: false,
      cards: [{ title: 'FAQ', subtitle: 'More website answers', route: '/faq' }],
    };
  }

  const matchedProducts = searchProducts(query, products);
  if (matchedProducts.length) {
    return {
      reply:
        `These are the closest matches I found on the website:\n\n${matchedProducts
          .map(productLine)
          .join('\n')}\n\nIf you want, tell me the space, preferred size, or whether you want a full pairing or only the clay form.${getContextPrompt(context) ? `\n\n${getContextPrompt(context)}` : ''}`,
      needsHuman: false,
      cards: matchedProducts.map(productCard),
    };
  }

  const matchedKnowledge = searchKnowledge(query, visibleRoutes);
  if (matchedKnowledge.length) {
    const top = matchedKnowledge[0];
    return {
      reply: `${top.text}\n\nBest page to open: ${top.route}`,
      needsHuman: false,
      cards: matchedKnowledge.map((entry) => ({
        title: entry.title,
        route: entry.route,
      })),
    };
  }

  return {
    reply:
      'I could not find a confident answer from the live website content alone. I can pass this into WhatsApp with the TuloPots team so it does not get lost.',
    needsHuman: true,
    cards: [],
  };
}
