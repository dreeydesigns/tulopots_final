import { NextRequest, NextResponse } from 'next/server';
import { getSessionRecord, mapUserToSessionUser } from '@/lib/auth';
import { resolveSupportedCurrency, resolveSupportedLanguage } from '@/lib/customer-preferences';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  const session = await getSessionRecord();

  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Sign in to update your settings.' },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      marketingConsent?: boolean;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      whatsappNotifications?: boolean;
      preferredContactChannel?: string;
      preferredLanguage?: string;
      preferredCurrency?: string;
    };

    const now = new Date();
    const marketingConsent = Boolean(body.marketingConsent);
    const emailNotifications =
      body.emailNotifications === undefined ? session.user.emailNotifications : Boolean(body.emailNotifications);
    const smsNotifications =
      body.smsNotifications === undefined ? session.user.smsNotifications : Boolean(body.smsNotifications);
    const whatsappNotifications =
      body.whatsappNotifications === undefined
        ? session.user.whatsappNotifications
        : Boolean(body.whatsappNotifications);
    const preferredContactChannel = ['email', 'sms', 'whatsapp'].includes(
      String(body.preferredContactChannel || '')
    )
      ? String(body.preferredContactChannel)
      : session.user.preferredContactChannel;
    const preferredLanguage =
      body.preferredLanguage === undefined
        ? session.user.preferredLanguage
        : resolveSupportedLanguage(body.preferredLanguage);
    const preferredCurrency =
      body.preferredCurrency === undefined
        ? session.user.preferredCurrency
        : resolveSupportedCurrency(body.preferredCurrency);

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        marketingConsent,
        marketingConsentAt: marketingConsent ? now : null,
        emailNotifications,
        smsNotifications,
        whatsappNotifications,
        preferredContactChannel,
        preferredLanguage,
        preferredCurrency,
      },
    });

    const response = NextResponse.json({
      ok: true,
      user: mapUserToSessionUser(user),
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to save account settings.',
      },
      { status: 500 }
    );
  }
}
