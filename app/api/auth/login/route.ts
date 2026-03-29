import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  attachSessionCookie,
  createSession,
  isAdminEmailAddress,
  isValidEmail,
  isValidPassword,
  verifyPassword,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      scope?: 'customer' | 'admin';
    };

    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const scope = body.scope === 'admin' ? 'ADMIN' : 'CUSTOMER';

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'Enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: 'Email or password is incorrect.' },
        { status: 401 }
      );
    }

    if (isAdminEmailAddress(email) && !user.isAdmin) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true },
      });
      user.isAdmin = true;
    }

    if (scope === 'ADMIN' && !user.isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'This account does not have admin access.' },
        { status: 403 }
      );
    }

    const { token, expiresAt } = await createSession(user.id, scope);
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name || email.split('@')[0],
        email,
        phone: user.phone || undefined,
        isAdmin: user.isAdmin,
        avatar: user.avatar || undefined,
      },
    });

    attachSessionCookie(response, token, expiresAt);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unable to sign in right now.' },
      { status: 500 }
    );
  }
}
