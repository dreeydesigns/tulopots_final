import { NextRequest, NextResponse } from 'next/server';
import { getChatReply } from '@/lib/chat-engine';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];

    const result = getChatReply(messages);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      reply:
        'I can help with products, care, delivery, payment, and custom orders. Tell me what you need.',
      needsHuman: false,
      cards: [],
    });
  }
}