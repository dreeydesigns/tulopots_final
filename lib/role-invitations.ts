import { createHash, randomBytes } from 'node:crypto';
import type { RoleInvitationStatus, UserRole } from '@prisma/client';
import type { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  findUserForAuth,
  isSchemaCompatibilityError,
  updateUserForAuth,
  attachSessionCookie,
} from '@/lib/auth';
import { dispatchNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { getSafeReturnPath, resolveBaseUrl } from '@/lib/request';
import { recordAdminAudit } from '@/lib/security/audit';

export const ROLE_INVITATION_COOKIE = 'tp_role_invite';
const ROLE_INVITATION_TTL_DAYS = 7;
const ROLE_INVITATION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * ROLE_INVITATION_TTL_DAYS;

const roleInvitationSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  expiresAt: true,
  acceptedAt: true,
  revokedAt: true,
  createdAt: true,
  invitedByUserId: true,
  invitedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

type RoleInvitationRecord = {
  id: string;
  email: string;
  role: UserRole;
  status: RoleInvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  invitedByUserId: string;
  invitedBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

type ClaimOutcome =
  | 'accepted'
  | 'missing'
  | 'expired'
  | 'used'
  | 'email_mismatch'
  | 'invalid';

export function normalizeInvitationEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashRoleInvitationToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function buildRoleInvitationVerificationUrl(token: string, baseUrl?: string | null) {
  const url = new URL('/api/auth/role-invitations/verify', resolveBaseUrl(baseUrl));
  url.searchParams.set('token', token);
  return url.toString();
}

export function getRoleInvitationCookie(request: NextRequest) {
  return request.cookies.get(ROLE_INVITATION_COOKIE)?.value || null;
}

export function setRoleInvitationCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ROLE_INVITATION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ROLE_INVITATION_COOKIE_MAX_AGE_SECONDS,
    priority: 'high',
  });
}

export function clearRoleInvitationCookie(response: NextResponse) {
  response.cookies.set({
    name: ROLE_INVITATION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    priority: 'high',
  });
}

function describeRole(role: UserRole) {
  return role.replaceAll('_', ' ').toLowerCase();
}

function buildInvitationEmailBody(input: {
  role: UserRole;
  verificationUrl: string;
  invitedByName?: string | null;
}) {
  return [
    `You have been invited to join TuloPots as ${describeRole(input.role)}.`,
    input.invitedByName
      ? `${input.invitedByName} set this access for you from the Super Admin security layer.`
      : 'A TuloPots Super Admin set this access for you from the security layer.',
    'Verify this email to activate the role on the website.',
    input.verificationUrl,
    'If you already have an account with this email, the role will attach to that account after verification. If you are new, verify first, then create or sign in with the same email to activate access.',
  ].join('\n\n');
}

async function markInvitationExpired(invitationId: string) {
  try {
    await prisma.roleInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'EXPIRED',
      },
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }
  }
}

export async function createRoleInvitation(input: {
  email: string;
  role: UserRole;
  invitedByUserId: string;
  baseUrl?: string | null;
}) {
  const email = normalizeInvitationEmail(input.email);
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashRoleInvitationToken(token);
  const expiresAt = new Date(Date.now() + ROLE_INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.roleInvitation
    .updateMany({
      where: {
        email,
        status: 'PENDING',
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    })
    .catch((error) => {
      if (!isSchemaCompatibilityError(error)) {
        throw error;
      }
    });

  const invitation = (await prisma.roleInvitation.create({
    data: {
      email,
      role: input.role,
      tokenHash,
      invitedByUserId: input.invitedByUserId,
      expiresAt,
    },
    select: roleInvitationSelect,
  })) as RoleInvitationRecord;

  const verificationUrl = buildRoleInvitationVerificationUrl(token, input.baseUrl);
  const delivery = await dispatchNotification({
    userId: null,
    templateKey: 'admin-role-invitation',
    channel: 'EMAIL',
    destination: email,
    payload: {
      title: `Verify your TuloPots ${describeRole(input.role)} access`,
      body: buildInvitationEmailBody({
        role: input.role,
        verificationUrl,
        invitedByName: invitation.invitedBy.name,
      }),
      meta: {
        verificationUrl,
        role: input.role,
      },
    },
  });

  return {
    invitation,
    verificationUrl,
    delivery,
  };
}

export async function listRoleInvitations(limit = 12) {
  try {
    const invitations = await prisma.roleInvitation.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      select: roleInvitationSelect,
    });

    const now = Date.now();
    return invitations.map((invitation) => {
      const status =
        invitation.status === 'PENDING' && invitation.expiresAt.getTime() <= now
          ? 'EXPIRED'
          : invitation.status;
      return {
        ...invitation,
        status,
      };
    });
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      return [];
    }
    throw error;
  }
}

export async function getRoleInvitationByToken(token: string) {
  const tokenHash = hashRoleInvitationToken(token);

  try {
    const invitation = (await prisma.roleInvitation.findUnique({
      where: { tokenHash },
      select: roleInvitationSelect,
    })) as RoleInvitationRecord | null;

    if (!invitation) {
      return null;
    }

    if (
      invitation.status === 'PENDING' &&
      invitation.expiresAt.getTime() <= Date.now()
    ) {
      await markInvitationExpired(invitation.id);
      return {
        ...invitation,
        status: 'EXPIRED' as const,
      };
    }

    return invitation;
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      return null;
    }
    throw error;
  }
}

export async function claimRoleInvitation(input: {
  token: string;
  userId: string;
  email: string;
}) {
  const invitation = await getRoleInvitationByToken(input.token);

  if (!invitation) {
    return { outcome: 'missing' as ClaimOutcome, invitation: null, user: null };
  }

  if (invitation.status === 'EXPIRED') {
    return { outcome: 'expired' as ClaimOutcome, invitation, user: null };
  }

  if (invitation.status !== 'PENDING') {
    return { outcome: 'used' as ClaimOutcome, invitation, user: null };
  }

  if (normalizeInvitationEmail(input.email) !== invitation.email) {
    return { outcome: 'email_mismatch' as ClaimOutcome, invitation, user: null };
  }

  const updatedUser = await updateUserForAuth(
    input.userId,
    {
      role: invitation.role,
      isAdmin: invitation.role !== 'CUSTOMER',
    },
    {
      isAdmin: invitation.role !== 'CUSTOMER',
    }
  );

  await prisma.roleInvitation.update({
    where: { id: invitation.id },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
      acceptedByUserId: updatedUser.id,
    },
  });

  await recordAdminAudit({
    actorUserId: invitation.invitedByUserId,
    action: 'admin.role_invitation.accepted',
    targetType: 'role_invitation',
    targetId: invitation.id,
    summary: `${invitation.email} verified and accepted ${invitation.role.replaceAll('_', ' ')} access.`,
    diffJson: {
      email: invitation.email,
      role: invitation.role,
      acceptedByUserId: updatedUser.id,
    },
  }).catch(() => undefined);

  return {
    outcome: 'accepted' as ClaimOutcome,
    invitation,
    user: updatedUser,
  };
}

export async function upgradeSessionForUser(
  response: NextResponse,
  user: {
    id: string;
    role?: UserRole | null;
    isAdmin: boolean;
  }
) {
  const scope = user.role !== 'CUSTOMER' || user.isAdmin ? 'ADMIN' : 'CUSTOMER';
  const session = await createSession(user.id, scope);
  attachSessionCookie(response, session.token, session.expiresAt);
  return session;
}

export function buildRoleInviteRedirectUrl(
  baseUrl: string,
  status: 'ready' | 'new',
  email: string
) {
  const url = new URL('/', resolveBaseUrl(baseUrl));
  url.searchParams.set('roleInvite', status);
  url.searchParams.set('inviteEmail', email);
  return url;
}

export function buildRoleInviteErrorUrl(
  baseUrl: string,
  code: 'role_invite_invalid' | 'role_invite_expired' | 'role_invite_used'
) {
  const url = new URL('/', resolveBaseUrl(baseUrl));
  url.searchParams.set('authError', code);
  return url;
}

export async function findUserForRoleInvitation(email: string) {
  return findUserForAuth({ email: normalizeInvitationEmail(email) });
}

export function getSafeRoleInviteReturnPath(value?: string | null) {
  return getSafeReturnPath(value || '/');
}
