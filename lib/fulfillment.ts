import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';

export type TrackingEntry = {
  status: string;
  label: string;
  detail: string;
  createdAt: string;
};

export type NotificationEntry = {
  channel: 'email' | 'sms' | 'whatsapp';
  subject: string;
  detail: string;
  status: 'queued';
  createdAt: string;
  target?: string | null;
};

type NotificationUser = {
  email?: string | null;
  phone?: string | null;
  emailNotifications?: boolean | null;
  smsNotifications?: boolean | null;
  whatsappNotifications?: boolean | null;
};

function asArray<T>(value: Prisma.JsonValue | null | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as T[];
}

export function readTrackingTimeline(value: Prisma.JsonValue | null | undefined) {
  return asArray<TrackingEntry>(value);
}

export function readNotificationLog(value: Prisma.JsonValue | null | undefined) {
  return asArray<NotificationEntry>(value);
}

export function computeDeliveryDates(createdAt: Date, isCustomOrder = false) {
  const base = new Date(createdAt);
  const dispatchDays = isCustomOrder ? 14 : 1;
  const deliveryDays = isCustomOrder ? 21 : 2;

  const estimatedDispatchAt = new Date(base);
  estimatedDispatchAt.setDate(estimatedDispatchAt.getDate() + dispatchDays);

  const estimatedDeliveryAt = new Date(base);
  estimatedDeliveryAt.setDate(estimatedDeliveryAt.getDate() + deliveryDays);

  return {
    estimatedDispatchAt,
    estimatedDeliveryAt,
  };
}

export function createTrackingCode() {
  return `TRK-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

function buildTrackingCopy(status: string, isCustomOrder: boolean) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Order received',
        detail: 'We have your order and we are waiting for payment confirmation.',
      };
    case 'PAID':
      return {
        label: 'Payment confirmed',
        detail: isCustomOrder
          ? 'Payment is confirmed. Custom work is now moving into the studio production schedule.'
          : 'Payment is confirmed. Your order is now being prepared for dispatch.',
      };
    case 'PROCESSING':
      return {
        label: 'Preparing your order',
        detail: isCustomOrder
          ? 'Your custom order is in production. Studio work can take up to 21 days.'
          : 'Your order is being packed and prepared for dispatch.',
      };
    case 'SHIPPED':
      return {
        label: 'Out for delivery',
        detail: isCustomOrder
          ? 'Your custom order has left the studio and is now moving toward delivery.'
          : 'Your order is on the way. Standard delivery takes about 2 days after purchase.',
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        detail: 'Your order has been marked as delivered.',
      };
    case 'FAILED':
      return {
        label: 'Payment failed',
        detail: 'We could not confirm the payment for this order.',
      };
    case 'CANCELLED':
      return {
        label: 'Order cancelled',
        detail: 'This order has been cancelled and will not move into fulfillment.',
      };
    default:
      return {
        label: 'Order updated',
        detail: 'The status of this order has been updated.',
      };
  }
}

export function appendTrackingEntry(
  current: Prisma.JsonValue | null | undefined,
  status: string,
  isCustomOrder: boolean,
  createdAt = new Date()
) {
  const nextEntry = {
    status,
    createdAt: createdAt.toISOString(),
    ...buildTrackingCopy(status, isCustomOrder),
  } satisfies TrackingEntry;

  return [...readTrackingTimeline(current), nextEntry];
}

export function buildNotificationEntries(
  order: {
    orderNumber: string;
    customerEmail: string;
    customerPhone: string;
    status: string;
    isCustomOrder: boolean;
  },
  user?: NotificationUser | null,
  createdAt = new Date()
) {
  const copy = buildTrackingCopy(order.status, order.isCustomOrder);
  const channels = new Set<NotificationEntry['channel']>();

  if (user?.emailNotifications !== false && order.customerEmail) {
    channels.add('email');
  }

  if (user?.smsNotifications && order.customerPhone) {
    channels.add('sms');
  }

  if (user?.whatsappNotifications && order.customerPhone) {
    channels.add('whatsapp');
  }

  if (!channels.size && order.customerEmail) {
    channels.add('email');
  }

  return Array.from(channels).map((channel) => ({
    channel,
    subject: `${copy.label} · ${order.orderNumber}`,
    detail: copy.detail,
    status: 'queued' as const,
    createdAt: createdAt.toISOString(),
    target:
      channel === 'email'
        ? order.customerEmail
        : order.customerPhone || user?.phone || null,
  }));
}

export function appendNotificationEntries(
  current: Prisma.JsonValue | null | undefined,
  entries: NotificationEntry[]
) {
  return [...readNotificationLog(current), ...entries];
}
