import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isValidEmail } from '@/lib/auth';
import {
  getDeliverySummary,
  resolveSupportedCountry,
  resolveSupportedCurrency,
  resolveSupportedLanguage,
} from '@/lib/customer-preferences';
import {
  appendNotificationEntries,
  appendTrackingEntry,
  buildNotificationEntries,
  computeDeliveryDates,
  createTrackingCode,
} from '@/lib/fulfillment';
import { prisma } from '@/lib/prisma';
import type { StoredAttribution } from '@/lib/tracking';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { recordSecurityEvent } from '@/lib/security/audit';

type CheckoutItem = {
  key: string;
  slug: string;
  sku?: string;
  name: string;
  image?: string;
  mode: 'plant' | 'pot';
  sizeLabel?: string;
  unitPrice: number;
  quantity: number;
};

function isValidPhone(value: string) {
  return /^\+?[0-9]{10,15}$/.test(value);
}

function createOrderNumber() {
  return `TP-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

function sanitizeAttributionValue(value: unknown, maxLength = 160) {
  const nextValue = String(value || '').trim();
  return nextValue ? nextValue.slice(0, maxLength) : null;
}

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/checkout',
      limit: 8,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many checkout attempts were made from this connection. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const currentUser = await getCurrentUser();
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddr1,
      shippingAddr2,
      shippingCity,
      shippingCountry,
      shippingNotes,
      paymentMethod,
      displayCurrency,
      preferredLanguage,
      attribution,
      sessionKey,
      items,
    } = body as {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddr1?: string;
      shippingAddr2?: string;
      shippingCity?: string;
      shippingCountry?: string;
      shippingNotes?: string;
      paymentMethod: 'CARD' | 'MPESA';
      displayCurrency?: string;
      preferredLanguage?: string;
      attribution?: Partial<StoredAttribution> | null;
      sessionKey?: string;
      items: CheckoutItem[];
    };

    if (!customerName?.trim()) {
      return jsonError('Customer name is required.', 400);
    }

    if (!isValidEmail(String(customerEmail || '').trim())) {
      return jsonError('A valid customer email is required.', 400);
    }

    if (!isValidPhone(String(customerPhone || '').trim())) {
      return jsonError('A valid customer phone is required.', 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return jsonError('Cart items are required.', 400);
    }

    if (!['CARD', 'MPESA'].includes(paymentMethod)) {
      return jsonError('Invalid payment method.', 400);
    }

    const sanitizedItems = items.map((item) => ({
      key: item.key,
      productSlug: item.slug,
      sku: item.sku || null,
      name: item.name,
      image: item.image || null,
      mode: item.mode,
      sizeLabel: item.sizeLabel || null,
      unitPrice: Number(item.unitPrice || 0),
      quantity: Number(item.quantity || 0),
      lineTotal: Number(item.unitPrice || 0) * Number(item.quantity || 0),
    }));
    const hasInvalidItem = sanitizedItems.some(
      (item) =>
        item.unitPrice <= 0 ||
        item.quantity <= 0 ||
        !item.productSlug ||
        !item.name
    );

    if (hasInvalidItem) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/checkout',
        userId: currentUser?.id,
        ip,
        metadata: {
          reason: 'invalid_cart_item',
        },
      });
      return jsonError('Invalid cart item payload.', 400);
    }

    const subtotal = sanitizedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const resolvedShippingCountry = resolveSupportedCountry(
      shippingCountry || currentUser?.defaultShippingCountry
    );
    const resolvedDisplayCurrency = resolveSupportedCurrency(
      displayCurrency || currentUser?.preferredCurrency
    );
    const resolvedPreferredLanguage = resolveSupportedLanguage(
      preferredLanguage || currentUser?.preferredLanguage
    );
    const deliverySummary = getDeliverySummary({
      subtotalKes: subtotal,
      itemCount: sanitizedItems.length,
      shippingCountry: resolvedShippingCountry,
      shippingCity: shippingCity || currentUser?.defaultShippingCity,
    });
    const deliveryFee = deliverySummary.deliveryFeeKes;
    const totalAmount = deliverySummary.totalKes;
    const isCustomOrder = false;
    const createdAt = new Date();
    const orderNumber = createOrderNumber();
    const trackingCode = createTrackingCode();
    const { estimatedDispatchAt, estimatedDeliveryAt } = computeDeliveryDates(
      createdAt,
      isCustomOrder
    );
    const trackingTimeline = appendTrackingEntry(null, 'PENDING', isCustomOrder, createdAt);
    const notificationLog = appendNotificationEntries(
      null,
      buildNotificationEntries(
        {
          orderNumber,
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          status: 'PENDING',
          isCustomOrder,
        },
        currentUser,
        createdAt
      )
    );
    const sanitizedAttribution = attribution
      ? {
          attributionSource: sanitizeAttributionValue(attribution.source),
          attributionMedium: sanitizeAttributionValue(attribution.medium),
          attributionCampaign: sanitizeAttributionValue(attribution.campaign),
          attributionTerm: sanitizeAttributionValue(attribution.term),
          attributionContent: sanitizeAttributionValue(attribution.content),
          gclid: sanitizeAttributionValue(attribution.gclid),
          fbclid: sanitizeAttributionValue(attribution.fbclid),
          landingPath: sanitizeAttributionValue(attribution.landingPath, 300),
          trackingSessionKey: sanitizeAttributionValue(sessionKey, 120),
        }
      : {
          attributionSource: null,
          attributionMedium: null,
          attributionCampaign: null,
          attributionTerm: null,
          attributionContent: null,
          gclid: null,
          fbclid: null,
          landingPath: null,
          trackingSessionKey: sanitizeAttributionValue(sessionKey, 120),
        };
    const order = await prisma.order.create({
      data: {
        orderNumber,
        trackingCode,
        userId: currentUser?.id || null,
        paymentMethod,
        isCustomOrder,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        shippingAddr1: shippingAddr1?.trim() || null,
        shippingAddr2: shippingAddr2?.trim() || null,
        shippingCity: shippingCity?.trim() || null,
        shippingCountry: resolvedShippingCountry,
        shippingNotes: shippingNotes?.trim() || null,
        subtotal,
        deliveryFee,
        totalAmount,
        displayCurrency: resolvedDisplayCurrency,
        preferredLanguage: resolvedPreferredLanguage,
        estimatedDispatchAt,
        estimatedDeliveryAt,
        trackingTimeline,
        notificationLog,
        ...sanitizedAttribution,
        items: {
          create: sanitizedItems.map((item) => ({
            productSlug: item.productSlug,
            sku: item.sku,
            name: item.name,
            image: item.image,
            mode: item.mode,
            sizeLabel: item.sizeLabel,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const response = NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        status: order.status,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        currency: order.currency,
        displayCurrency: order.displayCurrency,
        preferredLanguage: order.preferredLanguage,
        shippingCountry: order.shippingCountry,
        shippingCity: order.shippingCity,
        deliveryPolicyNote: deliverySummary.policyNote,
        requiresLocationQuote: deliverySummary.requiresLocationQuote,
        createdAt: order.createdAt,
        attribution: {
          source: order.attributionSource,
          medium: order.attributionMedium,
          campaign: order.attributionCampaign,
          landingPath: order.landingPath,
        },
        items: order.items,
      },
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return jsonError(getSafeErrorMessage(error, 'Failed to create order.'), 500);
  }
}
