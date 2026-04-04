import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { whatsappSchema, sanitizeMultilineText, sanitizeText } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/whatsapp',
      limit: 10,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many WhatsApp handoff attempts were made. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = whatsappSchema.safeParse(await req.json());

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/whatsapp',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('Please share the contact details needed for WhatsApp handoff.', 400);
    }

    const waNumber = process.env.WHATSAPP_NUMBER || '254700000000';
    const name = sanitizeText(parsed.data.name, 120) || 'Not provided';
    const phone = sanitizeText(parsed.data.phone, 40) || 'Not provided';
    const email = sanitizeText(parsed.data.email, 180) || 'Not provided';
    const summary = sanitizeMultilineText(parsed.data.summary, 2500) || 'General enquiry';

    const message = [
      '*New TuloPots Support Handoff*',
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      '',
      'What they need:',
      summary,
      '',
      'Sent via TuloPots support assistant',
    ].join('\n');

    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ ok: true, waLink, message });
  } catch (error) {
    return jsonError(getSafeErrorMessage(error, 'Unable to continue on WhatsApp right now.'), 500);
  }
}
