import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/admin';
import { recordAdminAudit } from '@/lib/security/audit';

const supportStatuses = ['OPEN', 'PENDING', 'RESOLVED'] as const;
const supportPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser('support.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: string;
    priority?: string;
    note?: string;
  };

  const status = body.status ? String(body.status).toUpperCase() : undefined;
  const priority = body.priority ? String(body.priority).toUpperCase() : undefined;
  const note = String(body.note || '').trim();

  if (status && !supportStatuses.includes(status as (typeof supportStatuses)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid support status.' }, { status: 400 });
  }

  if (priority && !supportPriorities.includes(priority as (typeof supportPriorities)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid support priority.' }, { status: 400 });
  }

  const existingThread = await prisma.supportThread.findUnique({
    where: { id },
  });

  if (!existingThread) {
    return NextResponse.json({ ok: false, error: 'Support thread not found.' }, { status: 404 });
  }

  const thread = await prisma.supportThread.update({
    where: { id },
    data: {
      status: (status as (typeof supportStatuses)[number] | undefined) ?? undefined,
      priority: (priority as (typeof supportPriorities)[number] | undefined) ?? undefined,
      lastAdminMessageAt: note ? new Date() : existingThread.lastAdminMessageAt,
    },
  });

  if (note) {
    await prisma.supportMessage.create({
      data: {
        threadId: thread.id,
        role: 'ADMIN',
        channel: 'ADMIN_NOTE',
        body: note,
      },
    });
  }

  await recordAdminAudit({
    actorUserId: adminUser.id,
    action: 'support.thread.update',
    targetType: 'supportThread',
    targetId: thread.id,
    summary: `Updated support thread ${thread.id}.`,
    diffJson: {
      previousStatus: existingThread.status,
      nextStatus: status || existingThread.status,
      previousPriority: existingThread.priority,
      nextPriority: priority || existingThread.priority,
      noteAdded: Boolean(note),
    },
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, thread });
}
