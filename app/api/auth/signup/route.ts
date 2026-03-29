import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  attachSessionCookie,
  createSession,
  hashPassword,
  isAdminEmailAddress,
  isValidEmail,
  isValidPassword,
  mapUserToSessionUser,
  mergeAuthProviders,
} from '@/lib/auth';
import { CURRENT_POLICY_VERSION } from '@/lib/policies';

function isValidPhone(phone: string) {
  return !phone || /^\+?[0-9]{10,15}$/.test(phone);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      acceptTerms?: boolean;
      acceptPrivacy?: boolean;
      marketingConsent?: boolean;
    };

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '');
    const acceptTerms = Boolean(body.acceptTerms);
    const acceptPrivacy = Boolean(body.acceptPrivacy);
    const marketingConsent = Boolean(body.marketingConsent);

    if (!name) {
      return NextResponse.json(
        { ok: false, error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'Enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: 'Enter a valid phone number.' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    if (!acceptTerms || !acceptPrivacy) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You need to accept the Terms and Privacy Policy to continue.',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existing?.passwordHash) {
      return NextResponse.json(
        { ok: false, error: 'An account with those details already exists.' },
        { status: 409 }
      );
    }

    const now = new Date();
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            email,
            phone: phone || null,
            passwordHash: hashPassword(password),
            provider: mergeAuthProviders(existing.provider, 'password'),
            isAdmin: existing.isAdmin || isAdminEmailAddress(email),
            acceptedTermsAt: now,
            acceptedPrivacyAt: now,
            acceptedPolicyVersion: CURRENT_POLICY_VERSION,
            marketingConsent,
            marketingConsentAt: marketingConsent ? now : null,
          },
        })
      : await prisma.user.create({
          data: {
            name,
            email,
            phone: phone || null,
            passwordHash: hashPassword(password),
            provider: 'password',
            isAdmin: isAdminEmailAddress(email),
            acceptedTermsAt: now,
            acceptedPrivacyAt: now,
            acceptedPolicyVersion: CURRENT_POLICY_VERSION,
            marketingConsent,
            marketingConsentAt: marketingConsent ? now : null,
          },
        });

    const { token, expiresAt } = await createSession(
      user.id,
      user.isAdmin ? 'ADMIN' : 'CUSTOMER'
    );
    const response = NextResponse.json({
      ok: true,
      user: mapUserToSessionUser(user),
    });

    attachSessionCookie(response, token, expiresAt);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to create your account right now.',
      },
      { status: 500 }
    );
  }
}
