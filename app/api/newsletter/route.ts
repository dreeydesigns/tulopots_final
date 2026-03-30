import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/newsletter
//
// Handles newsletter signups.  Expects a single `email` field (as form
// data or JSON).  If the email is valid, it is stored (or updated) in the
// `NewsletterSubscriber` table.  We return a simple acknowledgement so the
// frontend can show a confirmation message.  Duplicate signups do not
// create multiple records; the existing subscriber is preserved.

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let email = '';
    let name = '';
    let company = '';
    let preferredChannel = 'email';
    let source = 'footer';
    let interests: string[] = [];

    // Determine if the request is multipart/form-data or JSON
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('form-data')) {
      const form = await req.formData();
      name = String(form.get('name') ?? '').trim();
      email = String(form.get('email') ?? '').trim();
      company = String(form.get('company') ?? '').trim();
      preferredChannel = String(form.get('preferredChannel') ?? 'email').trim() || 'email';
      source = String(form.get('source') ?? 'footer').trim() || 'footer';
      interests = form
        .getAll('interests')
        .map((item) => String(item).trim())
        .filter(Boolean);
    } else {
      const body = await req.json().catch(() => ({}));
      name = String(body?.name ?? '').trim();
      email = String(body?.email ?? '').trim();
      company = String(body?.company ?? '').trim();
      preferredChannel = String(body?.preferredChannel ?? 'email').trim() || 'email';
      source = String(body?.source ?? 'footer').trim() || 'footer';
      interests = Array.isArray(body?.interests)
        ? body.interests.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [];
    }

    if (company) {
      return NextResponse.json({ ok: true, message: 'Thanks! You are subscribed.' });
    }

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    // Upsert subscriber: create if not exist, else leave unchanged
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

    const response = NextResponse.json({
      ok: true,
      message: 'You are on the list. We will send only the kind of updates you asked for.',
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    console.error('[api/newsletter] error saving subscription:', error);
    return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 });
  }
}
