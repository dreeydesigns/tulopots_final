import { NextRequest, NextResponse } from 'next/server';

type Message = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = `You are Tula, the friendly AI assistant for TuloPots — a handcrafted terracotta pot and plant shop based in Nairobi, Kenya.

You help customers with:
- Finding the right pot or plant for their space
- Pot sizes, care instructions, pricing
- Delivery, orders, and payment questions (M-Pesa and card accepted)
- Custom/studio orders and commissions

Key facts:
- Free delivery on orders over KES 5,000
- Standard delivery: KES 350
- Delivery within Nairobi (2–3 days), outside Nairobi (3–5 days)
- Payment: M-Pesa STK Push or Stripe card
- WhatsApp: +254700000000
- Based in Nairobi, Kenya, EST. 2016

Keep responses warm, concise, and helpful. If someone wants to buy or enquire about a specific product, encourage them to share their name and phone so the team can follow up on WhatsApp.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Demo mode — smart canned responses
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Hi! I'm Tula 🌿 I'm here to help you find the perfect pot or plant. What are you looking for today?";

      if (lastMsg.includes('price') || lastMsg.includes('cost') || lastMsg.includes('how much'))
        reply = "Our pots range from KES 800 to KES 8,500 depending on size. Plants + pot combos start from KES 1,200. Delivery is KES 350 (free over KES 5,000). Shall I help you find something specific?";
      else if (lastMsg.includes('delivery') || lastMsg.includes('shipping'))
        reply = "We deliver within Nairobi in 2–3 days, and outside Nairobi in 3–5 days. Delivery is KES 350, free on orders over KES 5,000. 🚚";
      else if (lastMsg.includes('mpesa') || lastMsg.includes('pay') || lastMsg.includes('payment'))
        reply = "We accept M-Pesa (STK Push directly to your phone) and card payments via Stripe. Both are available at checkout. Need help placing an order?";
      else if (lastMsg.includes('indoor'))
        reply = "Our indoor collection includes Maidenhair Ferns, Peace Lilies, Snake Plants, and more — all paired with our handcrafted terracotta. Browse at /indoor or I can describe specific plants!";
      else if (lastMsg.includes('outdoor'))
        reply = "Our outdoor range includes Lavender, Rosemary, Bird of Paradise, and more. All come in weather-treated terracotta. Check /outdoor for the full range!";
      else if (lastMsg.includes('hello') || lastMsg.includes('hi') || lastMsg.includes('hey'))
        reply = "Hello! I'm Tula 🌿 Welcome to TuloPots, handcrafted in Nairobi. Are you looking for indoor plants, outdoor pots, or something custom?";

      return NextResponse.json({ reply, mocked: true });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'AI API error');

    const reply = data.content?.[0]?.text || "I'm having trouble responding right now. Please WhatsApp us at +254700000000.";
    return NextResponse.json({ reply, mocked: false });
  } catch (error: any) {
    console.error('[chat] error:', error);
    return NextResponse.json(
      { reply: "Sorry, I'm having a moment. Please WhatsApp us at +254700000000 for immediate help! 🌿", error: error?.message },
      { status: 200 } // Return 200 so the chat doesn't break on the frontend
    );
  }
}
