import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { AuthScope, User, UserRole } from '@prisma/client';
import { canAccessAdminTab, getAllowedAdminTabs, getRolePermissions, normalizeUserRole } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { hasAcceptedPolicies } from '@/lib/policies';

export const SESSION_COOKIE = 'tp_session';
const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const ADMIN_IDLE_TIMEOUT_SECONDS = 60 * 30;
const SESSION_TOUCH_INTERVAL_SECONDS = 60 * 5;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  role: UserRole;
  permissions: string[];
  allowedAdminTabs: string[];
  avatar?: string;
  marketingConsent: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  preferredContactChannel: string;
  preferredLanguage: string;
  preferredCurrency: string;
  defaultShippingAddress?: string;
  defaultShippingCity?: string;
  defaultShippingCountry: string;
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
  | 'role'
  | 'avatar'
  | 'marketingConsent'
  | 'emailNotifications'
  | 'smsNotifications'
  | 'whatsappNotifications'
  | 'preferredContactChannel'
  | 'preferredLanguage'
  | 'preferredCurrency'
  | 'defaultShippingAddress'
  | 'defaultShippingCity'
  | 'defaultShippingCountry'
  | 'acceptedTermsAt'
  | 'acceptedPrivacyAt'
  | 'acceptedPolicyVersion'
>;

export function mapUserToSessionUser(user: SessionUserRecord): SessionUser | null {
  if (!user.email) {
    return null;
  }

  const role = normalizeUserRole(user.role, user.isAdmin);
  const permissions = getRolePermissions(role);
  const allowedAdminTabs = getAllowedAdminTabs(role);

  return {
    id: user.id,
    name: user.name || user.email.split('@')[0],
    email: user.email,
    phone: user.phone || undefined,
    isAdmin: role !== 'CUSTOMER',
    role,
    permissions,
    allowedAdminTabs,
    avatar: user.avatar || undefined,
    marketingConsent: user.marketingConsent,
    emailNotifications: user.emailNotifications,
    smsNotifications: user.smsNotifications,
    whatsappNotifications: user.whatsappNotifications,
    preferredContactChannel: user.preferredContactChannel,
    preferredLanguage: user.preferredLanguage,
    preferredCurrency: user.preferredCurrency,
    defaultShippingAddress: user.defaultShippingAddress || undefined,
    defaultShippingCity: user.defaultShippingCity || undefined,
    defaultShippingCountry: user.defaultShippingCountry || 'KE',
    acceptedPolicyVersion: user.acceptedPolicyVersion || undefined,
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

function getSessionMaxAgeSeconds(scope: AuthScope, role: UserRole) {
  return scope === 'ADMIN' || role !== 'CUSTOMER'
    ? ADMIN_SESSION_MAX_AGE_SECONDS
    : CUSTOMER_SESSION_MAX_AGE_SECONDS;
}

export async function createSession(
  userId: string,
  scope: AuthScope = 'CUSTOMER'
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isAdmin: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error('User account could not be found.');
  }

  const role = normalizeUserRole(user.role, user.isAdmin || isAdminEmailAddress(user.email || ''));
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + getSessionMaxAgeSeconds(scope, role) * 1000);
  const now = new Date();

  await prisma.$transaction([
    ...(scope === 'ADMIN' || role !== 'CUSTOMER'
      ? [
          prisma.authSession.deleteMany({
            where: {
              userId,
              scope: 'ADMIN',
            },
          }),
        ]
      : []),
    prisma.authSession.create({
      data: {
        token,
        userId,
        scope,
        expiresAt,
        lastSeenAt: now,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        lastSignInAt: now,
        role,
        isAdmin: role !== 'CUSTOMER',
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
  const maxAge = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
    maxAge,
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

  const now = new Date();
  const role = normalizeUserRole(session.user.role, session.user.isAdmin);
  const isAdminSession = session.scope === 'ADMIN' || role !== 'CUSTOMER';
  const idleSeconds = Math.floor((now.getTime() - session.lastSeenAt.getTime()) / 1000);

  if (session.expiresAt <= now || (isAdminSession && idleSeconds > ADMIN_IDLE_TIMEOUT_SECONDS)) {
    await prisma.authSession
      .delete({ where: { id: session.id } })
      .catch(() => undefined);
    return null;
  }

  if (
    isAdminSession &&
    Math.floor((now.getTime() - session.createdAt.getTime()) / 1000) > ADMIN_SESSION_MAX_AGE_SECONDS
  ) {
    await prisma.authSession
      .delete({ where: { id: session.id } })
      .catch(() => undefined);
    return null;
  }

  if (
    now.getTime() - session.lastSeenAt.getTime() >
    SESSION_TOUCH_INTERVAL_SECONDS * 1000
  ) {
    await prisma.authSession
      .update({
        where: { id: session.id },
        data: {
          lastSeenAt: now,
        },
      })
      .catch(() => undefined);
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

export function userCanAccessAdminTab(
  user: Pick<SessionUser, 'role' | 'isAdmin'> | null | undefined,
  tab: string
) {
  if (!user) {
    return false;
  }

  return canAccessAdminTab(normalizeUserRole(user.role, user.isAdmin), tab as any);
}
