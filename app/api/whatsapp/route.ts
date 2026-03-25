import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, summary } = await req.json();
    const waNumber = process.env.WHATSAPP_NUMBER || '254700000000';

    const message = [
      '🌿 *New TuloPots Chatbot Enquiry*',
      '',
      `*Name:* ${name || 'Not provided'}`,
      `*Phone:* ${phone || 'Not provided'}`,
      `*Email:* ${email || 'Not provided'}`,
      '',
      `*What they need:*`,
      summary || 'General enquiry',
      '',
      '_Sent via TuloPots AI Assistant_',
    ].join('\n');

    // Build WhatsApp link (works for wa.me and WhatsApp Business API)
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ ok: true, waLink, message });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}
