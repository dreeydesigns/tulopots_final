import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  ALLOWED_ANALYTICS_EVENTS,
  sanitizeAnalyticsPayload,
  sanitizeAnalyticsText,
} from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = (await request.json()) as {
      eventName?: string;
      path?: string;
      source?: string;
      consentLevel?: string;
      sessionKey?: string;
      payload?: unknown;
    };

    const eventName = sanitizeAnalyticsText(body.eventName);
    const path = sanitizeAnalyticsText(body.path, '/');
    const source = sanitizeAnalyticsText(body.source, 'direct');
    const consentLevel = ['essential', 'analytics', 'marketing'].includes(
      String(body.consentLevel || '')
    )
      ? String(body.consentLevel)
      : 'essential';
    const sessionKey = sanitizeAnalyticsText(body.sessionKey).slice(0, 80) || null;

    if (!eventName || !ALLOWED_ANALYTICS_EVENTS.has(eventName)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported analytics event.' },
        { status: 400 }
      );
    }

    await prisma.analyticsEvent.create({
      data: {
        userId: currentUser?.id || null,
        sessionKey,
        eventName,
        path,
        source,
        consentLevel,
        payload: sanitizeAnalyticsPayload(body.payload),
      },
    });

    const response = NextResponse.json({ ok: true });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unable to record analytics event.' },
      { status: 500 }
    );
  }
}
