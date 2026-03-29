import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function normalizeRating(value: unknown) {
  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return null;
  }

  return Math.min(5, Math.max(1, Math.round(rating)));
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'Product slug is required.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        rating: true,
        reviewCount: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        approved: true,
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 12,
      select: {
        id: true,
        name: true,
        rating: true,
        body: true,
        featured: true,
        createdAt: true,
      },
    });
    const reviewCount = reviews.length;
    const rating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    return NextResponse.json({
      ok: true,
      summary: {
        rating,
        reviewCount,
      },
      reviews: reviews.map((review) => ({
        id: review.id,
        name: review.name,
        rating: review.rating,
        body: review.body,
        featured: review.featured,
        createdAt: review.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unable to load reviews.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, error: 'Sign in to leave a review.' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      slug?: string;
      rating?: number;
      review?: string;
    };
    const slug = String(body.slug || '').trim();
    const reviewBody = String(body.review || '').trim();
    const rating = normalizeRating(body.rating);

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'Product slug is required.' },
        { status: 400 }
      );
    }

    if (!rating) {
      return NextResponse.json(
        { ok: false, error: 'Choose a rating between 1 and 5.' },
        { status: 400 }
      );
    }

    if (reviewBody.length < 24) {
      return NextResponse.json(
        { ok: false, error: 'Write a little more so the review is useful.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You have already shared a review for this piece.',
        },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: currentUser.id,
        name: currentUser.name || currentUser.email,
        rating,
        body: reviewBody,
        approved: false,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Your review has been received and is waiting for approval.',
      review: {
        id: review.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unable to submit your review.' },
      { status: 500 }
    );
  }
}
