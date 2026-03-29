import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { syncProductReviewStats } from '@/lib/reviews';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      approved?: boolean;
      featured?: boolean;
    };

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(typeof body.approved === 'boolean' ? { approved: body.approved } : {}),
        ...(typeof body.featured === 'boolean' ? { featured: body.featured } : {}),
      },
      select: {
        id: true,
        productId: true,
        approved: true,
        featured: true,
      },
    });

    const summary = await syncProductReviewStats(review.productId);

    return NextResponse.json({
      ok: true,
      review,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unable to update review.' },
      { status: 500 }
    );
  }
}
