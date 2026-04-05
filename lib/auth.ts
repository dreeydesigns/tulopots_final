import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { AuthScope, Prisma, User, UserRole } from '@prisma/client';
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

type SessionUserRecord = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  isAdmin: boolean;
  role?: UserRole | null;
  passwordHash?: string | null;
  avatar?: string | null;
  marketingConsent?: boolean | null;
  emailNotifications?: boolean | null;
  smsNotifications?: boolean | null;
  whatsappNotifications?: boolean | null;
  preferredContactChannel?: string | null;
  preferredLanguage?: string | null;
  preferredCurrency?: string | null;
  defaultShippingAddress?: string | null;
  defaultShippingCity?: string | null;
  defaultShippingCountry?: string | null;
  acceptedTermsAt?: Date | null;
  acceptedPrivacyAt?: Date | null;
  acceptedPolicyVersion?: string | null;
};

type AuthUserRecord = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  provider?: string | null;
  googleId?: string | null;
  appleId?: string | null;
  passwordHash?: string | null;
  avatar?: string | null;
  isAdmin: boolean;
  role?: UserRole | null;
  marketingConsent?: boolean | null;
  marketingConsentAt?: Date | null;
  emailNotifications?: boolean | null;
  smsNotifications?: boolean | null;
  whatsappNotifications?: boolean | null;
  preferredContactChannel?: string | null;
  preferredLanguage?: string | null;
  preferredCurrency?: string | null;
  defaultShippingAddress?: string | null;
  defaultShippingCity?: string | null;
  defaultShippingCountry?: string | null;
  acceptedTermsAt?: Date | null;
  acceptedPrivacyAt?: Date | null;
  acceptedPolicyVersion?: string | null;
  lastSignInAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type SessionRecord = {
  id: string;
  token: string;
  scope: AuthScope;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
  user: SessionUserRecord;
};

const LEGACY_RAW_USER_COLUMNS = new Set([
  'name',
  'email',
  'phone',
  'provider',
  'isAdmin',
  'passwordHash',
  'avatar',
  'googleId',
  'appleId',
  'acceptedTermsAt',
  'acceptedPrivacyAt',
  'acceptedPolicyVersion',
  'marketingConsent',
  'marketingConsentAt',
  'emailNotifications',
  'smsNotifications',
  'whatsappNotifications',
  'preferredContactChannel',
  'preferredLanguage',
  'preferredCurrency',
  'defaultShippingAddress',
  'defaultShippingCity',
  'defaultShippingCountry',
  'lastSignInAt',
]);

const modernUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  provider: true,
  googleId: true,
  appleId: true,
  passwordHash: true,
  avatar: true,
  isAdmin: true,
  role: true,
  marketingConsent: true,
  marketingConsentAt: true,
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: true,
  preferredContactChannel: true,
  preferredLanguage: true,
  preferredCurrency: true,
  defaultShippingAddress: true,
  defaultShippingCity: true,
  defaultShippingCountry: true,
  acceptedTermsAt: true,
  acceptedPrivacyAt: true,
  acceptedPolicyVersion: true,
  lastSignInAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const legacyUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  provider: true,
  passwordHash: true,
  isAdmin: true,
} satisfies Prisma.UserSelect;

const modernSessionUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isAdmin: true,
  role: true,
  passwordHash: true,
  avatar: true,
  marketingConsent: true,
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: true,
  preferredContactChannel: true,
  preferredLanguage: true,
  preferredCurrency: true,
  defaultShippingAddress: true,
  defaultShippingCity: true,
  defaultShippingCountry: true,
  acceptedTermsAt: true,
  acceptedPrivacyAt: true,
  acceptedPolicyVersion: true,
} satisfies Prisma.UserSelect;

const legacySessionUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isAdmin: true,
  passwordHash: true,
} satisfies Prisma.UserSelect;

function withFallbackRole<T extends { isAdmin: boolean }>(user: T): T & { role?: UserRole | null } {
  return {
    ...user,
    role: 'role' in user ? (user as { role?: UserRole | null }).role ?? null : null,
  };
}

function getLegacyRawUserEntries(data: Record<string, unknown>) {
  return Object.entries(data).filter(
    ([key, value]) => LEGACY_RAW_USER_COLUMNS.has(key) && value !== undefined
  );
}

async function createLegacyRawUser(data: Record<string, unknown>) {
  const entries = getLegacyRawUserEntries(data);
  const userId = String(data.id || `legacy_${randomBytes(12).toString('hex')}`);
  const columns = ['id', ...entries.map(([key]) => key)];
  const values = [userId, ...entries.map(([, value]) => value)];
  const placeholders = values.map((_, index) => `$${index + 1}`);
  const rows = (await prisma.$queryRawUnsafe(
    `INSERT INTO "User" (${columns.map((column) => `"${column}"`).join(', ')})
     VALUES (${placeholders.join(', ')})
     RETURNING "id", "name", "email", "phone", "provider", "passwordHash", "isAdmin"`,
    ...values
  )) as Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    provider: string | null;
    passwordHash: string | null;
    isAdmin: boolean;
  }>;

  if (!rows[0]) {
    throw new Error('Raw user create did not return a user record.');
  }

  return withFallbackRole(rows[0]);
}

async function updateLegacyRawUser(userId: string, data: Record<string, unknown>) {
  const entries = getLegacyRawUserEntries(data);

  if (!entries.length) {
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT "id", "name", "email", "phone", "provider", "passwordHash", "isAdmin" FROM "User" WHERE "id" = $1',
      userId
    )) as Array<{
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      provider: string | null;
      passwordHash: string | null;
      isAdmin: boolean;
    }>;

    if (!rows[0]) {
      throw new Error('Raw user update could not find the user record.');
    }

    return withFallbackRole(rows[0]);
  }

  const assignments = entries.map(([key], index) => `"${key}" = $${index + 2}`);
  const values = [userId, ...entries.map(([, value]) => value)];
  const rows = (await prisma.$queryRawUnsafe(
    `UPDATE "User"
     SET ${assignments.join(', ')}
     WHERE "id" = $1
     RETURNING "id", "name", "email", "phone", "provider", "passwordHash", "isAdmin"`,
    ...values
  )) as Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    provider: string | null;
    passwordHash: string | null;
    isAdmin: boolean;
  }>;

  if (!rows[0]) {
    throw new Error('Raw user update did not return a user record.');
  }

  return withFallbackRole(rows[0]);
}

async function createLegacyRawSession(input: {
  token: string;
  userId: string;
  scope: AuthScope;
  expiresAt: Date;
  includeTimestamps?: boolean;
  includeScope?: boolean;
}) {
  const sessionId = `session_${randomBytes(12).toString('hex')}`;
  const now = new Date();
  const columns = ['id', 'token', 'userId'];
  const values: unknown[] = [sessionId, input.token, input.userId];

  if (input.includeScope !== false) {
    columns.push('scope');
    values.push(input.scope);
  }

  columns.push('expiresAt');
  values.push(input.expiresAt);

  if (input.includeTimestamps) {
    columns.push('createdAt', 'updatedAt');
    values.push(now, now);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`);

  await prisma.$executeRawUnsafe(
    `INSERT INTO "AuthSession" (${columns.map((column) => `"${column}"`).join(', ')})
     VALUES (${placeholders.join(', ')})`,
    ...values
  );
}

export function isSchemaCompatibilityError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as any).code) : '';
  const message = String((error as any)?.message || '').toLowerCase();

  return (
    code === 'P2021' ||
    code === 'P2022' ||
    message.includes('does not exist') ||
    message.includes('column') ||
    message.includes('relation') ||
    message.includes('lastseenat') ||
    message.includes('lastsigninat') ||
    message.includes('loginattempt') ||
    message.includes('securityevent') ||
    message.includes('adminauditlog') ||
    message.includes('supportthread') ||
    message.includes('automationjob')
  );
}

export async function findUserForAuth(where: Prisma.UserWhereInput) {
  try {
    const user = await prisma.user.findFirst({
      where,
      select: modernUserSelect,
    });
    return user ? withFallbackRole(user) : null;
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    const user = await prisma.user.findFirst({
      where,
      select: legacyUserSelect,
    });

    return user ? withFallbackRole(user) : null;
  }
}

export async function findUserForSession(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: modernSessionUserSelect,
    });

    return user ? withFallbackRole(user) : null;
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: legacySessionUserSelect,
    });

    return user ? withFallbackRole(user) : null;
  }
}

export async function updateUserForAuth(
  userId: string,
  data: Prisma.UserUpdateInput,
  legacyData?: Prisma.UserUpdateInput | Prisma.UserUpdateInput[]
) {
  const fallbackData = Array.isArray(legacyData)
    ? legacyData.filter(Boolean)
    : legacyData
      ? [legacyData]
      : [];

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: modernUserSelect,
    });

    return withFallbackRole(user);
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    const updateAttempts = fallbackData.length ? fallbackData : [data];
    let lastError = error;

    for (const attempt of updateAttempts) {
      try {
        const user = await prisma.user.update({
          where: { id: userId },
          data: attempt,
          select: legacyUserSelect,
        });

        return withFallbackRole(user);
      } catch (fallbackError) {
        lastError = fallbackError;
        if (!isSchemaCompatibilityError(fallbackError)) {
          throw fallbackError;
        }
      }
    }

    for (const attempt of [...updateAttempts].reverse()) {
      try {
        return await updateLegacyRawUser(userId, attempt as Record<string, unknown>);
      } catch (rawError) {
        lastError = rawError;
        if (!isSchemaCompatibilityError(rawError)) {
          throw rawError;
        }
      }
    }

    throw lastError;
  }
}

export async function createUserForAuth(
  data: Prisma.UserCreateInput,
  legacyData?: Prisma.UserCreateInput | Prisma.UserCreateInput[]
) {
  const fallbackData = Array.isArray(legacyData)
    ? legacyData.filter(Boolean)
    : legacyData
      ? [legacyData]
      : [];

  try {
    const user = await prisma.user.create({
      data,
      select: modernUserSelect,
    });

    return withFallbackRole(user);
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    const createAttempts = fallbackData.length ? fallbackData : [data];
    let lastError = error;

    for (const attempt of createAttempts) {
      try {
        const user = await prisma.user.create({
          data: attempt,
          select: legacyUserSelect,
        });

        return withFallbackRole(user);
      } catch (fallbackError) {
        lastError = fallbackError;
        if (!isSchemaCompatibilityError(fallbackError)) {
          throw fallbackError;
        }
      }
    }

    for (const attempt of [...createAttempts].reverse()) {
      try {
        return await createLegacyRawUser(attempt as Record<string, unknown>);
      } catch (rawError) {
        lastError = rawError;
        if (!isSchemaCompatibilityError(rawError)) {
          throw rawError;
        }
      }
    }

    throw lastError;
  }
}

async function findSessionUserCore(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        role: true,
      },
    });

    return user ? withFallbackRole(user) : null;
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isAdmin: true,
      },
    });

    return user ? withFallbackRole(user) : null;
  }
}

export function mapUserToSessionUser(user: SessionUserRecord): SessionUser | null {
  if (!user.email) {
    return null;
  }

  const role = normalizeUserRole(user.role ?? null, user.isAdmin);
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
    marketingConsent: Boolean(user.marketingConsent),
    emailNotifications:
      typeof user.emailNotifications === 'boolean' ? user.emailNotifications : true,
    smsNotifications: Boolean(user.smsNotifications),
    whatsappNotifications: Boolean(user.whatsappNotifications),
    preferredContactChannel: user.preferredContactChannel || 'email',
    preferredLanguage: user.preferredLanguage || 'en',
    preferredCurrency: user.preferredCurrency || 'KES',
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
  const user = await findSessionUserCore(userId);

  if (!user) {
    throw new Error('User account could not be found.');
  }

  const role = normalizeUserRole(user.role ?? null, user.isAdmin || isAdminEmailAddress(user.email || ''));
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + getSessionMaxAgeSeconds(scope, role) * 1000);
  const now = new Date();

  try {
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
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    try {
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
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            isAdmin: role !== 'CUSTOMER',
          },
        }),
      ]);
    } catch (legacyError) {
      if (!isSchemaCompatibilityError(legacyError)) {
        throw legacyError;
      }

      if (scope === 'ADMIN' || role !== 'CUSTOMER') {
        try {
          await prisma.authSession.deleteMany({
            where: {
              userId,
              scope: 'ADMIN',
            },
          });
        } catch (deleteError) {
          if (!isSchemaCompatibilityError(deleteError)) {
            throw deleteError;
          }

          try {
            await prisma.$executeRawUnsafe(
              'DELETE FROM "AuthSession" WHERE "userId" = $1',
              userId
            );
          } catch (rawDeleteError) {
            if (!isSchemaCompatibilityError(rawDeleteError)) {
              throw rawDeleteError;
            }

            throw new Error('AUTH_SESSION_DELETE_FAILED');
          }
        }
      }

      try {
        await createLegacyRawSession({
          token,
          userId,
          scope,
          expiresAt,
          includeTimestamps: true,
          includeScope: true,
        });
      } catch (rawSessionError) {
        if (!isSchemaCompatibilityError(rawSessionError)) {
          throw rawSessionError;
        }

        try {
          await createLegacyRawSession({
            token,
            userId,
            scope,
            expiresAt,
            includeTimestamps: false,
            includeScope: true,
          });
        } catch (rawSessionFallbackError) {
          if (!isSchemaCompatibilityError(rawSessionFallbackError)) {
            throw rawSessionFallbackError;
          }

          try {
            await createLegacyRawSession({
              token,
              userId,
              scope,
              expiresAt,
              includeTimestamps: true,
              includeScope: false,
            });
          } catch (rawSessionNoScopeError) {
            if (!isSchemaCompatibilityError(rawSessionNoScopeError)) {
              throw rawSessionNoScopeError;
            }

            try {
              await createLegacyRawSession({
                token,
                userId,
                scope,
                expiresAt,
                includeTimestamps: false,
                includeScope: false,
              });
            } catch (rawSessionFinalError) {
              if (!isSchemaCompatibilityError(rawSessionFinalError)) {
                throw rawSessionFinalError;
              }

              throw new Error('AUTH_SESSION_INSERT_FAILED');
            }
          }
        }
      }

      try {
        await updateLegacyRawUser(userId, {
          lastSignInAt: now,
          isAdmin: role !== 'CUSTOMER',
        });
      } catch (rawUserError) {
        if (!isSchemaCompatibilityError(rawUserError)) {
          throw rawUserError;
        }

        try {
          await updateLegacyRawUser(userId, {
            isAdmin: role !== 'CUSTOMER',
          });
        } catch (rawUserFallbackError) {
          if (!isSchemaCompatibilityError(rawUserFallbackError)) {
            throw rawUserFallbackError;
          }

          throw new Error('AUTH_SESSION_USER_SYNC_FAILED');
        }
      }
    }
  }

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

  let session: SessionRecord | null = null;

  try {
    session = await prisma.authSession.findUnique({
      where: { token },
      select: {
        id: true,
        token: true,
        scope: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        lastSeenAt: true,
        user: {
          select: modernSessionUserSelect,
        },
      },
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    const legacySession = await prisma.authSession.findUnique({
      where: { token },
      select: {
        id: true,
        token: true,
        scope: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: legacySessionUserSelect,
        },
      },
    });

    session = legacySession
      ? {
          ...legacySession,
          lastSeenAt: legacySession.updatedAt ?? legacySession.createdAt,
          user: withFallbackRole(legacySession.user),
        }
      : null;

    if (!session) {
      try {
        const legacyScopeLessSession = await prisma.authSession.findUnique({
          where: { token },
          select: {
            id: true,
            token: true,
            userId: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: legacySessionUserSelect,
            },
          },
        });

        session = legacyScopeLessSession
          ? {
              ...legacyScopeLessSession,
              scope: 'CUSTOMER',
              lastSeenAt:
                legacyScopeLessSession.updatedAt ?? legacyScopeLessSession.createdAt,
              user: withFallbackRole(legacyScopeLessSession.user),
            }
          : null;
      } catch (scopeLessError) {
        if (!isSchemaCompatibilityError(scopeLessError)) {
          throw scopeLessError;
        }
      }
    }
  }

  if (!session) {
    return null;
  }

  const now = new Date();
  const role = normalizeUserRole(session.user.role ?? null, session.user.isAdmin);
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
    try {
      await prisma.authSession.update({
        where: { id: session.id },
        data: {
          lastSeenAt: now,
        },
      });
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) {
        throw error;
      }
    }
  }

  return session;
}

export async function getCurrentUser() {
  try {
    const session = await getSessionRecord();
    if (!session) {
      return null;
    }

    return mapUserToSessionUser(session.user);
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      return null;
    }

    throw error;
  }
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
