import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  attachSessionCookie,
  createUserForAuth,
  createSession,
  findUserForAuth,
  updateUserForAuth,
  hashPassword,
  isAdminEmailAddress,
  isValidEmail,
  isValidPassword,
  mapUserToSessionUser,
  mergeAuthProviders,
} from '@/lib/auth';
import { normalizeUserRole } from '@/lib/access';
import {
  currencyForCountry,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  resolveSupportedCountry,
  resolveSupportedCurrency,
  resolveSupportedLanguage,
} from '@/lib/customer-preferences';
import { CURRENT_POLICY_VERSION } from '@/lib/policies';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { signupSchema } from '@/lib/security/validation';
import { recordSecurityEvent } from '@/lib/security/audit';
import {
  claimRoleInvitation,
  clearRoleInvitationCookie,
  getRoleInvitationCookie,
} from '@/lib/role-invitations';

function isValidPhone(phone: string) {
  return !phone || /^\+?[0-9]{10,15}$/.test(phone);
}

function getAuthFailureDetail(error: unknown) {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code || '').toUpperCase()
      : '';
  const message = String((error as Error | null | undefined)?.message || '').toLowerCase();

  if (code === 'P1001' || message.includes("can't reach database server")) {
    return 'DB_UNREACHABLE';
  }

  if (code === 'P2002' || message.includes('unique constraint')) {
    return 'UNIQUE_CONSTRAINT';
  }

  if (
    message.includes('auth_session_insert_failed')
  ) {
    return 'SESSION_INSERT_FAILED';
  }

  if (
    message.includes('auth_session_user_sync_failed')
  ) {
    return 'SESSION_USER_SYNC_FAILED';
  }

  if (
    message.includes('auth_session_delete_failed')
  ) {
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

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/auth/signup',
      limit: 6,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many account creation attempts. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = signupSchema.safeParse(await request.json());

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/auth/signup',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('Please complete the required account details.', 400);
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim().toLowerCase();
    const phone = parsed.data.phone.trim();
    const password = parsed.data.password;
    const acceptTerms = parsed.data.acceptTerms;
    const acceptPrivacy = parsed.data.acceptPrivacy;
    const marketingConsent = parsed.data.marketingConsent;
    const defaultShippingCountry = resolveSupportedCountry(
      parsed.data.defaultShippingCountry || DEFAULT_COUNTRY
    );
    const preferredLanguage = resolveSupportedLanguage(
      parsed.data.preferredLanguage || DEFAULT_LANGUAGE
    );
    const preferredCurrency = resolveSupportedCurrency(
      parsed.data.preferredCurrency ||
        currencyForCountry(defaultShippingCountry) ||
        DEFAULT_CURRENCY
    );

    if (!name) {
      return jsonError('Full name is required.', 400);
    }

    if (!isValidEmail(email)) {
      return jsonError('Enter a valid email address.', 400);
    }

    if (!isValidPhone(phone)) {
      return jsonError('Enter a valid phone number.', 400);
    }

    if (!isValidPassword(password)) {
      return jsonError('Password must be at least 8 characters.', 400);
    }

    if (!acceptTerms || !acceptPrivacy) {
      return jsonError('You need to accept the Terms and Privacy Policy to continue.', 400);
    }

    let existing;
    try {
      existing = await findUserForAuth({
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      });
    } catch (error) {
      console.error('[auth/signup] lookup failed', error);
      return jsonError('Unable to access account records right now.', 500, {
        code: 'AUTH_LOOKUP_FAILED',
      });
    }

    if (existing?.passwordHash) {
      return jsonError('An account with those details already exists.', 409);
    }

    const nextRole = normalizeUserRole(
      existing?.role || (isAdminEmailAddress(email) ? 'SUPER_ADMIN' : 'CUSTOMER'),
      existing?.isAdmin || isAdminEmailAddress(email)
    );

    const now = new Date();
    let user;
    try {
      user = existing
        ? await (async () => {
            const updateData = {
              name,
              email,
              phone: phone || null,
              passwordHash: hashPassword(password),
              provider: mergeAuthProviders(existing.provider, 'password'),
              isAdmin: nextRole !== 'CUSTOMER',
              role: nextRole,
              acceptedTermsAt: now,
              acceptedPrivacyAt: now,
              acceptedPolicyVersion: CURRENT_POLICY_VERSION,
              marketingConsent,
              marketingConsentAt: marketingConsent ? now : null,
              emailNotifications: true,
              smsNotifications: false,
              whatsappNotifications: false,
              preferredContactChannel: 'email',
              preferredLanguage,
              preferredCurrency,
              defaultShippingCountry,
            };
            const legacyUpdateData = {
              name,
              email,
              phone: phone || null,
              passwordHash: hashPassword(password),
              provider: mergeAuthProviders(existing.provider, 'password'),
              isAdmin: nextRole !== 'CUSTOMER',
              acceptedTermsAt: now,
              acceptedPrivacyAt: now,
              acceptedPolicyVersion: CURRENT_POLICY_VERSION,
              marketingConsent,
              marketingConsentAt: marketingConsent ? now : null,
              emailNotifications: true,
              smsNotifications: false,
              whatsappNotifications: false,
              preferredContactChannel: 'email',
              preferredLanguage,
              preferredCurrency,
              defaultShippingCountry,
            };
            const minimalLegacyUpdateData = {
              name,
              email,
              phone: phone || null,
              passwordHash: hashPassword(password),
              provider: mergeAuthProviders(existing.provider, 'password'),
              isAdmin: nextRole !== 'CUSTOMER',
            };
            const classicLegacyUpdateData = {
              name,
              email,
              passwordHash: hashPassword(password),
              isAdmin: nextRole !== 'CUSTOMER',
            };
            return updateUserForAuth(existing.id, updateData, [
              legacyUpdateData,
              minimalLegacyUpdateData,
              classicLegacyUpdateData,
            ]);
          })()
        : await (async () => {
            const createData = {
              name,
              email,
              phone: phone || null,
              passwordHash: hashPassword(password),
              provider: 'password',
              isAdmin: nextRole !== 'CUSTOMER',
              role: nextRole,
              acceptedTermsAt: now,
              acceptedPrivacyAt: now,
              acceptedPolicyVersion: CURRENT_POLICY_VERSION,
              marketingConsent,
              marketingConsentAt: marketingConsent ? now : null,
              emailNotifications: true,
              smsNotifications: false,
              whatsappNotifications: false,
              preferredContactChannel: 'email',
              preferredLanguage,
              preferredCurrency,
              defaultShippingCountry,
            };
            const legacyCreateData = {
              name,
              email,
              phone: phone || null,
              passwordHash: hashPassword(password),
              provider: 'password',
              isAdmin: nextRole !== 'CUSTOMER',
              acceptedTermsAt: now,
              acceptedPrivacyAt: now,
              acceptedPolicyVersion: CURRENT_POLICY_VERSION,
              marketingConsent,
              marketingConsentAt: marketingConsent ? now : null,
              emailNotifications: true,
              smsNotifications: false,
              whatsappNotifications: false,
              preferredContactChannel: 'email',
              preferredLanguage,
              preferredCurrency,
              defaultShippingCountry,
            };
            const minimalLegacyCreateData = {
              name,
              email,
              phone: phone || null,
              passwordHash: hashPassword(password),
              provider: 'password',
              isAdmin: nextRole !== 'CUSTOMER',
            };
            const classicLegacyCreateData = {
              name,
              email,
              passwordHash: hashPassword(password),
              isAdmin: nextRole !== 'CUSTOMER',
            };
            return createUserForAuth(createData, [
              legacyCreateData,
              minimalLegacyCreateData,
              classicLegacyCreateData,
            ]);
          })();
    } catch (error) {
      console.error('[auth/signup] account create failed', error);
      return jsonError('Unable to create your account right now.', 500, {
        code: 'AUTH_CREATE_FAILED',
        detail: getAuthFailureDetail(error),
      });
    }

    const roleInvitationToken = getRoleInvitationCookie(request);
    let clearRoleInviteAfterResponse = false;
    let effectiveRole = nextRole;

    if (roleInvitationToken) {
      const claimResult = await claimRoleInvitation({
        token: roleInvitationToken,
        userId: user.id,
        email,
      });

      if (claimResult.outcome === 'accepted' && claimResult.user) {
        user = claimResult.user;
        effectiveRole = normalizeUserRole(claimResult.user.role, claimResult.user.isAdmin);
        clearRoleInviteAfterResponse = true;
      } else if (
        claimResult.outcome === 'missing' ||
        claimResult.outcome === 'expired' ||
        claimResult.outcome === 'used' ||
        claimResult.outcome === 'invalid'
      ) {
        clearRoleInviteAfterResponse = true;
      }
    }

    let token;
    let expiresAt;
    try {
      const session = await createSession(
        user.id,
        effectiveRole !== 'CUSTOMER' ? 'ADMIN' : 'CUSTOMER'
      );
      token = session.token;
      expiresAt = session.expiresAt;
    } catch (error) {
      console.error('[auth/signup] session create failed', error);
      return jsonError('Unable to start your session right now.', 500, {
        code: 'AUTH_SESSION_FAILED',
        detail: getAuthFailureDetail(error),
      });
    }
    const sessionUser = mapUserToSessionUser(user);
    if (!sessionUser) {
      return jsonError('Your account could not be prepared. Please contact support.', 500, {
        code: 'AUTH_MAP_FAILED',
      });
    }
    const response = NextResponse.json({
      ok: true,
      user: sessionUser,
    });

    attachSessionCookie(response, token, expiresAt);
    if (clearRoleInviteAfterResponse) {
      clearRoleInvitationCookie(response);
    }
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return jsonError(
      getSafeErrorMessage(error, 'Unable to create your account right now.'),
      500
    );
  }
}
