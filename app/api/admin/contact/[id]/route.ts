import { NextRequest, NextResponse } from 'next/server';
import { adminContactStatuses, requireAdminUser } from '@/lib/admin';
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
  const body = (await request.json()) as { status?: string };
  const status = String(body.status || '').toUpperCase();

  if (!adminContactStatuses.includes(status as (typeof adminContactStatuses)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid contact status.' }, { status: 400 });
  }

  const timestamp = new Date();
  const message = await prisma.contactMessage.update({
    where: { id },
    data: {
      status: status as (typeof adminContactStatuses)[number],
      readAt: status === 'NEW' ? null : timestamp,
      handledAt: status === 'HANDLED' ? timestamp : null,
    },
  });

  return NextResponse.json({ ok: true, message });
}
