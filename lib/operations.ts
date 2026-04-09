import { Prisma, type NotificationChannel, type OrderStatus } from '@prisma/client';
import { isSchemaCompatibilityError } from '@/lib/auth';
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
import {
  completeAutomationJob,
  failAutomationJob,
  getDueAutomationJobs,
  markAutomationJobProcessing,
  queueAutomationJob,
} from '@/lib/automation';
import { dispatchCustomerFollowUps, dispatchNotification } from '@/lib/notifications';

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
  queuedJobs: number;
  processedJobs: number;
  failedJobs: number;
};

const operationsOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  userId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  isCustomOrder: true,
  estimatedDispatchAt: true,
  estimatedDeliveryAt: true,
  trackingTimeline: true,
  notificationLog: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      name: true,
      productSlug: true,
    },
  },
} satisfies Prisma.OrderSelect;

const legacyOperationsOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  userId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
  isCustomOrder: true,
  trackingTimeline: true,
  notificationLog: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      name: true,
      productSlug: true,
    },
  },
} satisfies Prisma.OrderSelect;

const orderNotificationSelect = {
  id: true,
  orderNumber: true,
  status: true,
  userId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingCity: true,
} satisfies Prisma.OrderSelect;

async function findOrderForOperations(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: orderNotificationSelect,
  });
}

async function findOrdersForAutomation() {
  try {
    return await prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'FAILED'],
        },
      },
      select: operationsOrderSelect,
      orderBy: {
        createdAt: 'asc',
      },
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    return prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'FAILED'],
        },
      },
      select: legacyOperationsOrderSelect,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

async function safeSupportThreadCount() {
  try {
    return await prisma.supportThread.count({
      where: {
        status: {
          in: ['OPEN', 'PENDING'],
        },
      },
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    return 0;
  }
}

function hasNotificationKind(value: Prisma.JsonValue | null | undefined, kind: string) {
  return readNotificationLog(value).some((entry) => entry.kind === kind);
}

function hoursAgo(now: Date, hours: number) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

function asPayloadRecord(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, any>;
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
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

async function getRecipientsByRole(roles: string[]) {
  const recipients = await prisma.user.findMany({
    where: {
      role: {
        in: roles as any,
      },
      email: {
        not: null,
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  return recipients.filter((recipient) => Boolean(recipient.email));
}

async function sendBulkNotifications(input: {
  jobId?: string | null;
  recipients: Array<{ id: string; email: string | null }>;
  templateKey: string;
  title: string;
  body: string;
  meta?: Prisma.InputJsonObject;
  channel?: NotificationChannel;
}) {
  return Promise.all(
    input.recipients
      .filter((recipient) => Boolean(recipient.email))
      .map((recipient) =>
        dispatchNotification({
          jobId: input.jobId || null,
          userId: recipient.id,
          templateKey: input.templateKey,
          channel: input.channel || 'EMAIL',
          destination: recipient.email!,
          payload: {
            title: input.title,
            body: input.body,
            meta: input.meta,
          },
        })
      )
  );
}

async function dispatchQueuedFollowUp(
  jobId: string,
  channel: NotificationChannel,
  destination: string | null,
  payload: Record<string, any>,
  templateKey: string
) {
  if (!destination) {
    return;
  }

  await dispatchNotification({
    jobId,
    templateKey,
    channel,
    destination,
    payload: {
      title: String(payload.title || 'TuloPots update'),
      body: String(payload.body || payload.summary || 'A new update is ready.'),
      meta: payload.meta,
    },
  });
}

export async function processAutomationJob(jobId: string) {
  const job = await prisma.automationJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return false;
  }

  await markAutomationJobProcessing(job.id, 'operations-runner');

  try {
    const payload = asPayloadRecord(job.payloadJson);

    switch (job.type) {
      case 'ORDER_ADVANCE': {
        const orderId = asString(payload.orderId);
        if (!orderId) {
          break;
        }

        const order = await findOrderForOperations(orderId);

        if (!order) {
          break;
        }

        await dispatchCustomerFollowUps({
          jobId: job.id,
          userId: order.userId,
          email: order.customerEmail,
          phone: order.customerPhone,
          title: `Order update for ${order.orderNumber}`,
          body: `Your order is now marked as ${String(payload.status || order.status).toLowerCase()}.`,
          includeWhatsApp: false,
          includeSmsFallback: false,
        });
        break;
      }

      case 'DELIVERY_CHECKIN': {
        const orderId = asString(payload.orderId);
        if (!orderId) {
          break;
        }

        const order = await findOrderForOperations(orderId);

        if (!order) {
          break;
        }

        await dispatchCustomerFollowUps({
          jobId: job.id,
          userId: order.userId,
          email: order.customerEmail,
          phone: order.customerPhone,
          title: `Delivery check-in for ${order.orderNumber}`,
          body: 'Your order has reached its delivery window. We are confirming the final handoff now.',
          includeWhatsApp: true,
          includeSmsFallback: true,
        });

        const recipients = await getRecipientsByRole([
          'SUPER_ADMIN',
          'OPERATIONS_ADMIN',
          'DELIVERY_ADMIN',
        ]);

        await sendBulkNotifications({
          jobId: job.id,
          recipients,
          templateKey: 'delivery-checkin-admin',
          title: `Delivery check-in needed: ${order.orderNumber}`,
          body: `${order.customerName}'s order is due for a delivery confirmation in ${order.shippingCity || 'the requested location'}.`,
        });
        break;
      }

      case 'REVIEW_REQUEST': {
        const orderId = asString(payload.orderId);
        if (!orderId) {
          break;
        }

        const order = await findOrderForOperations(orderId);

        if (!order) {
          break;
        }

        await dispatchCustomerFollowUps({
          jobId: job.id,
          userId: order.userId,
          email: order.customerEmail,
          phone: order.customerPhone,
          title: `How is ${order.orderNumber} settling in?`,
          body: 'Your delivery has arrived. When you are ready, we would love to hear how the piece feels in your space.',
          includeWhatsApp: true,
          includeSmsFallback: false,
        });
        break;
      }

      case 'DELIVERY_SUCCESS_CONFIRMATION': {
        const orderId = asString(payload.orderId);
        if (!orderId) {
          break;
        }

        const order = await findOrderForOperations(orderId);

        if (!order) {
          break;
        }

        await dispatchCustomerFollowUps({
          jobId: job.id,
          userId: order.userId,
          email: order.customerEmail,
          phone: order.customerPhone,
          title: `Delivery completed for ${order.orderNumber}`,
          body: 'Your order has been marked as delivered successfully. If anything needs attention, reply to this update and we will help quickly.',
          includeWhatsApp: true,
          includeSmsFallback: true,
        });

        const recipients = await getRecipientsByRole([
          'SUPER_ADMIN',
          'OPERATIONS_ADMIN',
          'DELIVERY_ADMIN',
        ]);

        await sendBulkNotifications({
          jobId: job.id,
          recipients,
          templateKey: 'delivery-success-admin',
          title: `Delivery successful: ${order.orderNumber}`,
          body: `${order.customerName}'s order has been marked as delivered to ${order.shippingCity || 'the requested destination'}.`,
        });
        break;
      }

      case 'LOW_STOCK_ALERT': {
        const recipients = await getRecipientsByRole([
          'SUPER_ADMIN',
          'OPERATIONS_ADMIN',
          'CONTENT_ADMIN',
        ]);

        await sendBulkNotifications({
          jobId: job.id,
          recipients,
          templateKey: 'ops-low-stock',
          title: 'Product availability needs review',
          body: String(payload.summary || 'A product is at low availability and needs review.'),
        });
        break;
      }

      case 'FAILED_PAYMENT_FOLLOWUP': {
        await dispatchQueuedFollowUp(
          job.id,
          'EMAIL',
          asString(payload.email),
          {
            title: `Payment follow-up for ${String(payload.orderNumber || 'your order')}`,
            body: 'Your payment could not be confirmed. You can return to checkout and try again.',
          },
          'payment-failed-followup'
        );
        break;
      }

      case 'SUPPORT_ESCALATION_NOTIFY': {
        const recipients = await getRecipientsByRole([
          'SUPER_ADMIN',
          'SUPPORT_ADMIN',
          'OPERATIONS_ADMIN',
          'DELIVERY_ADMIN',
        ]);

        await sendBulkNotifications({
          jobId: job.id,
          recipients,
          templateKey: 'support-escalation',
          title: 'Support escalation needs attention',
          body: String(payload.summary || 'A customer conversation has been escalated for human follow-up.'),
        });
        break;
      }

      case 'SUPPORT_DIGEST': {
        const openThreads = await safeSupportThreadCount();

        const pendingDeliveries = await prisma.order.count({
          where: {
            status: {
              in: ['PAID', 'PROCESSING', 'SHIPPED'],
            },
          },
        });

        const recipients = await getRecipientsByRole([
          'SUPER_ADMIN',
          'SUPPORT_ADMIN',
          'OPERATIONS_ADMIN',
          'DELIVERY_ADMIN',
        ]);

        await sendBulkNotifications({
          jobId: job.id,
          recipients,
          templateKey: 'support-digest',
          title: 'Hourly support digest',
          body: `There are ${openThreads} open support threads and ${pendingDeliveries} active deliveries to review.`,
        });
        break;
      }

      case 'EMAIL_FOLLOWUP': {
        await dispatchQueuedFollowUp(
          job.id,
          'EMAIL',
          asString(payload.email),
          payload,
          'queued-email-followup'
        );
        break;
      }

      case 'WHATSAPP_FOLLOWUP': {
        await dispatchQueuedFollowUp(
          job.id,
          'WHATSAPP',
          asString(payload.phone),
          payload,
          'queued-whatsapp-followup'
        );
        break;
      }

      case 'SMS_FALLBACK': {
        await dispatchQueuedFollowUp(
          job.id,
          'SMS',
          asString(payload.phone),
          payload,
          'queued-sms-fallback'
        );
        break;
      }

      case 'VOICE_CALLBACK_REQUEST': {
        await dispatchQueuedFollowUp(
          job.id,
          'VOICE',
          asString(payload.phone),
          payload,
          'queued-voice-callback'
        );
        break;
      }

      case 'ABANDONED_CART_RECOVERY': {
        await dispatchQueuedFollowUp(
          job.id,
          'EMAIL',
          asString(payload.email),
          {
            title: String(payload.title || 'Your TuloPots picks are still waiting'),
            body: String(
              payload.body ||
                'Your selected TuloPots pieces are still waiting in your cart if you want to continue.'
            ),
          },
          'abandoned-cart-recovery'
        );
        break;
      }
    }

    await completeAutomationJob(job.id);
    return true;
  } catch (error) {
    await failAutomationJob(
      job.id,
      error instanceof Error ? error.message : 'Unable to process automation job.'
    );
    return false;
  }
}

export async function runOperationsAutomation(): Promise<OperationsSummary> {
  const now = new Date();
  const summary: OperationsSummary = {
    processedAt: now.toISOString(),
    advancedOrders: 0,
    advancedOrderNumbers: [],
    deliveryCheckInsQueued: 0,
    deliveryCheckInOrders: [],
    reviewRequestsQueued: 0,
    reviewRequestOrders: [],
    queuedJobs: 0,
    processedJobs: 0,
    failedJobs: 0,
  };

  const [orders, reviews, products] = await Promise.all([
    findOrdersForAutomation(),
    prisma.review.findMany({
      where: {
        userId: {
          not: null,
        },
      },
      select: {
        userId: true,
        productId: true,
      },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        available: true,
        visible: true,
      },
    }),
  ]);

  const existingReviewSet = new Set(
    reviews
      .filter((review) => Boolean(review.userId))
      .map((review) => `${review.userId}:${review.productId}`)
  );
  const productIdBySlug = new Map(products.map((product) => [product.slug, product.id]));

  for (const order of orders) {
    let nextStatus: OrderStatus = order.status;
    let nextTrackingTimeline = order.trackingTimeline;
    let nextNotificationLog = order.notificationLog;
    let shouldSave = false;
    const estimatedDispatchAt =
      'estimatedDispatchAt' in order ? order.estimatedDispatchAt ?? null : null;
    const estimatedDeliveryAt =
      'estimatedDeliveryAt' in order ? order.estimatedDeliveryAt ?? null : null;

    if (
      ['CONFIRMED', 'PAID'].includes(order.status) &&
      order.createdAt <= hoursAgo(now, AUTO_PROCESS_AFTER_HOURS)
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
          undefined,
          now
        )
      );
      shouldSave = true;
      summary.advancedOrders += 1;
      summary.advancedOrderNumbers.push(`${order.orderNumber} -> PROCESSING`);
      await queueAutomationJob({
        type: 'ORDER_ADVANCE',
        dedupeKey: `order-advance:${order.id}:PROCESSING`,
        payloadJson: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'PROCESSING',
        },
      });
      summary.queuedJobs += 1;
    }

    if (
      nextStatus === 'PROCESSING' &&
      estimatedDispatchAt &&
      estimatedDispatchAt <= now
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
          undefined,
          now
        )
      );
      shouldSave = true;
      summary.advancedOrders += 1;
      summary.advancedOrderNumbers.push(`${order.orderNumber} -> SHIPPED`);
      await queueAutomationJob({
        type: 'ORDER_ADVANCE',
        dedupeKey: `order-advance:${order.id}:SHIPPED`,
        payloadJson: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'SHIPPED',
        },
      });
      summary.queuedJobs += 1;
    }

    if (
      nextStatus === 'SHIPPED' &&
      estimatedDeliveryAt &&
      estimatedDeliveryAt <= now &&
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
          undefined,
          now
        )
      );
      shouldSave = true;
      summary.deliveryCheckInsQueued += 1;
      summary.deliveryCheckInOrders.push(order.orderNumber);
      await queueAutomationJob({
        type: 'DELIVERY_CHECKIN',
        dedupeKey: `delivery-check:${order.id}`,
        payloadJson: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });
      summary.queuedJobs += 1;
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
          return productId ? existingReviewSet.has(`${order.userId}:${productId}`) : false;
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
            undefined,
            now
          )
        );
        shouldSave = true;
        summary.reviewRequestsQueued += 1;
        summary.reviewRequestOrders.push(order.orderNumber);
        await queueAutomationJob({
          type: 'REVIEW_REQUEST',
          dedupeKey: `review-request:${order.id}`,
          payloadJson: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });
        summary.queuedJobs += 1;
      }
    }

    if (order.status === 'FAILED') {
      await queueAutomationJob({
        type: 'FAILED_PAYMENT_FOLLOWUP',
        dedupeKey: `failed-payment:${order.id}`,
        payloadJson: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          email: order.customerEmail,
        },
      });
      summary.queuedJobs += 1;
    }

    if (!shouldSave) {
      continue;
    }

    await prisma.order.update({
      where: { id: order.id },
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

  const limitedProducts = products.filter((product) => !product.available || !product.visible);
  if (limitedProducts.length) {
    await queueAutomationJob({
      type: 'LOW_STOCK_ALERT',
      dedupeKey: `low-stock:${now.toISOString().slice(0, 13)}`,
      payloadJson: {
        summary: `Review ${limitedProducts.length} products with limited availability.`,
        productIds: limitedProducts.map((product) => product.id),
      },
    });
    summary.queuedJobs += 1;
  }

  await queueAutomationJob({
    type: 'SUPPORT_DIGEST',
    dedupeKey: `support-digest:${now.toISOString().slice(0, 13)}`,
    payloadJson: {
      generatedAt: now.toISOString(),
    },
  }).catch(() => undefined);

  const dueJobs = await getDueAutomationJobs(50);
  for (const job of dueJobs) {
    const ok = await processAutomationJob(job.id);
    if (ok) {
      summary.processedJobs += 1;
    } else {
      summary.failedJobs += 1;
    }
  }

  return summary;
}
