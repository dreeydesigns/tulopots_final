import type { ContactMessageStatus, OrderStatus, StudioBriefStatus } from '@prisma/client';
import type { AdminTabId, PermissionKey } from '@/lib/access';
import {
  canAccessAdminTab,
  getAllowedAdminTabs,
  hasPermission,
  normalizeUserRole,
} from '@/lib/access';
import { syncCatalogToDatabase } from '@/lib/catalog';
import { listManagedPages, syncManagedPageContentToDatabase } from '@/lib/cms';
import { getHubSpotConfig } from '@/lib/hubspot';
import { getCurrentUser, isSchemaCompatibilityError } from '@/lib/auth';
import { generateProductSku, slugifyProduct } from '@/lib/product-identity';
import { normalizeAvailableSizes, normalizeModeContent } from '@/lib/product-variants';
import { prisma } from '@/lib/prisma';

const adminDashboardOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  totalAmount: true,
  subtotal: true,
  deliveryFee: true,
  shippingCity: true,
  shippingAddr1: true,
  adminNotes: true,
  createdAt: true,
  trackingCode: true,
  isCustomOrder: true,
  estimatedDispatchAt: true,
  estimatedDeliveryAt: true,
  trackingTimeline: true,
  notificationLog: true,
  attributionSource: true,
  attributionMedium: true,
  attributionCampaign: true,
  landingPath: true,
  gclid: true,
  fbclid: true,
  items: {
    select: {
      id: true,
      name: true,
      quantity: true,
      mode: true,
      lineTotal: true,
      image: true,
    },
  },
} satisfies import('@prisma/client').Prisma.OrderSelect;

const compatibilityDashboardOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  totalAmount: true,
  subtotal: true,
  deliveryFee: true,
  shippingCity: true,
  shippingAddr1: true,
  adminNotes: true,
  createdAt: true,
  trackingCode: true,
  isCustomOrder: true,
  trackingTimeline: true,
  notificationLog: true,
  items: {
    select: {
      id: true,
      name: true,
      quantity: true,
      mode: true,
      lineTotal: true,
      image: true,
    },
  },
} satisfies import('@prisma/client').Prisma.OrderSelect;

async function findDashboardOrders() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: adminDashboardOrderSelect,
    });
  } catch (error) {
    if (!isAdminDashboardFallbackError(error)) {
      throw error;
    }

    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: compatibilityDashboardOrderSelect,
    });
  }
}

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
    findDashboardOrders(),
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
      const rawCampaign =
        'attributionCampaign' in order && typeof order.attributionCampaign === 'string'
          ? order.attributionCampaign
          : '';
      const rawSource =
        'attributionSource' in order && typeof order.attributionSource === 'string'
          ? order.attributionSource
          : '';
      const rawMedium =
        'attributionMedium' in order && typeof order.attributionMedium === 'string'
          ? order.attributionMedium
          : '';
      const hasGoogleClick =
        'gclid' in order && typeof order.gclid === 'string' && order.gclid.length > 0;
      const hasMetaClick =
        'fbclid' in order && typeof order.fbclid === 'string' && order.fbclid.length > 0;

      const label = rawCampaign || rawSource || (hasGoogleClick
        ? 'Google Ads'
        : hasMetaClick
          ? 'Meta Ads'
          : 'Direct / Unattributed');
      const medium = rawMedium || (hasGoogleClick ? 'cpc' : hasMetaClick ? 'paid-social' : 'direct');
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
        estimatedDeliveryAt:
          'estimatedDeliveryAt' in order && order.estimatedDeliveryAt instanceof Date
            ? order.estimatedDeliveryAt.toISOString()
            : null,
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
      estimatedDispatchAt:
        'estimatedDispatchAt' in order && order.estimatedDispatchAt instanceof Date
          ? order.estimatedDispatchAt.toISOString()
          : null,
      estimatedDeliveryAt:
        'estimatedDeliveryAt' in order && order.estimatedDeliveryAt instanceof Date
          ? order.estimatedDeliveryAt.toISOString()
          : null,
      trackingTimeline: Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [],
      notificationLog: Array.isArray(order.notificationLog) ? order.notificationLog : [],
      attribution: {
        source: 'attributionSource' in order ? order.attributionSource : null,
        medium: 'attributionMedium' in order ? order.attributionMedium : null,
        campaign: 'attributionCampaign' in order ? order.attributionCampaign : null,
        landingPath: 'landingPath' in order ? order.landingPath : null,
        gclid: 'gclid' in order ? order.gclid : null,
        fbclid: 'fbclid' in order ? order.fbclid : null,
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

function isAdminDashboardFallbackError(error: unknown) {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code || '').toUpperCase()
      : '';
  const message = String((error as Error | null | undefined)?.message || '').toLowerCase();

  return (
    isSchemaCompatibilityError(error) ||
    code === 'P1001' ||
    message.includes("can't reach database server") ||
    message.includes('server has closed the connection') ||
    message.includes('connection reset') ||
    message.includes('forcibly closed by the remote host')
  );
}

async function safeAdminDashboardQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (!isAdminDashboardFallbackError(error)) {
      throw error;
    }

    return fallback;
  }
}

export async function getFallbackAdminDashboardData(viewer?: { role: any; permissions: string[] }) {
  const hubspotConfig = getHubSpotConfig();

  const [products, orders, studioBriefs, contactMessages, newsletterSubscribers, siteSections, managedPages, reviews, analyticsCount, adminUsers] =
    await Promise.all([
      safeAdminDashboardQuery(
        () =>
          prisma.product.findMany({
            orderBy: { updatedAt: 'desc' },
            take: 40,
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              price: true,
              potOnly: true,
              category: true,
              size: true,
              badge: true,
              short: true,
              description: true,
              cardDescription: true,
              image: true,
              gallery: true,
              details: true,
              visible: true,
              available: true,
              updatedAt: true,
            },
          }),
        []
      ),
      safeAdminDashboardQuery(
        () =>
          prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentMethod: true,
              customerName: true,
              customerEmail: true,
              customerPhone: true,
              totalAmount: true,
              subtotal: true,
              deliveryFee: true,
              shippingCity: true,
              adminNotes: true,
              createdAt: true,
              items: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  mode: true,
                  lineTotal: true,
                  image: true,
                },
              },
            },
          }),
        []
      ),
      safeAdminDashboardQuery(
        () =>
          prisma.studioBrief.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30,
          }),
        []
      ),
      safeAdminDashboardQuery(
        () =>
          prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30,
          }),
        []
      ),
      safeAdminDashboardQuery(
        () =>
          prisma.newsletterSubscriber.findMany({
            orderBy: { createdAt: 'desc' },
            take: 60,
          }),
        []
      ),
      safeAdminDashboardQuery(
        () =>
          prisma.siteSection.findMany({
            orderBy: { createdAt: 'asc' },
          }),
        []
      ),
      safeAdminDashboardQuery(() => listManagedPages(), []),
      safeAdminDashboardQuery(
        () =>
          prisma.review.findMany({
            orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }],
            take: 30,
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
        []
      ),
      safeAdminDashboardQuery(() => prisma.analyticsEvent.count(), 0),
      safeAdminDashboardQuery(
        () =>
          prisma.user.findMany({
            where: {
              isAdmin: true,
            },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              isAdmin: true,
              createdAt: true,
            },
          }),
        []
      ),
    ]);

  const activity = [
    ...orders.slice(0, 4).map((order: any) => ({
      id: `order:${order.id}`,
      type: 'order',
      title: `Order ${order.orderNumber}`,
      detail: `${order.customerName} · ${order.status}`,
      createdAt: order.createdAt.toISOString(),
    })),
    ...studioBriefs.slice(0, 3).map((brief: any) => ({
      id: `studio:${brief.id}`,
      type: 'studio',
      title: `Studio ${brief.referenceCode}`,
      detail: `${brief.helpType} · ${brief.status}`,
      createdAt: brief.createdAt.toISOString(),
    })),
    ...contactMessages.slice(0, 3).map((message: any) => ({
      id: `contact:${message.id}`,
      type: 'contact',
      title: `Contact from ${message.name}`,
      detail: `${message.subject} · ${message.status}`,
      createdAt: message.createdAt.toISOString(),
    })),
  ]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 10);

  return {
    adminAccess: {
      allowedTabs: viewer ? getAllowedAdminTabs(viewer.role) : [],
      permissions: viewer?.permissions || [],
    },
    counts: {
      products: products.length,
      orders: orders.length,
      studioBriefs: studioBriefs.length,
      contactMessages: contactMessages.length,
      newsletterSubscribers: newsletterSubscribers.length,
      reviews: reviews.length,
      pendingReviews: reviews.filter((review: any) => !review.approved).length,
      analyticsEvents: analyticsCount,
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
    products: products.map((product: any) => {
      const gallery =
        Array.isArray(product.gallery) && product.gallery.length
          ? product.gallery.map((entry: unknown) => String(entry))
          : [product.image];
      const availableSizes = normalizeAvailableSizes([], product.size);

      return {
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
        gallery,
        availableSizes,
        modeContent: normalizeModeContent({
          category: product.category,
          size: product.size,
          name: product.name,
          short: product.short,
          description: product.description,
          cardDescription: product.cardDescription,
          image: product.image,
          gallery,
          price: product.price,
          potOnly: product.potOnly,
          forcePotOnly: product.category === 'pots',
          decorative: false,
          details:
            product.details && typeof product.details === 'object' && !Array.isArray(product.details)
              ? Object.fromEntries(
                  Object.entries(product.details as Record<string, unknown>).map(([key, value]) => [
                    key,
                    String(value),
                  ])
                )
              : {},
          availableSizes,
          modeContent: {},
        }),
        decorative: false,
        forcePotOnly: product.category === 'pots',
        visible: product.visible,
        available: product.available,
        updatedAt: product.updatedAt.toISOString(),
      };
    }),
    orders: orders.map((order: any) => ({
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
      trackingCode: '',
      isCustomOrder: false,
      estimatedDispatchAt: null,
      estimatedDeliveryAt: null,
      trackingTimeline: [],
      notificationLog: [],
      attribution: {
        source: null,
        medium: null,
        campaign: null,
        landingPath: null,
        gclid: null,
        fbclid: null,
      },
      itemCount: Array.isArray(order.items) ? order.items.length : 0,
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            mode: item.mode,
            lineTotal: item.lineTotal,
            image: item.image,
          }))
        : [],
    })),
    orderAttributionSummary: [],
    deliverySummary: {
      pending: orders.filter((order: any) => ['PAID', 'PROCESSING', 'SHIPPED'].includes(order.status)).length,
      delivered: orders.filter((order: any) => order.status === 'DELIVERED').length,
      pendingLocations: orders
        .filter((order: any) => ['PAID', 'PROCESSING', 'SHIPPED'].includes(order.status))
        .map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          shippingCity: order.shippingCity,
          shippingAddr1: null,
          status: order.status,
          estimatedDeliveryAt: null,
        })),
    },
    studioBriefs: studioBriefs.map((brief: any) => ({
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
    contactMessages: contactMessages.map((message: any) => ({
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
    newsletterSubscribers: newsletterSubscribers.map((subscriber: any) => ({
      id: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      preferredChannel: subscriber.preferredChannel,
      interests: Array.isArray(subscriber.interests)
        ? subscriber.interests.map((entry: unknown) => String(entry))
        : [],
      source: subscriber.source,
      createdAt: subscriber.createdAt.toISOString(),
    })),
    siteSections: siteSections.map((section: any) => ({
      id: section.id,
      key: section.key,
      label: section.label,
      route: section.route,
      visible: section.visible,
    })),
    managedPages,
    reviews: reviews.map((review: any) => ({
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
    analyticsEvents: [],
    supportThreads: [],
    automationJobs: [],
    securityEvents: [],
    adminUsers: adminUsers.map((adminUser: any) => ({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: normalizeUserRole(null, adminUser.isAdmin),
      isAdmin: adminUser.isAdmin,
      lastSignInAt: null,
      createdAt: adminUser.createdAt.toISOString(),
    })),
  };
}
