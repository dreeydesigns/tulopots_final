import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { createRoleInvitation } from '@/lib/role-invitations';
import { getRequestOrigin } from '@/lib/request';
import { recordAdminAudit, recordSecurityEvent } from '@/lib/security/audit';
import { roleInvitationSchema } from '@/lib/security/validation';

export async function POST(request: NextRequest) {
  const adminUser = await requireAdminUser('roles.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = roleInvitationSchema.safeParse(await request.json());

  if (!parsed.success) {
    await recordSecurityEvent({
      type: 'INVALID_INPUT',
      severity: 'WARNING',
      route: '/api/admin/security/role-invitations',
      userId: adminUser.id,
      metadata: {
        issues: parsed.error.flatten(),
      },
    }).catch(() => undefined);

    return NextResponse.json(
      { ok: false, error: 'Enter a valid email and role before sending access.' },
      { status: 400 }
    );
  }

  try {
    const result = await createRoleInvitation({
      email: parsed.data.email,
      role: parsed.data.role,
      invitedByUserId: adminUser.id,
      baseUrl: getRequestOrigin(request),
    });

    await recordAdminAudit({
      actorUserId: adminUser.id,
      action: 'admin.role_invitation.created',
      targetType: 'role_invitation',
      targetId: result.invitation.id,
      summary: `Sent ${parsed.data.role.replaceAll('_', ' ')} access invitation to ${parsed.data.email}.`,
      diffJson: {
        email: parsed.data.email,
        role: parsed.data.role,
        deliveryStatus: result.delivery.status,
        deliveryProvider: result.delivery.provider,
      },
    }).catch(() => undefined);

    return NextResponse.json({
      ok: true,
      invitation: {
        id: result.invitation.id,
        email: result.invitation.email,
        role: result.invitation.role,
        status: result.invitation.status,
        expiresAt: result.invitation.expiresAt.toISOString(),
        createdAt: result.invitation.createdAt.toISOString(),
      },
      delivery: {
        status: result.delivery.status,
        provider: result.delivery.provider,
      },
      verificationUrl: result.verificationUrl,
      message:
        result.delivery.status === 'SENT'
          ? 'Role invitation sent by email. Once the person verifies, the role will activate on the website.'
          : result.delivery.status === 'MOCKED'
            ? 'The invitation is ready, but email sending is not configured yet. Use the verification link below until email is connected.'
            : 'The invitation was created, but the email provider did not deliver it. Use the verification link below while you check email settings.',
    });
  } catch (error) {
    console.error('[admin/security/role-invitations] create failed', error);
    return NextResponse.json(
      { ok: false, error: 'Unable to prepare that role invitation right now.' },
      { status: 500 }
    );
  }
}
