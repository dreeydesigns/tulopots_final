import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { recordAdminAudit } from '@/lib/security/audit';

const allowedRoles = [
  'SUPER_ADMIN',
  'OPERATIONS_ADMIN',
  'DELIVERY_ADMIN',
  'CONTENT_ADMIN',
  'SUPPORT_ADMIN',
  'ANALYST',
  'CUSTOMER',
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser('roles.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { role?: string };
  const nextRole = String(body.role || '').toUpperCase();

  if (!allowedRoles.includes(nextRole as (typeof allowedRoles)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid role.' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json({ ok: false, error: 'Admin account not found.' }, { status: 404 });
  }

  if (targetUser.role === 'SUPER_ADMIN' && nextRole !== 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({
      where: {
        role: 'SUPER_ADMIN',
      },
    });

    if (superAdminCount <= 1) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You need at least one Super Admin account at all times.',
        },
        { status: 400 }
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role: nextRole as (typeof allowedRoles)[number],
      isAdmin: nextRole !== 'CUSTOMER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
      lastSignInAt: true,
      createdAt: true,
    },
  });

  await recordAdminAudit({
    actorUserId: adminUser.id,
    action: 'admin.role.update',
    targetType: 'user',
    targetId: updatedUser.id,
    summary: `Changed ${updatedUser.email || updatedUser.name || updatedUser.id} to ${nextRole}.`,
    diffJson: {
      previousRole: targetUser.role,
      nextRole,
      previousIsAdmin: targetUser.isAdmin,
      nextIsAdmin: nextRole !== 'CUSTOMER',
    },
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, user: updatedUser });
}
