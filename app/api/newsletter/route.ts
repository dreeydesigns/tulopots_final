import { NextRequest, NextResponse } from 'next/server';
import { syncNewsletterSubscriberToHubSpot } from '@/lib/hubspot';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { newsletterSchema, sanitizeText } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';

async function parseNewsletterRequest(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('form-data')) {
    const form = await req.formData();
    return {
      company: String(form.get('company') ?? ''),
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      preferredChannel: String(form.get('preferredChannel') ?? 'email'),
      source: String(form.get('source') ?? 'footer'),
      interests: form
        .getAll('interests')
        .map((item) => String(item).trim())
        .filter(Boolean),
    };
  }

  const body = await req.json().catch(() => ({}));
  return {
    company: String(body?.company ?? ''),
    name: String(body?.name ?? ''),
    email: String(body?.email ?? ''),
    preferredChannel: String(body?.preferredChannel ?? 'email'),
    source: String(body?.source ?? 'footer'),
    interests: Array.isArray(body?.interests)
      ? body.interests.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [],
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/newsletter',
      limit: 10,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many newsletter signups were sent from this connection. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = newsletterSchema.safeParse(await parseNewsletterRequest(req));

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/newsletter',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('A valid email address is required.', 400);
    }

    if (parsed.data.company) {
      return NextResponse.json({ ok: true, message: 'Thanks! You are subscribed.' });
    }

    const name = sanitizeText(parsed.data.name, 120);
    const email = sanitizeText(parsed.data.email.toLowerCase(), 180);
    const preferredChannel = sanitizeText(parsed.data.preferredChannel, 40) || 'email';
    const source = sanitizeText(parsed.data.source, 80) || 'footer';
    const interests = parsed.data.interests.map((entry) => sanitizeText(entry, 80)).filter(Boolean);

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {
        name: name || undefined,
        preferredChannel,
        interests,
        source,
      },
      create: {
        email,
        name: name || null,
        preferredChannel,
        interests,
        source,
      },
    });

    let marketingSync: Awaited<ReturnType<typeof syncNewsletterSubscriberToHubSpot>> | null = null;

    try {
      marketingSync = await syncNewsletterSubscriberToHubSpot({
        email,
        name,
        preferredChannel,
        interests,
        source,
      });
    } catch (error) {
      console.error('[api/newsletter] hubspot sync failed:', error);
    }

    const response = NextResponse.json({
      ok: true,
      message: 'You are on the list. We will send only the kind of updates you asked for.',
      marketingSync,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return jsonError(getSafeErrorMessage(error, 'Could not subscribe.'), 500);
  }
}
