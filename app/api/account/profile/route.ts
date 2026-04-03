import { NextRequest, NextResponse } from 'next/server';
import { getSessionRecord, mapUserToSessionUser } from '@/lib/auth';
import {
  resolveSupportedCountry,
  resolveSupportedCurrency,
  resolveSupportedLanguage,
} from '@/lib/customer-preferences';
import { prisma } from '@/lib/prisma';

function isValidPhone(value: string) {
  return /^\+?[0-9]{10,15}$/.test(value);
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionRecord();

  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Sign in to update your profile.' },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      defaultShippingAddress?: string;
      defaultShippingCity?: string;
      defaultShippingCountry?: string;
      preferredLanguage?: string;
      preferredCurrency?: string;
    };

    const name = String(body.name || '').trim().slice(0, 80);
    const phone = String(body.phone || '').trim();
    const defaultShippingAddress = String(body.defaultShippingAddress || '')
      .trim()
      .slice(0, 180);
    const defaultShippingCity = String(body.defaultShippingCity || '')
      .trim()
      .slice(0, 80);
    const defaultShippingCountry = resolveSupportedCountry(
      body.defaultShippingCountry ?? session.user.defaultShippingCountry
    );
    const preferredLanguage = resolveSupportedLanguage(
      body.preferredLanguage ?? session.user.preferredLanguage
    );
    const preferredCurrency = resolveSupportedCurrency(
      body.preferredCurrency ?? session.user.preferredCurrency
    );

    if (!name) {
      return NextResponse.json(
        { ok: false, error: 'Your name is required.' },
        { status: 400 }
      );
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Use a valid phone number, for example +254700000000.',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        phone: phone || null,
        defaultShippingAddress: defaultShippingAddress || null,
        defaultShippingCity: defaultShippingCity || null,
        defaultShippingCountry,
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
    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          ok: false,
          error: 'That phone number is already linked to another account.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to update your profile.',
      },
      { status: 500 }
    );
  }
}
