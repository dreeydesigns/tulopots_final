import type { ContactMessageStatus, OrderStatus, StudioBriefStatus } from '@prisma/client';
import type { AdminTabId, PermissionKey } from '@/lib/access';
import { canAccessAdminTab, getAllowedAdminTabs, hasPermission } from '@/lib/access';
import { syncCatalogToDatabase } from '@/lib/catalog';
import { listManagedPages, syncManagedPageContentToDatabase } from '@/lib/cms';
import { getHubSpotConfig } from '@/lib/hubspot';
import { getCurrentUser } from '@/lib/auth';
import { generateProductSku, slugifyProduct } from '@/lib/product-identity';
import { normalizeAvailableSizes, normalizeModeContent } from '@/lib/product-variants';
import { prisma } from '@/lib/prisma';

export const adminOrderStatuses: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'FAILED',
  'CANCELLED',
];

export const adminStudioStatuses: StudioBriefStatus[] = [
  'RECEIVED',
  'REVIEWING',
  'RESPONDED',
  'CLOSED',
];

export const adminContactStatuses: ContactMessageStatus[] = [
  'NEW',
  'READ',
  'HANDLED',
];

export async function requireAdminUser(permission?: PermissionKey) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return null;
  }

  if (permission && !hasPermission(user.role, permission)) {
    return null;
  }

  return user;
}

export async function requireAdminTab(tab: AdminTabId) {
  const user = await getCurrentUser();

  if (!user?.isAdmin) {
    return null;
  }

  if (!canAccessAdminTab(user.role, tab)) {
    return null;
  }

  return user;
}

export function slugify(value: string) {
  return slugifyProduct(value);
}

export function generateSku(input: {
  category: string;
  size: string;
  name: string;
}) {
  return generateProductSku(input);
}

export async function ensureUniqueProductSlug(baseValue: string, excludeId?: string) {
  const normalizedBase = slugify(baseValue) || 'product';
  let candidate = normalizedBase;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: excludeId
        ? {
            slug: candidate,
            NOT: { id: excludeId },
          }
        : {
            slug: candidate,
          },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

export async function ensureUniqueProductSku(baseValue: string | null | undefined, excludeId?: string) {
  const normalizedBase = String(baseValue || '').trim();

  if (!normalizedBase) {
    return null;
  }

  let candidate = normalizedBase;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: excludeId
        ? {
            sku: candidate,
            NOT: { id: excludeId },
          }
        : {
            sku: candidate,
          },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${String(suffix).padStart(2, '0')}`;
    suffix += 1;
  }
}

export async function getAdminDashboardData(viewer?: { role: any; permissions: string[] }) {
  const hubspotConfig = getHubSpotConfig();
  const initialProductCount = await prisma.product.count();
  const initialSectionCount = await prisma.siteSection.count();

  if (initialProductCount === 0 || initialSectionCount === 0) {
    await syncCatalogToDatabase();
  }

  await syncManagedPageContentToDatabase();

  const [
    productCount,
    orderCount,
    studioCount,
    contactCount,
    newsletterCount,
    reviewCount,
    pendingReviewCount,
    analyticsEventCount,
    products,
    orders,
    studioBriefs,
    contactMessages,
    newsletterSubscribers,
    siteSections,
    managedPages,
    reviews,
    analyticsEvents,
    supportThreads,
    automationJobs,
    securityEvents,
    adminUsers,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.studioBrief.count(),
    prisma.contactMessage.count(),
    prisma.newsletterSubscriber.count(),
    prisma.review.count(),
    prisma.review.count({
      where: {
        approved: false,
      },
    }),
    prisma.analyticsEvent.count(),
    prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 60,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
      include: { items: true },
    }),
    prisma.studioBrief.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.siteSection.findMany({
      orderBy: { createdAt: 'asc' },
    }),
    listManagedPages(),
    prisma.review.findMany({
      orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }],
      take: 40,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 18,
      select: {
        id: true,
        eventName: true,
        source: true,
        path: true,
        consentLevel: true,
        createdAt: true,
      },
    }),
    prisma.supportThread.findMany({
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: 50,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            shippingCity: true,
            estimatedDeliveryAt: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        summaries: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.automationJob.findMany({
      orderBy: [{ status: 'asc' }, { runAt: 'asc' }],
      take: 40,
    }),
    prisma.securityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.user.findMany({
      where: {
        OR: [{ isAdmin: true }, { role: { not: 'CUSTOMER' } }],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isAdmin: true,
        lastSignInAt: true,
        createdAt: true,
      },
    }),
  ]);

  const activity = [
    ...orders.slice(0, 4).map((order) => ({
      id: `order:${order.id}`,
      type: 'order',
      title: `Order ${order.orderNumber}`,
      detail: `${order.customerName} · ${order.status}`,
      createdAt: order.createdAt.toISOString(),
    })),
    ...studioBriefs.slice(0, 4).map((brief) => ({
      id: `studio:${brief.id}`,
      type: 'studio',
      title: `Studio ${brief.referenceCode}`,
      detail: `${brief.helpType} · ${brief.status}`,
      createdAt: brief.createdAt.toISOString(),
    })),
    ...contactMessages.slice(0, 4).map((message) => ({
      id: `contact:${message.id}`,
      type: 'contact',
      title: `Contact from ${message.name}`,
      detail: `${message.subject} · ${message.status}`,
      createdAt: message.createdAt.toISOString(),
    })),
    ...newsletterSubscribers.slice(0, 4).map((subscriber) => ({
      id: `newsletter:${subscriber.id}`,
      type: 'newsletter',
      title: 'Newsletter signup',
      detail: subscriber.email,
      createdAt: subscriber.createdAt.toISOString(),
    })),
    ...reviews.slice(0, 4).map((review) => ({
      id: `review:${review.id}`,
      type: 'review',
      title: `Review from ${review.name}`,
      detail: `${review.product.name} · ${review.approved ? 'Approved' : 'Awaiting approval'}`,
      createdAt: review.createdAt.toISOString(),
    })),
  ]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 10);

  const attributionSummary = Array.from(
    orders.reduce((summary, order) => {
      const label =
        order.attributionCampaign ||
        order.attributionSource ||
        (order.gclid ? 'Google Ads' : order.fbclid ? 'Meta Ads' : 'Direct / Unattributed');
      const medium =
        order.attributionMedium ||
        (order.gclid ? 'cpc' : order.fbclid ? 'paid-social' : 'direct');
      const key = `${label}__${medium}`;
      const current = summary.get(key) || {
        label,
        medium,
        orders: 0,
        revenue: 0,
      };

      current.orders += 1;
      current.revenue += order.totalAmount;
      summary.set(key, current);
      return summary;
    }, new Map<string, { label: string; medium: string; orders: number; revenue: number }>())
  )
    .map(([, value]) => value)
    .sort((left, right) => right.revenue - left.revenue || right.orders - left.orders)
    .slice(0, 6);

  const pendingDeliveryOrders = orders.filter((order) =>
    ['PAID', 'PROCESSING', 'SHIPPED'].includes(order.status)
  );
  const deliveredOrders = orders.filter((order) => order.status === 'DELIVERED');

  return {
    adminAccess: {
      allowedTabs: viewer ? getAllowedAdminTabs(viewer.role) : [],
      permissions: viewer?.permissions || [],
    },
    counts: {
      products: productCount,
      orders: orderCount,
      studioBriefs: studioCount,
      contactMessages: contactCount,
      newsletterSubscribers: newsletterCount,
      reviews: reviewCount,
      pendingReviews: pendingReviewCount,
    analyticsEvents: analyticsEventCount,
    },
    newsletterMarketing: {
      provider: hubspotConfig.provider,
      enabled: hubspotConfig.enabled,
      hasListId: hubspotConfig.hasListId,
      portalId: hubspotConfig.portalId || null,
      listId: hubspotConfig.listId || null,
      manageUrl: hubspotConfig.manageUrl,
      contactsUrl: hubspotConfig.contactsUrl,
      listsUrl: hubspotConfig.listsUrl,
    },
    activity,
    deliverySummary: {
      pending: pendingDeliveryOrders.length,
      delivered: deliveredOrders.length,
      pendingLocations: pendingDeliveryOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        shippingCity: order.shippingCity,
        shippingAddr1: order.shippingAddr1,
        status: order.status,
        estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() || null,
      })),
    },
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      potOnly: product.potOnly,
      category: product.category,
      size: product.size,
      badge: product.badge,
      short: product.short,
      description: product.description,
      cardDescription: product.cardDescription,
      image: product.image,
      gallery:
        Array.isArray(product.gallery) && product.gallery.length
          ? product.gallery.map((entry) => String(entry))
          : [product.image],
      availableSizes: normalizeAvailableSizes(product.availableSizes, product.size),
      modeContent: normalizeModeContent({
        category: product.category,
        size: product.size,
        name: product.name,
        short: product.short,
        description: product.description,
        cardDescription: product.cardDescription,
        image: product.image,
        gallery:
          Array.isArray(product.gallery) && product.gallery.length
            ? product.gallery.map((entry) => String(entry))
            : [product.image],
        price: product.price,
        potOnly: product.potOnly,
        forcePotOnly: product.forcePotOnly,
        decorative: product.decorative,
        details:
          (product.details && typeof product.details === 'object' && !Array.isArray(product.details)
            ? Object.fromEntries(
                Object.entries(product.details as Record<string, unknown>).map(([key, value]) => [
                  key,
                  String(value),
                ])
              )
            : {}) as Record<string, string>,
        availableSizes: product.availableSizes,
        modeContent: product.modeContent,
      }),
      decorative: product.decorative,
      forcePotOnly: product.forcePotOnly,
      visible: product.visible,
      available: product.available,
      updatedAt: product.updatedAt.toISOString(),
    })),
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      shippingCity: order.shippingCity,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt.toISOString(),
      trackingCode: order.trackingCode,
      isCustomOrder: order.isCustomOrder,
      estimatedDispatchAt: order.estimatedDispatchAt?.toISOString() || null,
      estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() || null,
      trackingTimeline: Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [],
      notificationLog: Array.isArray(order.notificationLog) ? order.notificationLog : [],
      attribution: {
        source: order.attributionSource,
        medium: order.attributionMedium,
        campaign: order.attributionCampaign,
        landingPath: order.landingPath,
        gclid: order.gclid,
        fbclid: order.fbclid,
      },
      itemCount: order.items.length,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        mode: item.mode,
        lineTotal: item.lineTotal,
        image: item.image,
      })),
    })),
    orderAttributionSummary: attributionSummary,
    studioBriefs: studioBriefs.map((brief) => ({
      id: brief.id,
      referenceCode: brief.referenceCode,
      status: brief.status,
      space: brief.space,
      helpType: brief.helpType,
      summary: brief.summary,
      message: brief.message,
      imagePreview: brief.imagePreview,
      referenceLink: brief.referenceLink,
      extraNote: brief.extraNote,
      internalNotes: brief.internalNotes,
      createdAt: brief.createdAt.toISOString(),
    })),
    contactMessages: contactMessages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      context: message.context,
      imageUrl: message.imageUrl,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      readAt: message.readAt?.toISOString() || null,
      handledAt: message.handledAt?.toISOString() || null,
    })),
    newsletterSubscribers: newsletterSubscribers.map((subscriber) => ({
      id: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      preferredChannel: subscriber.preferredChannel,
      interests: Array.isArray(subscriber.interests) ? subscriber.interests.map((entry) => String(entry)) : [],
      source: subscriber.source,
      createdAt: subscriber.createdAt.toISOString(),
    })),
    siteSections: siteSections.map((section) => ({
      id: section.id,
      key: section.key,
      label: section.label,
      route: section.route,
      visible: section.visible,
    })),
    managedPages,
    reviews: reviews.map((review) => ({
      id: review.id,
      name: review.name,
      rating: review.rating,
      body: review.body,
      approved: review.approved,
      featured: review.featured,
      createdAt: review.createdAt.toISOString(),
      product: {
        id: review.product.id,
        name: review.product.name,
        slug: review.product.slug,
      },
    })),
    analyticsEvents: analyticsEvents.map((event) => ({
      id: event.id,
      eventName: event.eventName,
      source: event.source,
      path: event.path,
      consentLevel: event.consentLevel,
      createdAt: event.createdAt.toISOString(),
    })),
    supportThreads: supportThreads.map((thread) => ({
      id: thread.id,
      source: thread.source,
      status: thread.status,
      priority: thread.priority,
      customerName: thread.customerName,
      customerEmail: thread.customerEmail,
      customerPhone: thread.customerPhone,
      summary: thread.summary,
      order: thread.order
        ? {
            id: thread.order.id,
            orderNumber: thread.order.orderNumber,
            status: thread.order.status,
            shippingCity: thread.order.shippingCity,
            estimatedDeliveryAt: thread.order.estimatedDeliveryAt?.toISOString() || null,
          }
        : null,
      latestMessage: thread.messages[0]
        ? {
            body: thread.messages[0].body,
            createdAt: thread.messages[0].createdAt.toISOString(),
          }
        : null,
      latestSummary: thread.summaries[0]
        ? {
            intent: thread.summaries[0].intent,
            shortSummary: thread.summaries[0].shortSummary,
            suggestedNextStep: thread.summaries[0].suggestedNextStep,
          }
        : null,
      updatedAt: thread.updatedAt.toISOString(),
    })),
    automationJobs: automationJobs.map((job) => ({
      id: job.id,
      type: job.type,
      status: job.status,
      dedupeKey: job.dedupeKey,
      runAt: job.runAt.toISOString(),
      attempts: job.attempts,
      lastError: job.lastError,
      completedAt: job.completedAt?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
    })),
    securityEvents: securityEvents.map((event) => ({
      id: event.id,
      type: event.type,
      severity: event.severity,
      route: event.route,
      identifier: event.identifier,
      createdAt: event.createdAt.toISOString(),
    })),
    adminUsers: adminUsers.map((adminUser) => ({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      isAdmin: adminUser.isAdmin,
      lastSignInAt: adminUser.lastSignInAt?.toISOString() || null,
      createdAt: adminUser.createdAt.toISOString(),
    })),
  };
}
