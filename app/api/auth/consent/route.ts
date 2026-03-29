import { NextRequest, NextResponse } from 'next/server';
import { getSessionRecord, mapUserToSessionUser } from '@/lib/auth';
import { CURRENT_POLICY_VERSION } from '@/lib/policies';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getSessionRecord();

  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Sign in to update your policy settings.' },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      acceptTerms?: boolean;
      acceptPrivacy?: boolean;
      marketingConsent?: boolean;
    };

    if (!body.acceptTerms || !body.acceptPrivacy) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You need to accept both the Terms and Privacy Policy.',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        acceptedTermsAt: now,
        acceptedPrivacyAt: now,
        acceptedPolicyVersion: CURRENT_POLICY_VERSION,
        marketingConsent: Boolean(body.marketingConsent),
        marketingConsentAt: body.marketingConsent ? now : null,
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
        error: error?.message || 'Unable to update your policy settings.',
      },
      { status: 500 }
    );
  }
}
