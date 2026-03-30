import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionRecord,
  hashPassword,
  isValidPassword,
  verifyPassword,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  const session = await getSessionRecord();

  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Sign in to update your password.' },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Use a password with at least 8 characters.',
        },
        { status: 400 }
      );
    }

    if (session.user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Enter your current password before saving a new one.',
          },
          { status: 400 }
        );
      }

      if (!verifyPassword(currentPassword, session.user.passwordHash)) {
        return NextResponse.json(
          {
            ok: false,
            error: 'The current password is incorrect.',
          },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: {
          passwordHash: hashPassword(newPassword),
        },
      }),
      prisma.authSession.deleteMany({
        where: {
          userId: session.userId,
          NOT: {
            id: session.id,
          },
        },
      }),
    ]);

    const response = NextResponse.json({
      ok: true,
      message: session.user.passwordHash
        ? 'Password updated successfully.'
        : 'Password created successfully.',
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to update your password.',
      },
      { status: 500 }
    );
  }
}
