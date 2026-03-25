import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function fallbackReply(userText: string) {
  const text = userText.toLowerCase();

  if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
    return `Our prices depend on the pot style, size, and whether you want it with a plant or as pot only. You can browse Indoor, Outdoor, or Pots Only, and I can also help narrow down the right option for your space.`;
  }

  if (text.includes('indoor')) {
    return `For indoor styling, our most loved choices are Ribbed Globe, Pedestal Bowl, Cylinder Vase, and Wide Rim Planter. If you tell me your room type — living room, office, bedroom, or kitchen — I can suggest the best fit.`;
  }

  if (text.includes('outdoor')) {
    return `For outdoor spaces, we usually recommend stronger statement forms like Studio Collection, Ribbed Cylinder XL, Round Belly, and Belly Pot Large. These work well for patios, terraces, gardens, and entrances.`;
  }

  if (text.includes('care') || text.includes('clean') || text.includes('terracotta')) {
    return `Terracotta is breathable and plant-friendly. Clean gently with water and a soft cloth, avoid harsh chemicals, and make sure drainage stays open. You can also visit our Care Guide page for full support.`;
  }

  if (
    text.includes('custom') ||
    text.includes('studio') ||
    text.includes('bulk') ||
    text.includes('many pieces') ||
    text.includes('wholesale')
  ) {
    return `Yes — we do custom and studio orders. You can use Studio Collection to share inspiration, quantity, and the look you want, and we will shape a guided brief from there.`;
  }

  if (text.includes('delivery') || text.includes('shipping')) {
    return `We deliver across Kenya. Nairobi delivery is easier and faster, and larger orders may qualify for better delivery terms depending on the total order value.`;
  }

  return `I can help you choose the right TuloPots piece for your space. Tell me whether you want indoor, outdoor, pots only, or a custom studio order — and if possible, share your space type or style.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || '';

    if (!lastUserMessage) {
      return NextResponse.json({
        reply: 'Tell me what you are looking for — indoor, outdoor, pots only, care help, or a custom studio order.',
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: fallbackReply(lastUserMessage),
      });
    }

    const systemPrompt = `
You are Tulo, the TuloPots assistant.

Brand:
- TuloPots is a Nairobi-based handcrafted terracotta brand
- Tone: calm, premium, warm, helpful, short, human
- Never sound robotic or overexcited
- Keep replies concise and elegant
- Focus on helping the customer choose the right pot, plant pairing, care advice, or custom order path

Rules:
- Recommend indoor, outdoor, or pots-only depending on what the user needs
- Mention Studio Collection for custom or bulk orders
- Mention Care Guide when the question is about care, watering, or terracotta maintenance
- If the user seems ready to buy, encourage them to open a product or continue to cart
- If the user sounds confused, ask one simple guiding question
- Keep most replies under 120 words
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        reply: fallbackReply(lastUserMessage),
      });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() || fallbackReply(lastUserMessage);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({
      reply: 'I can help with indoor pots, outdoor styling, care tips, or custom orders. Tell me what you are looking for.',
    });
  }
}