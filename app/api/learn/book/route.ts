import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { sanitizeMultilineText, sanitizeText } from '@/lib/security/validation';
import { addSupportMessage, addSupportSummary, createSupportThread } from '@/lib/support';

const CLASS_LABELS: Record<string, string> = {
  'open-wheel': 'Open Wheel (2.5 hrs · KSh 3,500)',
  'first-touch': 'First Touch (2 hrs · KSh 2,800)',
  'clay-and-kids': 'Clay & Kids (90 min · KSh 2,200/child)',
  'two-at-the-wheel': 'Two at the Wheel — Couples (2.5 hrs · KSh 7,500/pair)',
  'studio-visits': 'Studio Visits — Schools & Groups',
  '8-week-course': '8-Week Clay Course (KSh 22,000)',
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/learn/book',
      limit: 6,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError('Too many requests. Please wait a moment and try again.', 429, {
        retryAfter: rateLimit.retryAfterSeconds,
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError('Invalid request body.', 400);
    }

    const name = sanitizeText(String(body.name ?? ''), 120).trim();
    const email = sanitizeText(String(body.email ?? '').toLowerCase(), 180).trim();
    const phone = sanitizeText(String(body.phone ?? ''), 30).trim();
    const classId = sanitizeText(String(body.classId ?? ''), 60).trim();
    const preferredDate = sanitizeText(String(body.preferredDate ?? ''), 60).trim();
    const groupSize = sanitizeText(String(body.groupSize ?? ''), 10).trim();
    const notes = sanitizeMultilineText(String(body.notes ?? ''), 1000).trim();

    if (!name || !email || !classId) {
      return jsonError('Name, email, and class selection are required.', 400);
    }

    const classLabel = CLASS_LABELS[classId] ?? classId;

    const summary = [
      `Class: ${classLabel}`,
      preferredDate ? `Date: ${preferredDate}` : '',
      groupSize ? `Group size: ${groupSize}` : '',
      notes ? `Notes: ${notes}` : '',
    ]
      .filter(Boolean)
      .join(' · ');

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: `Studio Class Booking — ${classLabel}`,
        message: summary,
        context: 'learn-booking-form',
      },
    });

    const thread = await createSupportThread({
      source: 'CONTACT',
      customerName: name,
      customerEmail: email,
      legacyContactMessageId: contact.id,
      summary: `Class booking: ${classLabel}`,
      tagsJson: { classId, phone, preferredDate, groupSize },
    });

    await addSupportMessage({
      threadId: thread.id,
      role: 'CUSTOMER',
      channel: 'CONTACT_FORM',
      body: summary,
      metaJson: { classId, classLabel, phone, preferredDate, groupSize, notes },
    });

    await addSupportSummary({
      threadId: thread.id,
      intent: 'studio_class_booking',
      shortSummary: `${name} wants to book ${classLabel}.`,
      suggestedNextStep: 'Confirm availability and send payment details to the customer.',
      confidence: 0.92,
    });

    const response = NextResponse.json({
      ok: true,
      message: `Thanks ${name}! We've received your booking request for ${classLabel}. We'll be in touch within 24 hours to confirm your spot.`,
      supportThreadId: thread.id,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return jsonError(getSafeErrorMessage(error, 'Could not send booking request.'), 500);
  }
}
