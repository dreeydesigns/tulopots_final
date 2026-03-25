import { NextRequest, NextResponse } from 'next/server';
import { products, faqItems } from '@/lib/products';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function productSummary(product: any) {
  return `${product.name} — ${product.short}. Price: KSh ${Number(product.price).toLocaleString('en-KE')}. Category: ${product.category}.`;
}

function findMatchingProducts(text: string) {
  const q = text.toLowerCase();

  return products.filter((p: any) => {
    const haystack = [
      p.name,
      p.short,
      p.category,
      p.size,
      p.badge || '',
      p.description || '',
      p.cardDescription || '',
      p.details?.shape || '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q) || q.split(' ').some((word) => word.length > 2 && haystack.includes(word));
  });
}

function faqReply(text: string) {
  const q = text.toLowerCase();

  for (const [question, answer] of faqItems) {
    const qWords = question.toLowerCase().split(' ');
    if (qWords.some((w) => w.length > 3 && q.includes(w))) {
      return answer;
    }
  }

  return null;
}

function knowledgeReply(userText: string) {
  const text = userText.toLowerCase();

  // greeting
  if (['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'].some((g) => text.includes(g))) {
    return {
      reply:
        "Hello 🌿 I’m Tula, your TuloPots assistant. I can help you choose indoor pots, outdoor pots, pots only, care advice, or custom studio orders. What would you like help with?",
      needsHuman: false,
    };
  }

  // indoor help
  if (text.includes('indoor')) {
    const indoor = products.filter((p: any) => p.category === 'indoor').slice(0, 4);
    return {
      reply:
        `For indoor spaces, some beautiful options are:\n\n${indoor.map(productSummary).join('\n')}\n\nIf you want, tell me your room type — living room, office, bedroom, or kitchen — and I’ll narrow it down further.`,
      needsHuman: false,
    };
  }

  // outdoor help
  if (text.includes('outdoor')) {
    const outdoor = products.filter((p: any) => p.category === 'outdoor').slice(0, 4);
    return {
      reply:
        `For outdoor spaces, these are strong options:\n\n${outdoor.map(productSummary).join('\n')}\n\nIf you tell me whether it is a garden, balcony, patio, or entrance, I can guide you better.`,
      needsHuman: false,
    };
  }

  // pots only
  if (text.includes('pot only') || text.includes('pots only') || text.includes('without plant')) {
    const potsOnly = products.filter((p: any) => p.category === 'pots').slice(0, 4);
    return {
      reply:
        `Yes — we have a full Pots Only collection.\n\nHere are some examples:\n\n${potsOnly.map(productSummary).join('\n')}\n\nThese are great if you already have your own plant.`,
      needsHuman: false,
    };
  }

  // living room / space styling
  if (text.includes('living room')) {
    const picks = products.filter((p: any) =>
      ['indoor'].includes(p.category)
    ).slice(0, 3);

    return {
      reply:
        `For a living room, I’d suggest calm statement indoor pieces like:\n\n${picks.map(productSummary).join('\n')}\n\nIf you want a softer look, go for rounded shapes. If you want a cleaner modern look, choose cylinder or column styles.`,
      needsHuman: false,
    };
  }

  // custom / bulk / studio
  if (
    text.includes('custom') ||
    text.includes('studio') ||
    text.includes('bulk') ||
    text.includes('wholesale') ||
    text.includes('many pieces')
  ) {
    return {
      reply:
        `Yes — we do custom work through Studio Collection. You can share inspirations, quantity, styling direction, and dimensions, and the team can shape a more tailored brief for you.`,
      needsHuman: false,
    };
  }

  // care
  if (
    text.includes('care') ||
    text.includes('clean') ||
    text.includes('terracotta') ||
    text.includes('watering') ||
    text.includes('drainage')
  ) {
    const faq = faqReply(userText);
    return {
      reply:
        faq ||
        `Terracotta is breathable and naturally plant-friendly. Clean gently with a damp cloth, avoid harsh chemicals, and keep drainage open. You can also visit the Care Guide page for more support.`,
      needsHuman: false,
    };
  }

  // delivery
  if (text.includes('delivery') || text.includes('shipping')) {
    return {
      reply:
        `We deliver across Kenya. Nairobi deliveries are easier and faster, and larger orders may qualify for better delivery terms depending on order value and location.`,
      needsHuman: false,
    };
  }

  // payment
  if (text.includes('payment') || text.includes('mpesa') || text.includes('m-pesa') || text.includes('card')) {
    return {
      reply:
        `We support M-Pesa and card payment flows on the website. If you run into a payment issue, I can guide you first — and if needed, I’ll connect you to the TuloPots team.`,
      needsHuman: false,
    };
  }

  // prices
  if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
    const matched = findMatchingProducts(userText).slice(0, 4);

    if (matched.length) {
      return {
        reply:
          `Here are the closest matches I found:\n\n${matched.map(productSummary).join('\n')}`,
        needsHuman: false,
      };
    }

    return {
      reply:
        `Prices depend on the pot style, size, and whether you want it with a plant or as pot only. If you tell me the product name or the kind of space you are styling, I can narrow it down.`,
      needsHuman: false,
    };
  }

  // direct product search
  const matchedProducts = findMatchingProducts(userText).slice(0, 4);
  if (matchedProducts.length) {
    return {
      reply:
        `I found these relevant options:\n\n${matchedProducts.map(productSummary).join('\n')}\n\nIf you want, I can help you choose the best one for your space.`,
      needsHuman: false,
    };
  }

  // FAQ fallback
  const faq = faqReply(userText);
  if (faq) {
    return {
      reply: faq,
      needsHuman: false,
    };
  }

  // only now suggest human help
  return {
    reply:
      `I’m not fully sure from the website information alone. I can connect you to the TuloPots team on WhatsApp so they can continue the conversation properly.`,
    needsHuman: true,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || '';

    if (!lastUserMessage) {
      return NextResponse.json({
        reply:
          'Tell me what you need help with — indoor pots, outdoor pots, pots only, care guide, delivery, payment, or custom orders.',
        needsHuman: false,
      });
    }

    const result = knowledgeReply(lastUserMessage);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      reply:
        'I can help with products, care, delivery, payments, and custom orders. Tell me what you are looking for.',
      needsHuman: false,
    });
  }
}