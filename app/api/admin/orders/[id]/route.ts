import { NextRequest, NextResponse } from 'next/server';
import { adminOrderStatuses, requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; adminNotes?: string };
  const status = String(body.status || '').toUpperCase();

  if (status && !adminOrderStatuses.includes(status as (typeof adminOrderStatuses)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid order status.' }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status ? { status: status as (typeof adminOrderStatuses)[number] } : {}),
      ...(body.adminNotes !== undefined ? { adminNotes: body.adminNotes || null } : {}),
    },
  });

  return NextResponse.json({ ok: true, order });
}
