import { NextRequest, NextResponse } from 'next/server';
import { adminStudioStatuses, requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser('studio.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; internalNotes?: string };
  const status = String(body.status || '').toUpperCase();

  if (status && !adminStudioStatuses.includes(status as (typeof adminStudioStatuses)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid studio status.' }, { status: 400 });
  }

  const brief = await prisma.studioBrief.update({
    where: { id },
    data: {
      ...(status ? { status: status as (typeof adminStudioStatuses)[number] } : {}),
      ...(body.internalNotes !== undefined
        ? { internalNotes: body.internalNotes || null }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, brief });
}
