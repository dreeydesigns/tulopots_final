import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { AuthScope, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CURRENT_POLICY_VERSION, hasAcceptedPolicies } from '@/lib/policies';

export const SESSION_COOKIE = 'tp_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  avatar?: string;
  marketingConsent: boolean;
  acceptedPolicyVersion?: string;
  hasAcceptedPolicies: boolean;
};

type SessionUserRecord = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'phone'
  | 'isAdmin'
  | 'avatar'
  | 'marketingConsent'
  | 'acceptedTermsAt'
  | 'acceptedPrivacyAt'
  | 'acceptedPolicyVersion'
>;

export function mapUserToSessionUser(user: SessionUserRecord): SessionUser | null {
  if (!user.email) {
    return null;
  }

  const acceptedPolicyVersion =
    user.acceptedPolicyVersion || CURRENT_POLICY_VERSION;

  return {
    id: user.id,
    name: user.name || user.email.split('@')[0],
    email: user.email,
    phone: user.phone || undefined,
    isAdmin: user.isAdmin,
    avatar: user.avatar || undefined,
    marketingConsent: user.marketingConsent,
    acceptedPolicyVersion,
    hasAcceptedPolicies: hasAcceptedPolicies({
      acceptedTermsAt: user.acceptedTermsAt,
      acceptedPrivacyAt: user.acceptedPrivacyAt,
      acceptedPolicyVersion: user.acceptedPolicyVersion,
    }),
  };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, savedHash] = storedHash.split(':');

  if (!salt || !savedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const savedBuffer = Buffer.from(savedHash, 'hex');

  if (derivedKey.length !== savedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, savedBuffer);
}

export function mergeAuthProviders(
  existing: string | null | undefined,
  next: string
) {
  const providers = new Set(
    String(existing || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );

  providers.add(next);
  return Array.from(providers).join(',');
}

export function isAdminEmailAddress(email: string) {
  const adminEmails = (
    process.env.ADMIN_EMAILS ||
    'andrew@tulopots.com,admin@tulopots.com,dreeydesigns@gmail.com'
  )
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase());
}

export async function createSession(
  userId: string,
  scope: AuthScope = 'CUSTOMER'
) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.$transaction([
    prisma.authSession.create({
      data: {
        token,
        userId,
        scope,
        expiresAt,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        lastSignInAt: new Date(),
      },
    }),
  ]);

  return { token, expiresAt };
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date
) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: 'high',
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    priority: 'high',
  });
}

export async function getSessionRecord() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.authSession
      .delete({ where: { id: session.id } })
      .catch(() => undefined);
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getSessionRecord();
  if (!session) {
    return null;
  }

  return mapUserToSessionUser(session.user);
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return;
  }

  await prisma.authSession.deleteMany({
    where: { token },
  });
}

export async function deleteSessionByToken(token: string) {
  await prisma.authSession.deleteMany({
    where: { token },
  });
}

export function isValidEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.trim().length >= 8;
}
