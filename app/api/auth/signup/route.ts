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

function isValidPhone(phone: string) {
  return !phone || /^\+?[0-9]{10,15}$/.test(phone);
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

    const existing = await findUserForAuth({
      OR: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existing?.passwordHash) {
      return jsonError('An account with those details already exists.', 409);
    }

    const nextRole = normalizeUserRole(
      existing?.role || (isAdminEmailAddress(email) ? 'SUPER_ADMIN' : 'CUSTOMER'),
      existing?.isAdmin || isAdminEmailAddress(email)
    );

    const now = new Date();
    const user = existing
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
          return updateUserForAuth(existing.id, updateData, legacyUpdateData);
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
          return createUserForAuth(createData, legacyCreateData);
        })();

    const { token, expiresAt } = await createSession(
      user.id,
      nextRole !== 'CUSTOMER' ? 'ADMIN' : 'CUSTOMER'
    );
    const response = NextResponse.json({
      ok: true,
      user: mapUserToSessionUser(user),
    });

    attachSessionCookie(response, token, expiresAt);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return jsonError(
      getSafeErrorMessage(error, 'Unable to create your account right now.'),
      500
    );
  }
}
