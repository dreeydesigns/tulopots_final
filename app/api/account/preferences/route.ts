import { NextRequest, NextResponse } from 'next/server';
import { getSessionRecord, mapUserToSessionUser } from '@/lib/auth';
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

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        marketingConsent,
        marketingConsentAt: marketingConsent ? now : null,
        emailNotifications,
        smsNotifications,
        whatsappNotifications,
        preferredContactChannel,
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
