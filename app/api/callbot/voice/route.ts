import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Africa's Talking voice webhook.
 * Called when a customer dials the TuloPots callbot number.
 * Responds with XML to greet the caller in English + Swahili and record their message.
 */
export async function POST(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tulopots-final.vercel.app';
  const callbackUrl = `${siteUrl}/api/callbot/transcript`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="en-US-Standard-F" playBeep="false">
    Welcome to TuloPots. You have reached our AI voice assistant.
  </Say>
  <Say voice="en-US-Standard-F" playBeep="false">
    Karibu TuloPots. Umefika kwa msaidizi wetu wa sauti.
  </Say>
  <Say voice="en-US-Standard-F" playBeep="false">
    Please leave your message after the beep. Tell us your name, what you need, and your WhatsApp number. Press hash when done.
    Tafadhali acha ujumbe wako baada ya mlio. Sema jina lako, unahitaji nini, na nambari yako ya WhatsApp.
  </Say>
  <Record
    finishOnKey="#"
    maxLength="120"
    trimSilence="true"
    playBeep="true"
    callbackUrl="${callbackUrl}"
  />
  <Say voice="en-US-Standard-F" playBeep="false">
    Thank you. We will reply on WhatsApp shortly. Asante, tutajibu WhatsApp hivi karibuni.
  </Say>
</Response>`;

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
