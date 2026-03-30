import { NextRequest, NextResponse } from 'next/server';
import { adminOrderStatuses, requireAdminUser } from '@/lib/admin';
import { appendNotificationEntries, appendTrackingEntry, buildNotificationEntries, computeDeliveryDates } from '@/lib/fulfillment';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; adminNotes?: string; isCustomOrder?: boolean };
  const status = String(body.status || '').toUpperCase();

  if (status && !adminOrderStatuses.includes(status as (typeof adminOrderStatuses)[number])) {
    return NextResponse.json({ ok: false, error: 'Invalid order status.' }, { status: 400 });
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id },
    include: { user: true },
  });

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

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: nextStatus,
      isCustomOrder: nextIsCustomOrder,
      estimatedDispatchAt,
      estimatedDeliveryAt,
      ...(status
        ? {
            trackingTimeline: appendTrackingEntry(
              existingOrder.trackingTimeline,
              nextStatus,
              nextIsCustomOrder
            ),
            notificationLog: appendNotificationEntries(
              existingOrder.notificationLog,
              buildNotificationEntries(
                {
                  orderNumber: existingOrder.orderNumber,
                  customerEmail: existingOrder.customerEmail,
                  customerPhone: existingOrder.customerPhone,
                  status: nextStatus,
                  isCustomOrder: nextIsCustomOrder,
                },
                existingOrder.user
              )
            ),
          }
        : {}),
      ...(body.adminNotes !== undefined ? { adminNotes: body.adminNotes || null } : {}),
    },
  });

  return NextResponse.json({ ok: true, order });
}
