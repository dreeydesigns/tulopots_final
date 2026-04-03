import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';

export type TrackingEntry = {
  status: string;
  label: string;
  detail: string;
  createdAt: string;
  kind?: string;
};

export type NotificationEntry = {
  channel: 'email' | 'sms' | 'whatsapp';
  subject: string;
  detail: string;
  status: 'queued';
  createdAt: string;
  target?: string | null;
  kind?: string;
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

function resolveNotificationChannels(
  order: {
    customerEmail: string;
    customerPhone: string;
  },
  user?: NotificationUser | null
) {
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

  return Array.from(channels);
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
    kind: 'order_status',
    ...buildTrackingCopy(status, isCustomOrder),
  } satisfies TrackingEntry;

  return [...readTrackingTimeline(current), nextEntry];
}

export function appendUniqueTrackingEntry(
  current: Prisma.JsonValue | null | undefined,
  entry: TrackingEntry,
  matcher?: (existing: TrackingEntry) => boolean
) {
  const existing = readTrackingTimeline(current);
  const exists = matcher
    ? existing.some(matcher)
    : existing.some(
        (item) =>
          item.status === entry.status &&
          item.label === entry.label &&
          item.kind === entry.kind
      );

  return exists ? existing : [...existing, entry];
}

export function buildCustomNotificationEntries(
  input: {
    customerEmail: string;
    customerPhone: string;
    subject: string;
    detail: string;
    kind?: string;
  },
  user?: NotificationUser | null,
  createdAt = new Date()
) {
  const channels = resolveNotificationChannels(
    {
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
    },
    user
  );

  return channels.map((channel) => ({
    channel,
    subject: input.subject,
    detail: input.detail,
    kind: input.kind || 'custom',
    status: 'queued' as const,
    createdAt: createdAt.toISOString(),
    target:
      channel === 'email'
        ? input.customerEmail
        : input.customerPhone || user?.phone || null,
  }));
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

  return buildCustomNotificationEntries(
    {
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      subject: `${copy.label} · ${order.orderNumber}`,
      detail: copy.detail,
      kind: 'order_status',
    },
    user,
    createdAt
  );
}

export function appendNotificationEntries(
  current: Prisma.JsonValue | null | undefined,
  entries: NotificationEntry[]
) {
  return [...readNotificationLog(current), ...entries];
}

function notificationSignature(entry: NotificationEntry) {
  return [
    entry.kind || 'legacy',
    entry.channel,
    entry.subject,
    entry.target || '',
  ].join('::');
}

export function appendUniqueNotificationEntries(
  current: Prisma.JsonValue | null | undefined,
  entries: NotificationEntry[]
) {
  const existing = readNotificationLog(current);
  const seen = new Set(existing.map(notificationSignature));
  const next = [...existing];

  for (const entry of entries) {
    const signature = notificationSignature(entry);

    if (seen.has(signature)) {
      continue;
    }

    seen.add(signature);
    next.push(entry);
  }

  return next;
}
