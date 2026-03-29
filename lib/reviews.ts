import { prisma } from '@/lib/prisma';

export async function syncProductReviewStats(productId: string) {
  const approvedReviews = await prisma.review.findMany({
    where: {
      productId,
      approved: true,
    },
    select: {
      rating: true,
    },
  });

  const reviewCount = approvedReviews.length;
  const rating =
    reviewCount > 0
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) /
        reviewCount
      : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      reviewCount,
      rating,
    },
  });

  return {
    reviewCount,
    rating,
  };
}
