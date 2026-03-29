import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { key } = await params;
  const body = (await request.json()) as { visible?: boolean };
  const section = await prisma.siteSection.update({
    where: { key },
    data: {
      visible: Boolean(body.visible),
    },
  });

  return NextResponse.json({ ok: true, section });
}
