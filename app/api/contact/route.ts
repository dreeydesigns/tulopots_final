import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/contact
//
// Handles submissions from the contact form.  Validates basic fields and
// stores the message in the database.  Responds with a friendly message
// acknowledging receipt.  Errors during processing result in a 500
// response.  Requires the `ContactMessage` model in your Prisma schema.

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Please enter a message' }, { status: 400 });
    }

    // Persist the contact message
    await prisma.contactMessage.create({
      data: { name, email, subject: subject || '(no subject)', message },
    });

    return NextResponse.json({ ok: true, message: `Thanks ${name}, we received your message.` });
  } catch (error: any) {
    console.error('[api/contact] error saving message:', error);
    return NextResponse.json({ error: 'Could not send message' }, { status: 500 });
  }
}