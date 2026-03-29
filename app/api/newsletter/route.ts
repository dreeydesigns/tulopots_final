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
    let company = '';

    // Determine if the request is multipart/form-data or JSON
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('form-data')) {
      const form = await req.formData();
      email = String(form.get('email') ?? '').trim();
      company = String(form.get('company') ?? '').trim();
    } else {
      const body = await req.json().catch(() => ({}));
      email = String(body?.email ?? '').trim();
      company = String(body?.company ?? '').trim();
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
      update: {},
      create: { email },
    });

    const response = NextResponse.json({
      ok: true,
      message: 'Thanks! You are subscribed.',
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    console.error('[api/newsletter] error saving subscription:', error);
    return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 });
  }
}
