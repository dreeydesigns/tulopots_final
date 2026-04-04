import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { contactSchema, sanitizeMultilineText, sanitizeText, sanitizeUrl } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';
import { addSupportMessage, addSupportSummary, createSupportThread, queueSupportFollowUps } from '@/lib/support';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/contact',
      limit: 8,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many messages were sent from this connection. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const formData = await req.formData();
    const parsed = contactSchema.safeParse({
      company: String(formData.get('company') ?? ''),
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      subject: String(formData.get('subject') ?? ''),
      message: String(formData.get('message') ?? ''),
      context: String(formData.get('context') ?? ''),
      imageUrl: String(formData.get('imageUrl') ?? ''),
    });

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/contact',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('Please fill in your name, email, and message.', 400);
    }

    if (parsed.data.company) {
      return NextResponse.json({ ok: true, message: 'Thanks, we received your message.' });
    }

    const name = sanitizeText(parsed.data.name, 120);
    const email = sanitizeText(parsed.data.email.toLowerCase(), 180);
    const subject = sanitizeText(parsed.data.subject || 'General support', 160);
    const message = sanitizeMultilineText(parsed.data.message, 3000);
    const context = sanitizeText(parsed.data.context, 220);
    const imageUrl = sanitizeUrl(parsed.data.imageUrl);

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        context: context || null,
        imageUrl: imageUrl || null,
      },
    });

    const thread = await createSupportThread({
      source: 'CONTACT',
      customerName: name,
      customerEmail: email,
      legacyContactMessageId: contactMessage.id,
      summary: `${subject}: ${message}`,
      tagsJson: {
        context,
      },
    });

    await addSupportMessage({
      threadId: thread.id,
      role: 'CUSTOMER',
      channel: 'CONTACT_FORM',
      body: message,
      metaJson: {
        subject,
        context,
        imageUrl,
      },
    });

    await addSupportSummary({
      threadId: thread.id,
      intent: 'contact_support',
      shortSummary: `${name} needs help with ${subject.toLowerCase()}.`,
      suggestedNextStep: 'Review the support thread and respond with a clear next step.',
      confidence: 0.78,
    });

    await queueSupportFollowUps({
      threadId: thread.id,
      customerEmail: email,
      summary: `${subject}: ${message}`,
      needsHuman: true,
    });

    const response = NextResponse.json({
      ok: true,
      message: `Thanks ${name}, we received your message.`,
      supportThreadId: thread.id,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return jsonError(getSafeErrorMessage(error, 'Could not send message.'), 500);
  }
}
