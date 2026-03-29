import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  attachSessionCookie,
  createSession,
  hashPassword,
  isValidEmail,
  isValidPassword,
} from '@/lib/auth';

function isAdminEmail(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS || 'andrew@tulopots.com,admin@tulopots.com')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase());
}

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
    };

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '');

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Full name is required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ ok: false, error: 'Enter a valid phone number.' }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existing?.passwordHash) {
      return NextResponse.json({ ok: false, error: 'An account with those details already exists.' }, { status: 409 });
    }

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            email,
            phone: phone || null,
            passwordHash: hashPassword(password),
            isAdmin: existing.isAdmin || isAdminEmail(email),
          },
        })
      : await prisma.user.create({
          data: {
            name,
            email,
            phone: phone || null,
            passwordHash: hashPassword(password),
            isAdmin: isAdminEmail(email),
          },
        });

    const { token, expiresAt } = await createSession(user.id, user.isAdmin ? 'ADMIN' : 'CUSTOMER');
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name || email.split('@')[0],
        email: user.email,
        phone: user.phone || undefined,
        isAdmin: user.isAdmin,
        avatar: user.avatar || undefined,
      },
    });

    attachSessionCookie(response, token, expiresAt);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unable to create your account right now.' },
      { status: 500 }
    );
  }
}
