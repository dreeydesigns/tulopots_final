import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  buildRoleInviteErrorUrl,
  buildRoleInviteRedirectUrl,
  claimRoleInvitation,
  clearRoleInvitationCookie,
  findUserForRoleInvitation,
  getRoleInvitationByToken,
  setRoleInvitationCookie,
  upgradeSessionForUser,
} from '@/lib/role-invitations';
import { getRequestOrigin } from '@/lib/request';

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const token = String(request.nextUrl.searchParams.get('token') || '').trim();

  if (!token) {
    return NextResponse.redirect(buildRoleInviteErrorUrl(origin, 'role_invite_invalid'));
  }

  try {
    const invitation = await getRoleInvitationByToken(token);

    if (!invitation) {
      return NextResponse.redirect(buildRoleInviteErrorUrl(origin, 'role_invite_invalid'));
    }

    if (invitation.status === 'EXPIRED') {
      return NextResponse.redirect(buildRoleInviteErrorUrl(origin, 'role_invite_expired'));
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.redirect(buildRoleInviteErrorUrl(origin, 'role_invite_used'));
    }

    const currentUser = await getCurrentUser().catch(() => null);
    const existingUser = await findUserForRoleInvitation(invitation.email);

    if (existingUser?.email) {
      const claim = await claimRoleInvitation({
        token,
        userId: existingUser.id,
        email: existingUser.email,
      });

      if (claim.outcome !== 'accepted' || !claim.user) {
        const url =
          claim.outcome === 'expired'
            ? buildRoleInviteErrorUrl(origin, 'role_invite_expired')
            : claim.outcome === 'used'
              ? buildRoleInviteErrorUrl(origin, 'role_invite_used')
              : buildRoleInviteErrorUrl(origin, 'role_invite_invalid');
        return NextResponse.redirect(url);
      }

      const response = NextResponse.redirect(
        currentUser?.email?.toLowerCase() === invitation.email
          ? new URL('/admin', origin)
          : buildRoleInviteRedirectUrl(origin, 'ready', invitation.email)
      );

      clearRoleInvitationCookie(response);

      if (currentUser?.email?.toLowerCase() === invitation.email) {
        await upgradeSessionForUser(response, claim.user).catch(() => undefined);
      }

      return response;
    }

    const response = NextResponse.redirect(
      buildRoleInviteRedirectUrl(origin, 'new', invitation.email)
    );
    setRoleInvitationCookie(response, token);
    return response;
  } catch (error) {
    console.error('[auth/role-invitations/verify] verification failed', error);
    return NextResponse.redirect(buildRoleInviteErrorUrl(origin, 'role_invite_invalid'));
  }
}
