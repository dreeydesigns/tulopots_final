import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCatalogProducts, getSiteSections } from '@/lib/catalog';
import { products as staticProducts } from '@/lib/products';
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

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to', 'do', 'be',
  'of', 'and', 'or', 'for', 'with', 'you', 'me', 'my', 'we', 'us',
  'what', 'how', 'can', 'i', 'are', 'have', 'has', 'was', 'will',
  'that', 'this', 'your', 'our', 'about', 'from', 'get', 'tell',
  'show', 'give', 'any', 'some', 'which', 'who', 'when', 'where',
  'does', 'did', 'do', 'please', 'would', 'could', 'should', 'want',
  'need', 'like', 'help', 'know', 'see', 'look', 'find', 'go',
  'ni', 'ya', 'na', 'si', 'wa', 'kwa', 'la', 'za', 'au', 'pia',
]);

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
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
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
      if (leftWord === rightWord) { hits += 1; break; }
      if (leftWord.length > 3 && rightWord.length > 3) {
        if (leftWord.startsWith(rightWord.slice(0, 3)) || rightWord.startsWith(leftWord.slice(0, 3))) {
          hits += 0.7; break;
        }
      }
    }
  }
  return hits / Math.max(leftWords.length, rightWords.length, 1);
}

function resolveIntent(messages: ChatMessage[]) {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.trim());
  const last = userMessages[userMessages.length - 1] || '';
  const previous = userMessages[userMessages.length - 2] || '';
  const followUps = ['yes', 'yes please', 'okay', 'ok', 'continue', 'go on', 'tell me more', 'please', 'sure'];
  if (followUps.includes(normalize(last)) && previous) return `${previous} ${last}`;
  return userMessages.join(' ');
}

function productCard(product: any): ChatCard {
  return {
    title: product.name,
    subtitle: `${formatPrice(product.price)} · ${
      product.category === 'indoor' ? 'For Interior Spaces' :
      product.category === 'outdoor' ? 'For Open Spaces' : 'Clay Forms'
    }`,
    route: `/product/${product.slug}`,
  };
}

function productLine(product: any) {
  return `• ${product.name} — ${formatPrice(product.price)} → /product/${product.slug}`;
}

function findFaq(query: string) {
  return CHAT_FAQS
    .map((faq) => ({ faq, score: similarity(query, `${faq.q} ${faq.a}`) }))
    .filter((e) => e.score > 0.18)
    .sort((a, b) => b.score - a.score)[0]?.faq;
}

function searchProducts(query: string, products: any[]) {
  return products
    .map((product) => {
      const haystack = [
        product.name, product.short || '', product.category,
        product.badge || '', product.description || '',
        product.cardDescription || '', product.sku || '',
        product.details?.shape || '', product.details?.finish || '',
      ].join(' ');
      return { product, score: similarity(query, haystack) };
    })
    .filter((e) => e.score > 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((e) => e.product);
}

function searchKnowledge(query: string, visibleRoutes: Set<string>) {
  return CHAT_KNOWLEDGE
    .filter((e) => visibleRoutes.has(e.route) || e.route.startsWith('/product'))
    .map((entry) => {
      const haystack = `${entry.title} ${entry.route} ${entry.text} ${(entry.tags || []).join(' ')}`;
      return { entry, score: similarity(query, haystack) };
    })
    .filter((e) => e.score > 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((e) => e.entry);
}

function buildGeminiSystemPrompt(): string {
  const productList = staticProducts.map((p) =>
    `• ${p.name} (${p.category}, ${p.size}) — ${formatPrice(p.price)}${p.potOnly ? ` | pot only: ${formatPrice(p.potOnly)}` : ''} — /product/${p.slug}`
  ).join('\n');

  const faqText = CHAT_FAQS.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');

  const knowledgeText = CHAT_KNOWLEDGE.map((k) => `[${k.title}] ${k.text}`).join('\n\n');

  return `You are TuloPots Assistant, the AI-powered helper for TuloPots — a premium handcrafted terracotta brand based in Nairobi, Kenya.

BRAND:
TuloPots creates handcrafted terracotta pots and plant pairings from 100% natural Kenyan clay, hand-thrown by skilled artisans in Nairobi. Each piece is unique. Collections: Indoor (/indoor), Outdoor (/outdoor), Pots Only/Clay Forms (/pots), Studio custom orders (/studio).

FULL PRODUCT CATALOG:
${productList}

KNOWLEDGE BASE:
${knowledgeText}

FREQUENTLY ASKED QUESTIONS:
${faqText}

DELIVERY & SHIPPING:
- Nairobi: 2 business days standard delivery
- Free delivery on all Nairobi orders above KSh 5,000
- Nationwide Kenya delivery available (timelines vary by location)
- No international shipping currently

PAYMENT METHODS:
- M-Pesa (STK push sent to your phone number at checkout)
- Card (Visa/Mastercard via Stripe — secure checkout)

RETURNS & REFUNDS:
- 30-day satisfaction guarantee on all clay pieces
- Contact team if item arrives damaged or not as described
- Refunds processed within 5-7 business days

STUDIO / CUSTOM ORDERS:
Available at /studio for signed-in customers. Upload inspiration, share dimensions and quantity. Master potter shapes to brief. Timeline: 2-4 weeks. Perfect for interior projects, gifts, and large quantities.

LANGUAGE:
You understand and respond fluently in both English and Kiswahili. Detect the user's language and reply in the same language. If they mix languages, reply in English. Common Swahili terms: bei=price, tuma=send/deliver, malipo=payment, sufuria=pot, maua=plant/flowers, kurudi=return, amri=order, bure=free, haraka=fast.

RESPONSE FORMAT:
Always return valid JSON — no markdown fences, no extra text. Format:
{"reply":"Your helpful response here","needsHuman":false,"cards":[{"title":"Name","subtitle":"Description","route":"/path"}]}

CARDS: Include 1-3 relevant product or page cards. Use exact /product/[slug] routes from the catalog.

SET needsHuman=true ONLY when:
- Customer complains about a damaged or lost received order
- Asking about a specific existing order number they placed
- Complex custom studio requirements needing human design input
- You genuinely cannot answer with the information provided above
- Customer explicitly requests to speak to a human

Be warm, concise, and brand-aligned. Always give exact KSh prices from the catalog. Never invent products or prices not listed above.`;
}

async function callGemini(
  messages: ChatMessage[],
  context?: ChatContext
): Promise<ChatResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const userMessages = messages.filter((m) => m.role !== 'system');
    const historyMessages = userMessages.slice(0, -1);
    const latestMessage = userMessages[userMessages.length - 1];

    if (!latestMessage) return null;

    const history = historyMessages.map((m) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }],
    }));

    const contextNote = context?.pathname
      ? `\n[User is currently on page: ${context.pathname}]`
      : '';

    const chat = model.startChat({
      systemInstruction: buildGeminiSystemPrompt(),
      history,
    });

    const result = await chat.sendMessage(latestMessage.content + contextNote);
    const text = result.response.text();

    const parsed = JSON.parse(text);

    return {
      reply: String(parsed.reply || ''),
      needsHuman: Boolean(parsed.needsHuman),
      cards: Array.isArray(parsed.cards)
        ? parsed.cards.slice(0, 3).map((c: any) => ({
            title: String(c.title || ''),
            subtitle: c.subtitle ? String(c.subtitle) : undefined,
            route: String(c.route || '/'),
          }))
        : [],
    };
  } catch (err) {
    console.error('[chat-engine] Gemini error:', err);
    return null;
  }
}

export async function getChatReply(
  messages: ChatMessage[],
  context?: ChatContext
): Promise<ChatResult> {
  const lastUserMsg = messages.filter((m) => m.role === 'user').at(-1)?.content || '';
  const normalizedQuery = normalize(lastUserMsg);

  if (!normalizedQuery) {
    return {
      reply: 'Ask me about a clay form, care guidance, delivery timing, order tracking, or Studio support.',
      needsHuman: false,
      cards: [],
    };
  }

  const geminiResult = await callGemini(messages, context);
  if (geminiResult) return geminiResult;

  const query = lastUserMsg;

  const [products, sections] = await Promise.all([
    getCatalogProducts({ visibleOnly: true }),
    getSiteSections(),
  ]);
  const visibleRoutes = new Set(
    sections.filter((s) => s.visible && s.route).map((s) => s.route!)
  );
  visibleRoutes.add('/');
  visibleRoutes.add('/indoor');
  visibleRoutes.add('/outdoor');
  visibleRoutes.add('/pots');
  visibleRoutes.add('/studio');
  visibleRoutes.add('/faq');
  visibleRoutes.add('/cart');
  visibleRoutes.add('/care-guide');
  visibleRoutes.add('/delivery-returns');
  visibleRoutes.add('/contact');
  visibleRoutes.add('/search');

  if (['hello', 'hi', 'hey', 'habari', 'jambo', 'karibu'].includes(normalizedQuery)) {
    return {
      reply: 'Tell me what you are trying to do and I will search the website with you: find a clay form, track an order, compare pieces, review care guidance, or reach the studio team.',
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
      reply: 'You can check the latest delivery progress from the order tracking flow. Paid standard orders are planned around a 2-day delivery window for Nairobi, while custom work follows a longer studio timeline.',
      needsHuman: false,
      cards: [
        { title: 'Track an Order', subtitle: 'Order progress and delivery timing', route: '/delivery' },
        { title: 'Delivery & Returns', subtitle: 'Policy and delivery windows', route: '/delivery-returns' },
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
      reply: 'Studio is the right place for custom work, larger briefs, and emotionally-led guidance on what belongs in a space. Timeline is typically 2-4 weeks.',
      needsHuman: false,
      cards: [{ title: 'Studio', subtitle: 'Custom orders and briefs', route: '/studio' }],
    };
  }

  if (
    normalizedQuery.includes('payment') ||
    normalizedQuery.includes('mpesa') ||
    normalizedQuery.includes('m-pesa') ||
    normalizedQuery.includes('card') ||
    normalizedQuery.includes('malipo')
  ) {
    return {
      reply: 'The checkout flow supports both M-Pesa (STK push) and card payment (Visa/Mastercard). Nairobi orders above KSh 5,000 get free delivery.',
      needsHuman: false,
      cards: [
        { title: 'Cart', subtitle: 'Proceed to checkout', route: '/cart' },
        { title: 'Track an Order', subtitle: 'Confirm whether payment landed', route: '/delivery' },
      ],
    };
  }

  if (
    normalizedQuery.includes('care') ||
    normalizedQuery.includes('watering') ||
    normalizedQuery.includes('drainage') ||
    normalizedQuery.includes('clean') ||
    normalizedQuery.includes('yellow')
  ) {
    const faq = findFaq(query);
    return {
      reply: faq?.a || 'Terracotta is breathable and dries faster than sealed surfaces. Balance watering with light, airflow, and drainage. Visit /care-guide for the full plant-by-plant guide.',
      needsHuman: false,
      cards: [
        { title: 'Care Guide', subtitle: 'Plant and terracotta guidance', route: '/care-guide' },
        { title: 'Contact', subtitle: 'Ask the team directly', route: '/contact' },
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
      reply: `These are the closest matches I found:\n\n${matchedProducts.map(productLine).join('\n')}\n\nTell me the space, preferred size, or whether you want a full pairing or just the clay form.`,
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
      cards: matchedKnowledge.map((entry) => ({ title: entry.title, route: entry.route })),
    };
  }

  return {
    reply: 'I could not find a confident answer. I can pass this into WhatsApp with the TuloPots team so it does not get lost.',
    needsHuman: true,
    cards: [],
  };
}
