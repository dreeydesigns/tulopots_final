import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/products';
import { CHAT_FAQS, CHAT_KNOWLEDGE } from '@/lib/chat-knowledge';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s/-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function words(text: string) {
  return normalize(text).split(' ').filter((w) => w.length > 2);
}

function score(query: string, text: string) {
  const qWords = words(query);
  const hay = normalize(text);
  let total = 0;
  for (const w of qWords) {
    if (hay.includes(w)) total += 1;
  }
  return total;
}

function getResolvedIntent(messages: ChatMessage[]) {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.trim());
  const last = userMessages[userMessages.length - 1] || '';
  const previous = userMessages[userMessages.length - 2] || '';

  const genericFollowUps = ['yes', 'yes please', 'okay', 'ok', 'continue', 'go on', 'tell me more', 'please', 'sure'];

  if (genericFollowUps.includes(normalize(last)) && previous) {
    return `${previous} ${last}`;
  }

  return userMessages.join(' ');
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

function findKnowledge(query: string) {
  return CHAT_KNOWLEDGE
    .map((item) => ({
      item,
      score: score(query, `${item.title} ${item.route} ${item.content}`),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

function findFaq(query: string) {
  const ranked = CHAT_FAQS
    .map((f) => ({
      faq: f,
      score: score(query, `${f.q} ${f.a}`),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score > 0 ? ranked[0].faq : null;
}

function groundedReply(messages: ChatMessage[]) {
  const query = getResolvedIntent(messages);
  const q = normalize(query);

  if (!q) {
    return {
      reply:
        'Tell me what you need help with — indoor pots, outdoor pots, pots only, care guide, delivery, payment, or custom orders.',
      needsHuman: false,
    };
  }

  if (q === 'hello' || q === 'hi' || q === 'hey') {
    return {
      reply:
        'Hello 🌿 I can help you choose the right TuloPots product, answer care questions, explain delivery or payment, and guide custom orders. What would you like help with?',
      needsHuman: false,
    };
  }

  if (
    q.includes('whatsapp') ||
    q.includes('human') ||
    q.includes('agent') ||
    q.includes('talk to someone')
  ) {
    return {
      reply: 'Of course. I can continue this with the TuloPots team on WhatsApp.',
      needsHuman: true,
    };
  }

  if (
    q.includes('living room') ||
    q.includes('bedroom') ||
    q.includes('office') ||
    q.includes('kitchen')
  ) {
    const indoor = products.filter((p: any) => p.category === 'indoor').slice(0, 4);
    return {
      reply:
        `For that type of indoor space, these are strong options:\n\n${indoor
          .map(productLine)
          .join('\n')}\n\nYou can browse more at /indoor. If you want, tell me whether you prefer rounded, tall, or minimal shapes and I’ll narrow it down further.`,
      needsHuman: false,
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
      reply:
        'For custom or larger orders, use /studio. That is where you can share inspiration, quantity, dimensions, and styling direction for a more tailored brief.',
      needsHuman: false,
    };
  }

  const faq = findFaq(query);
  if (faq) {
    return {
      reply: faq.a,
      needsHuman: false,
    };
  }

  const matchedProducts = findProducts(query);
  if (matchedProducts.length > 0) {
    return {
      reply:
        `Here are the closest matches I found from the website:\n\n${matchedProducts
          .map(productLine)
          .join('\n')}\n\nIf you want, tell me your space type, preferred size, or whether you want it with a plant or as pot only.`,
      needsHuman: false,
    };
  }

  const matchedKnowledge = findKnowledge(query);
  if (matchedKnowledge.length > 0) {
    const top = matchedKnowledge[0];
    return {
      reply: `${top.content}\n\nBest page to open: ${top.route}`,
      needsHuman: false,
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
      reply:
        'I can help with products, care, delivery, payment, and custom orders. Tell me what you need.',
      needsHuman: false,
    });
  }
}