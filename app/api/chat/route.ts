import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getChatReply } from '@/lib/chat-engine';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { chatSchema, sanitizeMultilineText } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';
import { addSupportMessage, addSupportSummary, createSupportThread, queueSupportFollowUps } from '@/lib/support';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/chat',
      limit: 20,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'The help guide is getting a lot of requests right now. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = chatSchema.safeParse(await req.json());

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/chat',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('Please send a valid help message.', 400);
    }

    const sessionUser = await getCurrentUser();
    const context = {
      pathname: parsed.data.pathname,
      search: parsed.data.search,
      accountType:
        parsed.data.accountType ||
        (sessionUser?.isAdmin ? 'admin' : sessionUser ? 'customer' : 'guest'),
    } as const;

    const result = await getChatReply(parsed.data.messages, context);

    if (result.needsHuman) {
      const userMessages = parsed.data.messages
        .filter((message) => message.role === 'user')
        .map((message) => message.content);
      const latestMessage = sanitizeMultilineText(userMessages[userMessages.length - 1] || '', 2000);
      const combinedSummary = sanitizeMultilineText(
        userMessages.slice(-4).join('\n'),
        3000
      );

      const thread = await createSupportThread({
        source: 'CHATBOT',
        customerName: sessionUser?.name || null,
        customerEmail: sessionUser?.email || null,
        customerPhone: sessionUser?.phone || null,
        userId: sessionUser?.id || null,
        summary: combinedSummary,
        tagsJson: {
          pathname: context.pathname,
          accountType: context.accountType,
        },
      });

      await addSupportMessage({
        threadId: thread.id,
        role: 'CUSTOMER',
        channel: 'CHATBOT',
        body: latestMessage || combinedSummary,
        metaJson: {
          conversation: parsed.data.messages.slice(-8),
        },
      });

      await addSupportSummary({
        threadId: thread.id,
        intent: 'chatbot_escalation',
        shortSummary: result.reply,
        suggestedNextStep: 'Continue the conversation through WhatsApp or email with a direct human follow-up.',
        confidence: 0.82,
      });

      await queueSupportFollowUps({
        threadId: thread.id,
        customerEmail: sessionUser?.email,
        customerPhone: sessionUser?.phone,
        summary: combinedSummary,
        needsHuman: true,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      reply:
        getSafeErrorMessage(
          error,
          'I can help with products, care, delivery, payment, and custom orders. Tell me what you need.'
        ),
      needsHuman: false,
      cards: [],
    });
  }
}
