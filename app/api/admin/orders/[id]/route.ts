import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { isSchemaCompatibilityError } from '@/lib/auth';
import { adminOrderStatuses, requireAdminUser } from '@/lib/admin';
import { appendNotificationEntries, appendTrackingEntry, buildNotificationEntries, computeDeliveryDates } from '@/lib/fulfillment';
import { prisma } from '@/lib/prisma';
import { queueAutomationJob } from '@/lib/automation';
import { processAutomationJob } from '@/lib/operations';
import { recordAdminAudit } from '@/lib/security/audit';

const existingOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  isCustomOrder: true,
  createdAt: true,
  customerEmail: true,
  customerPhone: true,
  trackingTimeline: true,
  notificationLog: true,
  adminNotes: true,
} satisfies Prisma.OrderSelect;

const compatibilityExistingOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  isCustomOrder: true,
  createdAt: true,
  customerEmail: true,
  customerPhone: true,
  trackingTimeline: true,
  notificationLog: true,
} satisfies Prisma.OrderSelect;

const minimalExistingOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  isCustomOrder: true,
  createdAt: true,
  customerEmail: true,
  customerPhone: true,
} satisfies Prisma.OrderSelect;

const orderUpdateSelect = {
  id: true,
  status: true,
} satisfies Prisma.OrderSelect;

async function findExistingOrder(id: string) {
  try {
    return await prisma.order.findUnique({
      where: { id },
      select: existingOrderSelect,
    });
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) {
      throw error;
    }

    try {
      return await prisma.order.findUnique({
        where: { id },
        select: compatibilityExistingOrderSelect,
      });
    } catch (compatibilityError) {
      if (!isSchemaCompatibilityError(compatibilityError)) {
        throw compatibilityError;
      }

      return prisma.order.findUnique({
        where: { id },
        select: minimalExistingOrderSelect,
      });
    }
  }
}

async function updateOrderWithFallback(
  id: string,
  updates: Prisma.OrderUpdateInput[]
) {
  let lastCompatibilityError: unknown;

  for (const data of updates) {
    try {
      return await prisma.order.update({
        where: { id },
        data,
        select: orderUpdateSelect,
      });
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) {
        throw error;
      }

      lastCompatibilityError = error;
    }
  }

  throw lastCompatibilityError;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser('orders.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; adminNotes?: string; isCustomOrder?: boolean };
  const status = String(body.status || '').toUpperCase();

  if (status && !adminOrderStatuses.includes(status as (typeof adminOrderStatuses)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid order status.' }, { status: 400 });
  }

  const existingOrder = await findExistingOrder(id);

  if (!existingOrder) {
    return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
  }

  const nextIsCustomOrder =
    body.isCustomOrder == null ? existingOrder.isCustomOrder : Boolean(body.isCustomOrder);
  const nextStatus = status
    ? (status as (typeof adminOrderStatuses)[number])
    : existingOrder.status;
  const { estimatedDispatchAt, estimatedDeliveryAt } = computeDeliveryDates(
    existingOrder.createdAt,
    nextIsCustomOrder
  );
  const trackingTimeline =
    'trackingTimeline' in existingOrder
      ? (existingOrder.trackingTimeline as Prisma.JsonValue | undefined)
      : undefined;
  const notificationLog =
    'notificationLog' in existingOrder
      ? (existingOrder.notificationLog as Prisma.JsonValue | undefined)
      : undefined;
  const previousAdminNotes =
    'adminNotes' in existingOrder && typeof existingOrder.adminNotes === 'string'
      ? existingOrder.adminNotes
      : null;

  const timelineUpdate = status
    ? {
        trackingTimeline: appendTrackingEntry(
          trackingTimeline,
          nextStatus,
          nextIsCustomOrder
        ),
        notificationLog: appendNotificationEntries(
          notificationLog,
          buildNotificationEntries({
            orderNumber: existingOrder.orderNumber,
            customerEmail: existingOrder.customerEmail,
            customerPhone: existingOrder.customerPhone || '',
            status: nextStatus,
            isCustomOrder: nextIsCustomOrder,
          })
        ),
      }
    : {};

  const notesUpdate =
    body.adminNotes !== undefined ? { adminNotes: body.adminNotes || null } : {};

  const order = await updateOrderWithFallback(
    id,
    [
      {
        status: nextStatus,
        isCustomOrder: nextIsCustomOrder,
        estimatedDispatchAt,
        estimatedDeliveryAt,
        ...timelineUpdate,
        ...notesUpdate,
        deliveredAt: nextStatus === 'DELIVERED' ? new Date() : null,
      },
      {
        status: nextStatus,
        isCustomOrder: nextIsCustomOrder,
        estimatedDispatchAt,
        estimatedDeliveryAt,
        ...timelineUpdate,
        ...notesUpdate,
      },
      {
        status: nextStatus,
        isCustomOrder: nextIsCustomOrder,
        ...timelineUpdate,
        ...notesUpdate,
      },
      {
        status: nextStatus,
        isCustomOrder: nextIsCustomOrder,
        ...notesUpdate,
      },
      {
        status: nextStatus,
        isCustomOrder: nextIsCustomOrder,
      },
    ]
  );

  await recordAdminAudit({
    actorUserId: adminUser.id,
    action: 'order.update',
    targetType: 'order',
    targetId: existingOrder.id,
    summary: `Updated ${existingOrder.orderNumber} to ${nextStatus}.`,
    diffJson: {
      previousStatus: existingOrder.status,
      nextStatus,
      previousAdminNotes,
      nextAdminNotes: body.adminNotes,
    },
  }).catch(() => undefined);

  if (nextStatus === 'DELIVERED' && existingOrder.status !== 'DELIVERED') {
    const job = await queueAutomationJob({
      type: 'DELIVERY_SUCCESS_CONFIRMATION',
      dedupeKey: `delivery-success:${existingOrder.id}`,
      payloadJson: {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
      },
    }).catch(() => undefined);

    if (job?.id) {
      await processAutomationJob(job.id).catch(() => undefined);
    }
  }

  return NextResponse.json({ ok: true, order });
}
