import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
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
    const sessionUser = await getCurrentUser();
    const context = {
      pathname: typeof body?.pathname === 'string' ? body.pathname : undefined,
      search: typeof body?.search === 'string' ? body.search : undefined,
      accountType:
        (body?.accountType as 'guest' | 'customer' | 'admin' | undefined) ||
        (sessionUser?.isAdmin ? 'admin' : sessionUser ? 'customer' : 'guest'),
    };

    const result = await getChatReply(messages, context);

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
