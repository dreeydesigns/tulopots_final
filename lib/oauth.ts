import { createPrivateKey, randomBytes, sign as signToken } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  attachSessionCookie,
  createUserForAuth,
  createSession,
  findUserForAuth,
  isAdminEmailAddress,
  mergeAuthProviders,
  updateUserForAuth,
} from '@/lib/auth';
import {
  claimRoleInvitation,
  clearRoleInvitationCookie,
  getRoleInvitationCookie,
} from '@/lib/role-invitations';
import { getRequestOrigin, getSafeReturnPath } from '@/lib/request';

const OAUTH_STATE_COOKIE = 'tp_oauth_state';
const OAUTH_PROVIDER_COOKIE = 'tp_oauth_provider';
const OAUTH_RETURN_COOKIE = 'tp_oauth_return';
const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export type OAuthProvider = 'google' | 'apple';

type OAuthIdentity = {
  provider: OAuthProvider;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
};

type AppleUserPayload = {
  email?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
};

class OAuthFlowError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
  }
}

function normalizeEmail(email?: string | null) {
  const value = String(email || '').trim().toLowerCase();
  return value || null;
}

function setOAuthCookies(
  response: NextResponse,
  provider: OAuthProvider,
  state: string,
  returnTo: string
) {
  const sameSite =
    provider === 'apple' && process.env.NODE_ENV === 'production'
      ? ('none' as const)
      : ('lax' as const);
  const cookieOptions = {
    httpOnly: true,
    sameSite,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    priority: 'high' as const,
  };

  response.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    ...cookieOptions,
  });
  response.cookies.set({
    name: OAUTH_PROVIDER_COOKIE,
    value: provider,
    ...cookieOptions,
  });
  response.cookies.set({
    name: OAUTH_RETURN_COOKIE,
    value: returnTo,
    ...cookieOptions,
  });
}

function clearOAuthCookies(response: NextResponse, provider: OAuthProvider) {
  const sameSite =
    provider === 'apple' && process.env.NODE_ENV === 'production'
      ? ('none' as const)
      : ('lax' as const);
  const cookieOptions = {
    httpOnly: true,
    sameSite,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    priority: 'high' as const,
  };

  response.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: '',
    ...cookieOptions,
  });
  response.cookies.set({
    name: OAUTH_PROVIDER_COOKIE,
    value: '',
    ...cookieOptions,
  });
  response.cookies.set({
    name: OAUTH_RETURN_COOKIE,
    value: '',
    ...cookieOptions,
  });
}

function buildAuthErrorUrl(origin: string, returnTo: string, code: string) {
  const url = new URL(returnTo, origin);
  url.searchParams.set('authError', code);
  return url;
}

function buildAuthSuccessUrl(
  origin: string,
  returnTo: string,
  provider: OAuthProvider
) {
  const url = new URL(returnTo, origin);
  url.searchParams.delete('authError');
  url.searchParams.set('authSuccess', provider);
  return url;
}

function getGoogleRedirectUri(origin: string) {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/oauth/callback/google`;
}

function getAppleRedirectUri(origin: string) {
  return process.env.APPLE_REDIRECT_URI || `${origin}/api/auth/oauth/callback/apple`;
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function decodeJwtPayload(token: string) {
  const parts = token.split('.');

  if (parts.length < 2) {
    throw new OAuthFlowError('oauth_failed', 'Malformed identity token.');
  }

  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<
    string,
    unknown
  >;
}

function buildAppleClientSecret() {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new OAuthFlowError(
      'provider_unavailable',
      'Apple sign-in is not configured yet.'
    );
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
  };
  const payload = {
    iss: teamId,
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 24 * 180,
    aud: 'https://appleid.apple.com',
    sub: clientId,
  };
  const signingInput = `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(
    JSON.stringify(payload)
  )}`;
  const key = createPrivateKey(privateKey);
  const signature = signToken('sha256', Buffer.from(signingInput), {
    key,
    dsaEncoding: 'ieee-p1363',
  });

  return `${signingInput}.${encodeBase64Url(signature)}`;
}

async function exchangeGoogleCode(code: string, origin: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new OAuthFlowError(
      'provider_unavailable',
      'Google sign-in is not configured yet.'
    );
  }

  const tokenBody = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getGoogleRedirectUri(origin),
    grant_type: 'authorization_code',
  });
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody.toString(),
  });
  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
  };

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new OAuthFlowError(
      'google_exchange_failed',
      'Google sign-in could not be completed.'
    );
  }

  const profileResponse = await fetch(
    'https://openidconnect.googleapis.com/v1/userinfo',
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: 'no-store',
    }
  );
  const profile = (await profileResponse.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (!profileResponse.ok || !profile.sub) {
    throw new OAuthFlowError(
      'google_profile_failed',
      'Google sign-in could not load your account.'
    );
  }

  return {
    provider: 'google' as const,
    providerAccountId: profile.sub,
    email: normalizeEmail(profile.email),
    name: profile.name || null,
    avatar: profile.picture || null,
  };
}

async function exchangeAppleCode(
  code: string,
  origin: string,
  userPayload?: AppleUserPayload
) {
  const clientId = process.env.APPLE_CLIENT_ID;

  if (!clientId) {
    throw new OAuthFlowError(
      'provider_unavailable',
      'Apple sign-in is not configured yet.'
    );
  }

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: buildAppleClientSecret(),
    code,
    grant_type: 'authorization_code',
    redirect_uri: getAppleRedirectUri(origin),
  });
  const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody.toString(),
  });
  const tokenData = (await tokenResponse.json()) as {
    id_token?: string;
  };

  if (!tokenResponse.ok || !tokenData.id_token) {
    throw new OAuthFlowError(
      'apple_exchange_failed',
      'Apple sign-in could not be completed.'
    );
  }

  const payload = decodeJwtPayload(tokenData.id_token);
  const providerAccountId = String(payload.sub || '');
  const email =
    normalizeEmail(String(payload.email || '')) ||
    normalizeEmail(userPayload?.email || '');
  const fullName = [userPayload?.name?.firstName, userPayload?.name?.lastName]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ');

  if (!providerAccountId) {
    throw new OAuthFlowError(
      'apple_identity_missing',
      'Apple sign-in did not return an account identity.'
    );
  }

  return {
    provider: 'apple' as const,
    providerAccountId,
    email,
    name: fullName || null,
    avatar: null,
  };
}

async function upsertOAuthUser(identity: OAuthIdentity) {
  const email = normalizeEmail(identity.email);
  const providerField =
    identity.provider === 'google'
      ? { googleId: identity.providerAccountId }
      : { appleId: identity.providerAccountId };
  const existing = await findUserForAuth({
    OR: [providerField, ...(email ? [{ email }] : [])],
  });
  const existingAvatar =
    existing && 'avatar' in existing ? (existing.avatar ?? null) : null;

  if (!existing && !email) {
    throw new OAuthFlowError(
      'account_missing_email',
      'We could not determine an email address for this account.'
    );
  }

  const providerLabel = mergeAuthProviders(existing?.provider, identity.provider);
  const nextName =
    identity.name ||
    existing?.name ||
    (email ? email.split('@')[0] : `${identity.provider} account`);

  if (existing) {
    const updateData = {
      name: nextName,
      email: email || existing.email,
      avatar: identity.avatar || existingAvatar,
      provider: providerLabel,
      isAdmin: email
        ? existing.isAdmin || isAdminEmailAddress(email)
        : existing.isAdmin,
      ...providerField,
    };
    const legacyUpdateData = {
      name: nextName,
      email: email || existing.email,
      provider: providerLabel,
      isAdmin: email
        ? existing.isAdmin || isAdminEmailAddress(email)
        : existing.isAdmin,
      ...providerField,
    };
    const minimalLegacyUpdateData = {
      name: nextName,
      email: email || existing.email,
      provider: providerLabel,
      isAdmin: email
        ? existing.isAdmin || isAdminEmailAddress(email)
        : existing.isAdmin,
      ...providerField,
    };
    const classicLegacyUpdateData = {
      name: nextName,
      email: email || existing.email,
      isAdmin: email
        ? existing.isAdmin || isAdminEmailAddress(email)
        : existing.isAdmin,
    };
    return updateUserForAuth(existing.id, updateData, [
      legacyUpdateData,
      minimalLegacyUpdateData,
      classicLegacyUpdateData,
    ]);
  }

  const createData = {
    name: nextName,
    email,
    avatar: identity.avatar || null,
    provider: providerLabel,
    isAdmin: email ? isAdminEmailAddress(email) : false,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    preferredContactChannel: 'email',
    preferredLanguage: 'en',
    preferredCurrency: 'KES',
    defaultShippingCountry: 'KE',
    ...providerField,
  };
  const legacyCreateData = {
    name: nextName,
    email,
    avatar: identity.avatar || null,
    provider: providerLabel,
    isAdmin: email ? isAdminEmailAddress(email) : false,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    preferredContactChannel: 'email',
    preferredLanguage: 'en',
    preferredCurrency: 'KES',
    defaultShippingCountry: 'KE',
    ...providerField,
  };
  const minimalLegacyCreateData = {
    name: nextName,
    email,
    provider: providerLabel,
    isAdmin: email ? isAdminEmailAddress(email) : false,
    ...providerField,
  };
  const classicLegacyCreateData = {
    name: nextName,
    email,
    isAdmin: email ? isAdminEmailAddress(email) : false,
  };
  return createUserForAuth(createData, [
    legacyCreateData,
    minimalLegacyCreateData,
    classicLegacyCreateData,
  ]);
}

function getGoogleAuthorizeUrl(origin: string, state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new OAuthFlowError(
      'provider_unavailable',
      'Google sign-in is not configured yet.'
    );
  }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', getGoogleRedirectUri(origin));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');

  return url.toString();
}

function getAppleAuthorizeUrl(origin: string, state: string) {
  const clientId = process.env.APPLE_CLIENT_ID;

  if (!clientId) {
    throw new OAuthFlowError(
      'provider_unavailable',
      'Apple sign-in is not configured yet.'
    );
  }

  const url = new URL('https://appleid.apple.com/auth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', getAppleRedirectUri(origin));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('response_mode', 'form_post');
  url.searchParams.set('scope', 'name email');
  url.searchParams.set('state', state);

  return url.toString();
}

export function getAuthProviderStatus() {
  return {
    password: true,
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
    apple: Boolean(
      process.env.APPLE_CLIENT_ID &&
        process.env.APPLE_TEAM_ID &&
        process.env.APPLE_KEY_ID &&
        process.env.APPLE_PRIVATE_KEY
    ),
  };
}

export async function startOAuthFlow(
  request: NextRequest,
  provider: OAuthProvider,
  returnTo?: string,
  mode: 'json' | 'redirect' = 'json'
) {
  const origin = getRequestOrigin(request);
  const safeReturnTo = getSafeReturnPath(returnTo);
  const state = randomBytes(24).toString('hex');
  const authorizeUrl =
    provider === 'google'
      ? getGoogleAuthorizeUrl(origin, state)
      : getAppleAuthorizeUrl(origin, state);
  const response =
    mode === 'redirect'
      ? NextResponse.redirect(authorizeUrl)
      : NextResponse.json({
          ok: true,
          provider,
          url: authorizeUrl,
        });

  setOAuthCookies(response, provider, state, safeReturnTo);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function completeOAuthFlow(input: {
  request: NextRequest;
  provider: OAuthProvider;
  code?: string | null;
  state?: string | null;
  providerError?: string | null;
  appleUserPayload?: AppleUserPayload;
}) {
  const origin = getRequestOrigin(input.request);
  const cookieStore = await cookies();
  const returnTo = getSafeReturnPath(
    cookieStore.get(OAUTH_RETURN_COOKIE)?.value
  );

  try {
    if (input.providerError) {
      throw new OAuthFlowError(
        'oauth_access_denied',
        'The sign-in request was cancelled.'
      );
    }

    const code = String(input.code || '').trim();
    const state = String(input.state || '').trim();
    const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value || '';
    const expectedProvider = cookieStore.get(OAUTH_PROVIDER_COOKIE)?.value || '';

    if (!code || !state || !expectedState || state !== expectedState) {
      throw new OAuthFlowError(
        'invalid_state',
        'This sign-in request has expired. Please try again.'
      );
    }

    if (expectedProvider !== input.provider) {
      throw new OAuthFlowError(
        'invalid_state',
        'This sign-in request no longer matches the selected provider.'
      );
    }

    const identity =
      input.provider === 'google'
        ? await exchangeGoogleCode(code, origin)
        : await exchangeAppleCode(code, origin, input.appleUserPayload);
    let user = await upsertOAuthUser(identity);
    const roleInvitationToken = getRoleInvitationCookie(input.request);
    let clearRoleInviteAfterResponse = false;

    if (roleInvitationToken && user.email) {
      const claimResult = await claimRoleInvitation({
        token: roleInvitationToken,
        userId: user.id,
        email: user.email,
      });

      if (claimResult.outcome === 'accepted' && claimResult.user) {
        user = claimResult.user;
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

    const { token, expiresAt } = await createSession(
      user.id,
      user.isAdmin ? 'ADMIN' : 'CUSTOMER'
    );
    const response = NextResponse.redirect(
      buildAuthSuccessUrl(origin, returnTo, input.provider)
    );

    clearOAuthCookies(response, input.provider);
    attachSessionCookie(response, token, expiresAt);
    if (clearRoleInviteAfterResponse) {
      clearRoleInvitationCookie(response);
    }
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    const code =
      error instanceof OAuthFlowError ? error.code : 'oauth_failed';
    const response = NextResponse.redirect(
      buildAuthErrorUrl(origin, returnTo, code)
    );

    clearOAuthCookies(response, input.provider);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
}
