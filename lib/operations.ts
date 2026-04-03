import { Prisma, type OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  appendTrackingEntry,
  appendUniqueNotificationEntries,
  appendUniqueTrackingEntry,
  buildCustomNotificationEntries,
  buildNotificationEntries,
  readNotificationLog,
  type TrackingEntry,
} from '@/lib/fulfillment';

const AUTO_PROCESS_AFTER_HOURS = 6;
const REVIEW_REQUEST_AFTER_HOURS = 18;

type OperationsSummary = {
  processedAt: string;
  advancedOrders: number;
  advancedOrderNumbers: string[];
  deliveryCheckInsQueued: number;
  deliveryCheckInOrders: string[];
  reviewRequestsQueued: number;
  reviewRequestOrders: string[];
};

function hasNotificationKind(
  value: Prisma.JsonValue | null | undefined,
  kind: string
) {
  return readNotificationLog(value).some((entry) => entry.kind === kind);
}

function hoursAgo(now: Date, hours: number) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

function buildDeliveryWindowEntry(now: Date, isCustomOrder: boolean): TrackingEntry {
  return {
    status: 'DELIVERY_WINDOW',
    kind: 'delivery_check_in',
    label: 'Delivery window reached',
    detail: isCustomOrder
      ? 'The planned 21-day delivery window has been reached. A follow-up update is now queued.'
      : 'The planned 2-day delivery window has been reached. A follow-up update is now queued.',
    createdAt: now.toISOString(),
  };
}

export async function runOperationsAutomation(now = new Date()): Promise<OperationsSummary> {
  const summary: OperationsSummary = {
    processedAt: now.toISOString(),
    advancedOrders: 0,
    advancedOrderNumbers: [],
    deliveryCheckInsQueued: 0,
    deliveryCheckInOrders: [],
    reviewRequestsQueued: 0,
    reviewRequestOrders: [],
  };

  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ['CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as OrderStatus[],
      },
    },
    include: {
      user: true,
      items: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === 'DELIVERED' &&
      order.updatedAt <= hoursAgo(now, REVIEW_REQUEST_AFTER_HOURS)
  );
  const reviewSlugs = Array.from(
    new Set(deliveredOrders.flatMap((order) => order.items.map((item) => item.productSlug)))
  );
  const reviewProducts = reviewSlugs.length
    ? await prisma.product.findMany({
        where: {
          slug: {
            in: reviewSlugs,
          },
        },
        select: {
          id: true,
          slug: true,
        },
      })
    : [];
  const reviewProductIds = reviewProducts.map((product) => product.id);
  const reviewUserIds = Array.from(
    new Set(
      deliveredOrders
        .map((order) => order.userId)
        .filter((value): value is string => Boolean(value))
    )
  );
  const existingReviews =
    reviewUserIds.length && reviewProductIds.length
      ? await prisma.review.findMany({
          where: {
            userId: {
              in: reviewUserIds,
            },
            productId: {
              in: reviewProductIds,
            },
          },
          select: {
            userId: true,
            productId: true,
          },
        })
      : [];
  const productIdBySlug = new Map(reviewProducts.map((product) => [product.slug, product.id]));
  const existingReviewSet = new Set(
    existingReviews.map((review) => `${review.userId}:${review.productId}`)
  );

  for (const order of orders) {
    let nextStatus = order.status;
    let nextTrackingTimeline = order.trackingTimeline;
    let nextNotificationLog = order.notificationLog;
    let shouldSave = false;

    if (
      ['CONFIRMED', 'PAID'].includes(nextStatus) &&
      order.updatedAt <= hoursAgo(now, AUTO_PROCESS_AFTER_HOURS)
    ) {
      nextStatus = 'PROCESSING';
      nextTrackingTimeline = appendTrackingEntry(
        nextTrackingTimeline,
        nextStatus,
        order.isCustomOrder,
        now
      );
      nextNotificationLog = appendUniqueNotificationEntries(
        nextNotificationLog,
        buildNotificationEntries(
          {
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            status: nextStatus,
            isCustomOrder: order.isCustomOrder,
          },
          order.user,
          now
        )
      );
      shouldSave = true;
      summary.advancedOrders += 1;
      summary.advancedOrderNumbers.push(`${order.orderNumber} -> PROCESSING`);
    }

    if (
      nextStatus === 'PROCESSING' &&
      order.estimatedDispatchAt &&
      order.estimatedDispatchAt <= now
    ) {
      nextStatus = 'SHIPPED';
      nextTrackingTimeline = appendTrackingEntry(
        nextTrackingTimeline,
        nextStatus,
        order.isCustomOrder,
        now
      );
      nextNotificationLog = appendUniqueNotificationEntries(
        nextNotificationLog,
        buildNotificationEntries(
          {
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            status: nextStatus,
            isCustomOrder: order.isCustomOrder,
          },
          order.user,
          now
        )
      );
      shouldSave = true;
      summary.advancedOrders += 1;
      summary.advancedOrderNumbers.push(`${order.orderNumber} -> SHIPPED`);
    }

    if (
      nextStatus === 'SHIPPED' &&
      order.estimatedDeliveryAt &&
      order.estimatedDeliveryAt <= now &&
      !hasNotificationKind(nextNotificationLog, 'delivery_check_in')
    ) {
      nextTrackingTimeline = appendUniqueTrackingEntry(
        nextTrackingTimeline,
        buildDeliveryWindowEntry(now, order.isCustomOrder),
        (entry) => entry.kind === 'delivery_check_in'
      );
      nextNotificationLog = appendUniqueNotificationEntries(
        nextNotificationLog,
        buildCustomNotificationEntries(
          {
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            subject: `Delivery window reached · ${order.orderNumber}`,
            detail: order.isCustomOrder
              ? 'Your custom order has reached its planned delivery window. Our team should confirm final handoff progress now.'
              : 'Your order has reached its planned delivery window. We should confirm delivery progress now.',
            kind: 'delivery_check_in',
          },
          order.user,
          now
        )
      );
      shouldSave = true;
      summary.deliveryCheckInsQueued += 1;
      summary.deliveryCheckInOrders.push(order.orderNumber);
    }

    if (
      nextStatus === 'DELIVERED' &&
      order.updatedAt <= hoursAgo(now, REVIEW_REQUEST_AFTER_HOURS) &&
      !hasNotificationKind(nextNotificationLog, 'review_request')
    ) {
      const itemNames = order.items.map((item) => item.name);
      const allReviewed =
        Boolean(order.userId) &&
        order.items.every((item) => {
          const productId = productIdBySlug.get(item.productSlug);
          return productId
            ? existingReviewSet.has(`${order.userId}:${productId}`)
            : false;
        });

      if (!allReviewed) {
        nextNotificationLog = appendUniqueNotificationEntries(
          nextNotificationLog,
          buildCustomNotificationEntries(
            {
              customerEmail: order.customerEmail,
              customerPhone: order.customerPhone,
              subject: `Share your TuloPots experience · ${order.orderNumber}`,
              detail: `Follow up for feedback on ${itemNames.join(', ')} and invite a review once the pieces have settled into the space.`,
              kind: 'review_request',
            },
            order.user,
            now
          )
        );
        shouldSave = true;
        summary.reviewRequestsQueued += 1;
        summary.reviewRequestOrders.push(order.orderNumber);
      }
    }

    if (!shouldSave) {
      continue;
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: nextStatus,
        trackingTimeline: (Array.isArray(nextTrackingTimeline)
          ? nextTrackingTimeline
          : []) as Prisma.InputJsonValue,
        notificationLog: (Array.isArray(nextNotificationLog)
          ? nextNotificationLog
          : []) as Prisma.InputJsonValue,
      },
    });
  }

  return summary;
}
