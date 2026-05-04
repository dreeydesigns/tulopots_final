import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { createSupportThread, addSupportMessage, addSupportSummary } from '@/lib/support';

export const runtime = 'nodejs';

/**
 * Africa's Talking recording callback.
 * Receives a completed voice recording URL from AT, transcribes + summarizes it
 * with Gemini, stores a support thread, and generates a WhatsApp follow-up link.
 */
export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/callbot/transcript',
      limit: 10,
      windowMs: 60 * 1000,
      ip,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let recordingUrl: string | null = null;
    let callerNumber: string | null = null;
    let duration: string | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      recordingUrl = form.get('recordingUrl') as string | null;
      callerNumber = form.get('callerNumber') as string | null;
      duration = form.get('durationInSeconds') as string | null;
    } else {
      const body = await req.json().catch(() => ({}));
      recordingUrl = body.recordingUrl || body.recording_url || null;
      callerNumber = body.callerNumber || body.caller_number || null;
      duration = body.durationInSeconds || body.duration || null;
    }

    if (!recordingUrl) {
      return NextResponse.json({ error: 'No recording URL provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const audioRes = await fetch(recordingUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.AT_API_KEY || ''}`,
      },
    });

    if (!audioRes.ok) {
      return NextResponse.json({ error: 'Could not fetch recording' }, { status: 502 });
    }

    const audioBuffer = await audioRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioContentType = audioRes.headers.get('content-type') || 'audio/wav';
    const mimeType = audioContentType.includes('mp3') ? 'audio/mp3' :
                     audioContentType.includes('ogg') ? 'audio/ogg' : 'audio/wav';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const transcriptResult = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
      `You are a TuloPots customer service AI assistant.
TuloPots is a handcrafted terracotta brand based in Nairobi, Kenya, selling clay pots and plant pairings.
A customer just left a voice message. Caller number: ${callerNumber || 'unknown'}. Duration: ${duration || '?'} seconds.

Please:
1. Transcribe the recording as accurately as possible (English or Swahili — preserve the language used)
2. Identify what the customer needs (product inquiry, pricing, delivery, care, custom order, complaint, etc.)
3. Write a brief summary the TuloPots team can act on

Format your response as plain text with these three sections:
TRANSCRIPTION:
[exact words spoken]

SUMMARY:
[2-3 sentences about what they need and any key details like name, WhatsApp number, product interest]

ACTION NEEDED:
[what the TuloPots team should do next]`,
    ]);

    const summary = transcriptResult.response.text();

    const thread = await createSupportThread({
      source: 'CHATBOT',
      customerName: null,
      customerEmail: null,
      customerPhone: callerNumber,
      userId: null,
      summary: summary.slice(0, 2000),
      tagsJson: { recordingUrl, duration, callerNumber, channel: 'voice_callbot' },
    });

    await addSupportMessage({
      threadId: thread.id,
      role: 'CUSTOMER',
      channel: 'VOICE',
      body: summary,
      metaJson: { recordingUrl, callerNumber, duration },
    });

    await addSupportSummary({
      threadId: thread.id,
      intent: 'callbot_voicemail',
      shortSummary: summary.slice(0, 300),
      suggestedNextStep: 'Reply via WhatsApp or call the customer back.',
      confidence: 0.85,
    });

    const waNumber = process.env.WHATSAPP_NUMBER || '254700000000';
    const waMessage = [
      '*📞 New TuloPots Voice Message*',
      '',
      `Caller: ${callerNumber || 'unknown'}`,
      `Duration: ${duration || '?'}s`,
      '',
      summary,
      '',
      '_Via TuloPots AI Callbot_',
    ].join('\n');

    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

    return NextResponse.json({ ok: true, threadId: thread.id, waLink });
  } catch (error) {
    console.error('[callbot/transcript] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
