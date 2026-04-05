import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  attachSessionCookie,
  createSession,
  findUserForAuth,
  isAdminEmailAddress,
  isSchemaCompatibilityError,
  isValidEmail,
  isValidPassword,
  mapUserToSessionUser,
  updateUserForAuth,
  verifyPassword,
} from '@/lib/auth';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { loginSchema } from '@/lib/security/validation';
import { recordLoginAttempt, recordSecurityEvent } from '@/lib/security/audit';
import { normalizeUserRole } from '@/lib/access';

const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_THRESHOLD = 5;

function getAuthFailureDetail(error: unknown) {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code || '').toUpperCase()
      : '';
  const message = String((error as Error | null | undefined)?.message || '').toLowerCase();

  if (code === 'P1001' || message.includes("can't reach database server")) {
    return 'DB_UNREACHABLE';
  }

  if (message.includes('auth_session_insert_failed')) {
    return 'SESSION_INSERT_FAILED';
  }

  if (message.includes('auth_session_user_sync_failed')) {
    return 'SESSION_USER_SYNC_FAILED';
  }

  if (message.includes('auth_session_delete_failed')) {
    return 'SESSION_DELETE_FAILED';
  }

  if (
    code === 'P2021' ||
    code === 'P2022' ||
    message.includes('column') ||
    message.includes('relation') ||
    message.includes('does not exist')
  ) {
    return 'SCHEMA_COMPAT';
  }

  if (message.includes('timed out') || message.includes('timeout')) {
    return 'TIMEOUT';
  }

  return 'UNKNOWN';
}

async function getLockout(identifier: string, ip: string) {
  let attempts: Array<{
    wasSuccessful: boolean;
    lockoutUntil: Date | null;
  }> = [];

  try {
    attempts = await prisma.loginAttempt.findMany({
      where: {
        identifier: identifier.toLowerCase(),
        attemptedAt: {
          gte: new Date(Date.now() - LOCKOUT_WINDOW_MS),
        },
      },
      orderBy: {
        attemptedAt: 'desc',
      },
      take: LOCKOUT_THRESHOLD,
      select: {
        wasSuccessful: true,
        lockoutUntil: true,
      },
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }
    return null;
  }

  const activeLock = attempts.find((attempt) => attempt.lockoutUntil && attempt.lockoutUntil > new Date());
  if (activeLock?.lockoutUntil) {
    return activeLock.lockoutUntil;
  }

  const recentFailures = attempts.filter((attempt) => !attempt.wasSuccessful).length;
  if (recentFailures >= LOCKOUT_THRESHOLD) {
    return new Date(Date.now() + LOCKOUT_WINDOW_MS);
  }

  return null;
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/auth/login',
      limit: 8,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many sign-in attempts. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = loginSchema.safeParse(await request.json());

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/auth/login',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('Enter a valid email address and password.', 400);
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;
    const scope = parsed.data.scope === 'admin' ? 'ADMIN' : 'CUSTOMER';

    const lockoutUntil = await getLockout(email, ip);
    if (lockoutUntil && lockoutUntil > new Date()) {
      await recordLoginAttempt({
        identifier: email,
        ip,
        wasSuccessful: false,
        failureReason: 'locked',
        lockoutUntil,
      });
      return jsonError('Sign-in is temporarily locked. Please try again shortly.', 429, {
        lockoutUntil: lockoutUntil.toISOString(),
      });
    }

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return jsonError('Enter a valid email address and password.', 400);
    }

    let user;
    try {
      user = await findUserForAuth({ email });
    } catch (error) {
      console.error('[auth/login] lookup failed', error);
      return jsonError('Unable to access account records right now.', 500, {
        code: 'AUTH_LOOKUP_FAILED',
      });
    }

    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      const nextLockout = await getLockout(email, ip);
      await recordLoginAttempt({
        identifier: email,
        ip,
        userId: user?.id,
        wasSuccessful: false,
        failureReason: 'invalid_credentials',
        lockoutUntil: nextLockout,
      });
      await recordSecurityEvent({
        type: 'FAILED_LOGIN',
        severity: 'WARNING',
        route: '/api/auth/login',
        userId: user?.id,
        identifier: email,
        ip,
      });
      return jsonError('Email or password is incorrect.', 401);
    }

    const resolvedRole = normalizeUserRole(user.role, user.isAdmin || isAdminEmailAddress(email));

    if ((isAdminEmailAddress(email) && !user.isAdmin) || user.role !== resolvedRole) {
      try {
        await updateUserForAuth(
          user.id,
          { isAdmin: resolvedRole !== 'CUSTOMER', role: resolvedRole },
          { isAdmin: resolvedRole !== 'CUSTOMER' }
        );
      } catch (error) {
        console.error('[auth/login] role sync failed', error);
        return jsonError('Unable to prepare your account right now.', 500, {
          code: 'AUTH_ROLE_SYNC_FAILED',
        });
      }
      user.isAdmin = resolvedRole !== 'CUSTOMER';
      user.role = resolvedRole;
    }

    if (scope === 'ADMIN' && resolvedRole === 'CUSTOMER') {
      await recordSecurityEvent({
        type: 'PERMISSION_DENIED',
        severity: 'WARNING',
        route: '/api/auth/login',
        userId: user.id,
        identifier: email,
        ip,
        metadata: {
          attemptedScope: scope,
        },
      });
      return jsonError('This account does not have admin access.', 403);
    }

    let token;
    let expiresAt;
    try {
      const session = await createSession(user.id, scope);
      token = session.token;
      expiresAt = session.expiresAt;
    } catch (error) {
      console.error('[auth/login] session create failed', error);
      return jsonError('Unable to start your session right now.', 500, {
        code: 'AUTH_SESSION_FAILED',
        detail: getAuthFailureDetail(error),
      });
    }
    await recordLoginAttempt({
      identifier: email,
      ip,
      userId: user.id,
      wasSuccessful: true,
    });
    const response = NextResponse.json({
      ok: true,
      user: mapUserToSessionUser(user),
    });

    attachSessionCookie(response, token, expiresAt);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return jsonError(getSafeErrorMessage(error, 'Unable to sign in right now.'), 500);
  }
}
