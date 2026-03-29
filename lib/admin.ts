import type { ContactMessageStatus, OrderStatus, StudioBriefStatus } from '@prisma/client';
import { syncCatalogToDatabase } from '@/lib/catalog';
import { getCurrentUser } from '@/lib/auth';
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

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return null;
  }

  return user;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function getAdminDashboardData() {
  const initialProductCount = await prisma.product.count();
  const initialSectionCount = await prisma.siteSection.count();

  if (initialProductCount === 0 || initialSectionCount === 0) {
    await syncCatalogToDatabase();
  }

  const [
    productCount,
    orderCount,
    studioCount,
    contactCount,
    newsletterCount,
    reviewCount,
    pendingReviewCount,
    products,
    orders,
    studioBriefs,
    contactMessages,
    newsletterSubscribers,
    siteSections,
    reviews,
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

  return {
    counts: {
      products: productCount,
      orders: orderCount,
      studioBriefs: studioCount,
      contactMessages: contactCount,
      newsletterSubscribers: newsletterCount,
      reviews: reviewCount,
      pendingReviews: pendingReviewCount,
    },
    activity,
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
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      readAt: message.readAt?.toISOString() || null,
      handledAt: message.handledAt?.toISOString() || null,
    })),
    newsletterSubscribers: newsletterSubscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      createdAt: subscriber.createdAt.toISOString(),
    })),
    siteSections: siteSections.map((section) => ({
      id: section.id,
      key: section.key,
      label: section.label,
      route: section.route,
      visible: section.visible,
    })),
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
  };
}
