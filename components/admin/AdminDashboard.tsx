'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Mail,
  PackagePlus,
  PanelsTopLeft,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Star,
  SquarePen,
  Trash2,
  Truck,
} from 'lucide-react';
import type { User } from '@/components/Providers';
import { generateProductSku, slugifyProduct } from '@/lib/product-identity';
import {
  adminAvailableSizeOptions,
  normalizeAvailableSizes,
  normalizeModeContent,
  type ProductModeContentMap,
  type ProductSizeKey,
} from '@/lib/product-variants';
import type { ManagedPageRecord } from '@/lib/cms';
import { ProductVariantEditor } from './ProductVariantEditor';
import { AdminHelpPanel } from './AdminHelpPanel';

export type Tab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'studio'
  | 'reviews'
  | 'support'
  | 'newsletter'
  | 'content'
  | 'automation'
  | 'security';

type DashboardData = {
  adminAccess: {
    allowedTabs: string[];
    permissions: string[];
  };
  counts: {
    products: number;
    orders: number;
    studioBriefs: number;
    contactMessages: number;
    newsletterSubscribers: number;
    reviews: number;
    pendingReviews: number;
    analyticsEvents: number;
  };
  newsletterMarketing: {
    provider: string;
    enabled: boolean;
    hasListId: boolean;
    portalId: string | null;
    listId: string | null;
    manageUrl: string;
    contactsUrl: string;
    listsUrl: string;
  };
  activity: Array<{
    id: string;
    type: string;
    title: string;
    detail: string;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    price: number;
    potOnly: number | null;
    category: string;
    size: string;
    badge: string | null;
    short: string;
    description: string;
    cardDescription: string;
    image: string;
    gallery: string[];
    availableSizes: ProductSizeKey[];
    modeContent: ProductModeContentMap;
    decorative: boolean;
    forcePotOnly: boolean;
    visible: boolean;
    available: boolean;
    updatedAt: string;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    subtotal: number;
    deliveryFee: number;
    shippingCity: string | null;
    adminNotes: string | null;
    createdAt: string;
    trackingCode: string;
    isCustomOrder: boolean;
    estimatedDispatchAt: string | null;
    estimatedDeliveryAt: string | null;
    trackingTimeline: any[];
    notificationLog: any[];
    attribution: {
      source: string | null;
      medium: string | null;
      campaign: string | null;
      landingPath: string | null;
      gclid: string | null;
      fbclid: string | null;
    };
    itemCount: number;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      mode: string;
      lineTotal: number;
      image: string | null;
    }>;
  }>;
  orderAttributionSummary: Array<{
    label: string;
    medium: string;
    orders: number;
    revenue: number;
  }>;
  deliverySummary: {
    pending: number;
    delivered: number;
    pendingLocations: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      shippingCity: string | null;
      shippingAddr1: string | null;
      status: string;
      estimatedDeliveryAt: string | null;
    }>;
  };
  studioBriefs: Array<{
    id: string;
    referenceCode: string;
    status: string;
    space: string;
    helpType: string;
    summary: string;
    message: string;
    imagePreview: string | null;
    referenceLink: string | null;
    extraNote: string | null;
    internalNotes: string | null;
    createdAt: string;
  }>;
  contactMessages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    context: string | null;
    imageUrl: string | null;
    status: string;
    createdAt: string;
    readAt: string | null;
    handledAt: string | null;
  }>;
  newsletterSubscribers: Array<{
    id: string;
    name: string | null;
    email: string;
    preferredChannel: string | null;
    interests: string[];
    source: string | null;
    createdAt: string;
  }>;
  siteSections: Array<{
    id: string;
    key: string;
    label: string;
    route: string | null;
    visible: boolean;
  }>;
  managedPages: ManagedPageRecord[];
  reviews: Array<{
    id: string;
    name: string;
    rating: number;
    body: string;
    approved: boolean;
    featured: boolean;
    createdAt: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  analyticsEvents: Array<{
    id: string;
    eventName: string;
    source: string | null;
    path: string | null;
    consentLevel: string;
    createdAt: string;
  }>;
  supportThreads: Array<{
    id: string;
    source: string;
    status: string;
    priority: string;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    summary: string | null;
    order: {
      id: string;
      orderNumber: string;
      status: string;
      shippingCity: string | null;
      estimatedDeliveryAt: string | null;
    } | null;
    latestMessage: {
      body: string;
      createdAt: string;
    } | null;
    latestSummary: {
      intent: string;
      shortSummary: string;
      suggestedNextStep: string | null;
    } | null;
    updatedAt: string;
  }>;
  automationJobs: Array<{
    id: string;
    type: string;
    status: string;
    dedupeKey: string | null;
    runAt: string;
    attempts: number;
    lastError: string | null;
    completedAt: string | null;
    createdAt: string;
  }>;
  securityEvents: Array<{
    id: string;
    type: string;
    severity: string;
    route: string | null;
    identifier: string | null;
    createdAt: string;
  }>;
  adminUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    isAdmin: boolean;
    lastSignInAt: string | null;
    createdAt: string;
  }>;
};

type DashboardResponse = {
  ok: boolean;
  dashboard?: DashboardData;
  error?: string;
};

type AutomationResponse = {
  ok: boolean;
  summary?: {
    processedAt: string;
    advancedOrders: number;
    advancedOrderNumbers: string[];
    deliveryCheckInsQueued: number;
    deliveryCheckInOrders: string[];
    reviewRequestsQueued: number;
    reviewRequestOrders: string[];
  };
  error?: string;
};

type NewsletterSyncResponse = {
  ok: boolean;
  summary?: {
    total: number;
    synced: number;
    failed: number;
  };
  error?: string;
};

type ManagedPageResponse = {
  ok: boolean;
  page?: ManagedPageRecord;
  error?: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  size: string;
  badge: string;
  availableSizes: ProductSizeKey[];
  modeContent: ProductModeContentMap;
  visible: boolean;
  available: boolean;
  decorative: boolean;
  forcePotOnly: boolean;
};

const productCategoryOptions = [
  { value: 'indoor', label: 'For Interior Spaces' },
  { value: 'outdoor', label: 'For Open Spaces' },
  { value: 'pots', label: 'Clay Forms' },
];

const productSizeProfileOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'decorative', label: 'Decorative' },
  { value: 'sets', label: 'Studio Set' },
];

const productBadgeOptions = [
  '',
  'New',
  'Bestseller',
  'Indoor',
  'Outdoor',
  'Limited',
  'Studio',
];

const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: PackagePlus },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'studio', label: 'Studio', icon: Sparkles },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'support', label: 'Support', icon: Mail },
  { id: 'newsletter', label: 'Newsletter', icon: Boxes },
  { id: 'content', label: 'Content', icon: PanelsTopLeft },
  { id: 'automation', label: 'Automation', icon: Truck },
  { id: 'security', label: 'Security', icon: Shield },
];

const orderStatusOptions = [
  'PENDING',
  'CONFIRMED',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'FAILED',
  'CANCELLED',
];

const studioStatusOptions = ['RECEIVED', 'REVIEWING', 'RESPONDED', 'CLOSED'];
const supportStatusOptions = ['OPEN', 'PENDING', 'RESOLVED'];
const supportPriorityOptions = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const adminRoleOptions = [
  'SUPER_ADMIN',
  'OPERATIONS_ADMIN',
  'DELIVERY_ADMIN',
  'CONTENT_ADMIN',
  'SUPPORT_ADMIN',
  'ANALYST',
  'CUSTOMER',
];

function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function syncProductForm(
  current: ProductFormState,
  updates: Partial<ProductFormState> = {}
): ProductFormState {
  const nextCategory = updates.category ?? current.category;
  const nextSize = updates.size ?? current.size;
  const nextName = updates.name ?? current.name;
  const nextDecorative = updates.decorative ?? current.decorative;
  const nextForcePotOnly =
    nextCategory === 'pots' ? true : updates.forcePotOnly ?? current.forcePotOnly;
  const resolvedForcePotOnly =
    updates.category && nextCategory !== 'pots' && updates.forcePotOnly == null
      ? false
      : nextForcePotOnly;
  const nextAvailableSizes = normalizeAvailableSizes(
    updates.availableSizes ?? current.availableSizes,
    nextSize
  );
  const nextModeContent = normalizeModeContent({
    category: nextCategory,
    size: nextSize,
    name: nextName,
    short: '',
    description: '',
    cardDescription: '',
    image: '',
    gallery: [],
    price: 0,
    potOnly: null,
    decorative: nextDecorative,
    forcePotOnly: resolvedForcePotOnly,
    availableSizes: nextAvailableSizes,
    modeContent: updates.modeContent ?? current.modeContent,
    details: {},
  });

  return {
    ...current,
    ...updates,
    category: nextCategory,
    size: nextSize,
    name: nextName,
    decorative: nextDecorative,
    forcePotOnly: resolvedForcePotOnly,
    availableSizes: nextAvailableSizes,
    modeContent: nextModeContent,
  };
}

function createDefaultProductForm(): ProductFormState {
  return syncProductForm(
    {
      name: '',
      slug: '',
      sku: '',
      category: 'pots',
      size: 'medium',
      badge: '',
      availableSizes: [],
      modeContent: {},
      visible: true,
      available: true,
      decorative: false,
      forcePotOnly: true,
    },
    {}
  );
}

const defaultProductForm: ProductFormState = createDefaultProductForm();

function productToForm(product: DashboardData['products'][number]): ProductFormState {
  return syncProductForm(
    {
      name: product.name,
      slug: product.slug,
      sku: product.sku || '',
      category: product.category,
      size: product.size,
      badge: product.badge || '',
      availableSizes: product.availableSizes,
      modeContent: product.modeContent,
      visible: product.visible,
      available: product.available,
      decorative: product.decorative,
      forcePotOnly: product.forcePotOnly,
    },
    {}
  );
}

function autoSlugForForm(form: ProductFormState) {
  return form.name ? slugifyProduct(form.name) : '';
}

function autoSkuForForm(form: ProductFormState) {
  return form.name
    ? generateProductSku({
        category: form.category,
        size: form.availableSizes[0] || form.size,
        name: form.name,
      })
    : '';
}

export function AdminDashboard({
  user,
  initialTab = 'overview',
}: {
  user: User;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [automationMessage, setAutomationMessage] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState('');
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [newsletterSyncMessage, setNewsletterSyncMessage] = useState('');
  const visibleTabs = useMemo(
    () => tabs.filter((item) => user.allowedAdminTabs.includes(item.id)),
    [user.allowedAdminTabs]
  );

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);
  const [slugManual, setSlugManual] = useState(false);
  const [skuManual, setSkuManual] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderIsCustom, setOrderIsCustom] = useState(false);

  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [briefStatus, setBriefStatus] = useState('RECEIVED');
  const [briefNotes, setBriefNotes] = useState('');

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedSupportThreadId, setSelectedSupportThreadId] = useState<string | null>(null);
  const [selectedSecurityEventId, setSelectedSecurityEventId] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [supportQuery, setSupportQuery] = useState('');
  const [newsletterQuery, setNewsletterQuery] = useState('');
  const [selectedManagedPageKey, setSelectedManagedPageKey] = useState<string | null>(null);
  const [managedPageEditor, setManagedPageEditor] = useState('');
  const [managedPageMessage, setManagedPageMessage] = useState('');
  const [supportStatus, setSupportStatus] = useState('OPEN');
  const [supportPriority, setSupportPriority] = useState('NORMAL');
  const [supportNote, setSupportNote] = useState('');
  const [adminRoleDrafts, setAdminRoleDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user.allowedAdminTabs.includes(initialTab)) {
      setTab(initialTab);
      return;
    }

    setTab((user.allowedAdminTabs[0] as Tab | undefined) || 'overview');
  }, [initialTab, user.allowedAdminTabs]);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/admin/dashboard', {
        cache: 'no-store',
      });
      const data = (await response.json()) as DashboardResponse;

      if (!response.ok || !data.ok || !data.dashboard) {
        setError(data.error || 'Unable to load the admin dashboard.');
        return;
      }

      setDashboard(data.dashboard);
      setLastLoadedAt(new Date().toISOString());

      if (!selectedOrderId && data.dashboard.orders.length) {
        setSelectedOrderId(data.dashboard.orders[0].id);
      }

      if (!selectedBriefId && data.dashboard.studioBriefs.length) {
        setSelectedBriefId(data.dashboard.studioBriefs[0].id);
      }

      if (!selectedReviewId && data.dashboard.reviews.length) {
        setSelectedReviewId(data.dashboard.reviews[0].id);
      }

      if (!selectedSupportThreadId && data.dashboard.supportThreads.length) {
        setSelectedSupportThreadId(data.dashboard.supportThreads[0].id);
      }

      if (!selectedSecurityEventId && data.dashboard.securityEvents.length) {
        setSelectedSecurityEventId(data.dashboard.securityEvents[0].id);
      }

      if (!selectedManagedPageKey && data.dashboard.managedPages.length) {
        setSelectedManagedPageKey(data.dashboard.managedPages[0].key);
      }

      setAdminRoleDrafts(
        Object.fromEntries(data.dashboard.adminUsers.map((adminUser) => [adminUser.id, adminUser.role]))
      );
    } catch {
      setError('Unable to load the admin dashboard.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const selectedManagedPage =
    dashboard?.managedPages.find((page) => page.key === selectedManagedPageKey) || null;

  useEffect(() => {
    if (selectedManagedPage) {
      setManagedPageEditor(prettyJson(selectedManagedPage.payload));
    }
  }, [selectedManagedPage]);

  async function runAutomationPass() {
    try {
      setPendingKey('automation:operations');
      setError('');
      setAutomationMessage('');

      const response = await fetch('/api/admin/automation', {
        method: 'POST',
      });
      const data = (await response.json()) as AutomationResponse;

      if (!response.ok || !data.ok || !data.summary) {
        setError(data.error || 'Unable to run the operations pass.');
        return;
      }

      const nextParts = [
        data.summary.advancedOrders
          ? `${data.summary.advancedOrders} order${data.summary.advancedOrders === 1 ? '' : 's'} advanced`
          : '',
        data.summary.deliveryCheckInsQueued
          ? `${data.summary.deliveryCheckInsQueued} delivery check-in${data.summary.deliveryCheckInsQueued === 1 ? '' : 's'} queued`
          : '',
        data.summary.reviewRequestsQueued
          ? `${data.summary.reviewRequestsQueued} review request${data.summary.reviewRequestsQueued === 1 ? '' : 's'} queued`
          : '',
      ].filter(Boolean);

      setAutomationMessage(
        nextParts.length
          ? `${nextParts.join(' · ')}.`
          : 'No due automation actions were found in this pass.'
      );

      await loadDashboard();
    } catch {
      setError('Unable to run the operations pass.');
    } finally {
      setPendingKey(null);
    }
  }

  async function syncNewsletterToHubSpot() {
    try {
      setPendingKey('newsletter:sync');
      setError('');
      setNewsletterSyncMessage('');

      const response = await fetch('/api/admin/newsletter/sync', {
        method: 'POST',
      });
      const data = (await response.json()) as NewsletterSyncResponse;

      if (!response.ok || !data.ok || !data.summary) {
        setError(data.error || 'Unable to sync subscribers to HubSpot.');
        return;
      }

      setNewsletterSyncMessage(
        `${data.summary.synced} synced · ${data.summary.failed} failed · ${data.summary.total} total`
      );
      await loadDashboard();
    } catch {
      setError('Unable to sync subscribers to HubSpot.');
    } finally {
      setPendingKey(null);
    }
  }

  const selectedOrder = useMemo(
    () => dashboard?.orders.find((order) => order.id === selectedOrderId) || null,
    [dashboard, selectedOrderId]
  );

  const selectedBrief = useMemo(
    () => dashboard?.studioBriefs.find((brief) => brief.id === selectedBriefId) || null,
    [dashboard, selectedBriefId]
  );

  const selectedSupportThread = useMemo(
    () =>
      dashboard?.supportThreads.find((thread) => thread.id === selectedSupportThreadId) || null,
    [dashboard, selectedSupportThreadId]
  );

  const selectedSecurityEvent = useMemo(
    () =>
      dashboard?.securityEvents.find((event) => event.id === selectedSecurityEventId) || null,
    [dashboard, selectedSecurityEventId]
  );

  const selectedReview = useMemo(
    () => dashboard?.reviews.find((review) => review.id === selectedReviewId) || null,
    [dashboard, selectedReviewId]
  );

  const filteredProducts = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const query = productQuery.trim().toLowerCase();
    if (!query) {
      return dashboard.products;
    }

    return dashboard.products.filter((product) =>
      [
        product.name,
        product.slug,
        product.sku || '',
        product.category,
        product.size,
        product.short,
        product.badge || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [dashboard, productQuery]);

  const filteredOrders = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const query = orderQuery.trim().toLowerCase();

    return dashboard.orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const matchesQuery =
        !query ||
        [
          order.orderNumber,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.shippingCity || '',
          order.trackingCode,
          order.attribution.source || '',
          order.attribution.campaign || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [dashboard, orderQuery, orderStatusFilter]);

  const filteredSupportThreads = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const query = supportQuery.trim().toLowerCase();
    if (!query) {
      return dashboard.supportThreads;
    }

    return dashboard.supportThreads.filter((thread) =>
      [
        thread.customerName || '',
        thread.customerEmail || '',
        thread.customerPhone || '',
        thread.source,
        thread.status,
        thread.priority,
        thread.summary || '',
        thread.order?.orderNumber || '',
        thread.order?.shippingCity || '',
        thread.latestSummary?.intent || '',
        thread.latestSummary?.shortSummary || '',
        thread.latestSummary?.suggestedNextStep || '',
        thread.latestMessage?.body || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [dashboard, supportQuery]);

  const filteredNewsletterSubscribers = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const query = newsletterQuery.trim().toLowerCase();
    if (!query) {
      return dashboard.newsletterSubscribers;
    }

    return dashboard.newsletterSubscribers.filter((subscriber) =>
      [
        subscriber.name || '',
        subscriber.email,
        subscriber.preferredChannel || '',
        subscriber.source || '',
        subscriber.interests.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [dashboard, newsletterQuery]);

  useEffect(() => {
    if (!filteredOrders.length) {
      return;
    }

    if (!filteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  useEffect(() => {
    if (!filteredSupportThreads.length) {
      return;
    }

    if (!filteredSupportThreads.some((thread) => thread.id === selectedSupportThreadId)) {
      setSelectedSupportThreadId(filteredSupportThreads[0].id);
    }
  }, [filteredSupportThreads, selectedSupportThreadId]);

  useEffect(() => {
    if (selectedSupportThread) {
      setSupportStatus(selectedSupportThread.status);
      setSupportPriority(selectedSupportThread.priority);
      setSupportNote('');
    }
  }, [selectedSupportThread]);

  useEffect(() => {
    if (!dashboard?.securityEvents.length) {
      return;
    }

    if (!dashboard.securityEvents.some((event) => event.id === selectedSecurityEventId)) {
      setSelectedSecurityEventId(dashboard.securityEvents[0].id);
    }
  }, [dashboard, selectedSecurityEventId]);

  useEffect(() => {
    if (selectedOrder) {
      setOrderStatus(selectedOrder.status);
      setOrderNotes(selectedOrder.adminNotes || '');
      setOrderIsCustom(selectedOrder.isCustomOrder);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (slugManual) {
      return;
    }

    setProductForm((current) => ({
      ...current,
      slug: autoSlugForForm(current),
    }));
  }, [productForm.name, slugManual]);

  useEffect(() => {
    if (skuManual) {
      return;
    }

    setProductForm((current) => ({
      ...current,
      sku: autoSkuForForm(current),
    }));
  }, [
    productForm.availableSizes,
    productForm.category,
    productForm.name,
    productForm.size,
    skuManual,
  ]);

  useEffect(() => {
    if (selectedBrief) {
      setBriefStatus(selectedBrief.status);
      setBriefNotes(selectedBrief.internalNotes || '');
    }
  }, [selectedBrief]);

  async function syncCatalog() {
    try {
      setPendingKey('sync-catalog');
      const response = await fetch('/api/admin/dashboard', { method: 'POST' });
      const data = (await response.json()) as DashboardResponse;

      if (!response.ok || !data.ok || !data.dashboard) {
        setError(data.error || 'Unable to sync the starter catalog.');
        return;
      }

      setDashboard(data.dashboard);
      setLastLoadedAt(new Date().toISOString());
    } catch {
      setError('Unable to sync the starter catalog.');
    } finally {
      setPendingKey(null);
    }
  }

  async function saveProduct() {
    try {
      setPendingKey('save-product');
      setError('');
      const response = await fetch(
        editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products',
        {
          method: editingProductId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        }
      );

      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to save product.');
        return;
      }

      setEditingProductId(null);
      setProductForm(createDefaultProductForm());
      setSlugManual(false);
      setSkuManual(false);
      await loadDashboard();
      setTab('products');
    } catch {
      setError('Unable to save product.');
    } finally {
      setPendingKey(null);
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm('Delete this product? This cannot be undone.')) {
      return;
    }

    try {
      setPendingKey(`delete-product:${id}`);
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to delete product.');
        return;
      }

      if (editingProductId === id) {
        setEditingProductId(null);
        setProductForm(createDefaultProductForm());
        setSlugManual(false);
        setSkuManual(false);
      }

      await loadDashboard();
    } catch {
      setError('Unable to delete product.');
    } finally {
      setPendingKey(null);
    }
  }

  async function updateProductField(
    id: string,
    nextFields: Partial<Pick<ProductFormState, 'visible' | 'available'>>
  ) {
    try {
      setPendingKey(`product-field:${id}`);
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextFields),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update product.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update product.');
    } finally {
      setPendingKey(null);
    }
  }

  async function saveOrder() {
    if (!selectedOrder) return;

    try {
      setPendingKey(`order:${selectedOrder.id}`);
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: orderStatus,
          adminNotes: orderNotes,
          isCustomOrder: orderIsCustom,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update order.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update order.');
    } finally {
      setPendingKey(null);
    }
  }

  async function saveBrief() {
    if (!selectedBrief) return;

    try {
      setPendingKey(`brief:${selectedBrief.id}`);
      const response = await fetch(`/api/admin/studio/${selectedBrief.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: briefStatus, internalNotes: briefNotes }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update Studio brief.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update Studio brief.');
    } finally {
      setPendingKey(null);
    }
  }

  async function saveSupportThread() {
    if (!selectedSupportThread) return;

    try {
      setPendingKey(`support:${selectedSupportThread.id}`);
      const response = await fetch(`/api/admin/support/${selectedSupportThread.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: supportStatus,
          priority: supportPriority,
          note: supportNote.trim(),
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update support thread.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update support thread.');
    } finally {
      setPendingKey(null);
    }
  }

  async function updateAdminRole(id: string) {
    const nextRole = adminRoleDrafts[id];
    if (!nextRole) return;

    try {
      setPendingKey(`role:${id}`);
      const response = await fetch(`/api/admin/security/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update admin role.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update admin role.');
    } finally {
      setPendingKey(null);
    }
  }

  async function updateReview(
    id: string,
    nextFields: {
      approved?: boolean;
      featured?: boolean;
    }
  ) {
    try {
      setPendingKey(`review:${id}`);
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextFields),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update review.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update review.');
    } finally {
      setPendingKey(null);
    }
  }

  async function toggleSection(key: string, visible: boolean) {
    try {
      setPendingKey(`section:${key}`);
      const response = await fetch(`/api/admin/content/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update content visibility.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update content visibility.');
    } finally {
      setPendingKey(null);
    }
  }

  async function saveManagedPage() {
    if (!selectedManagedPage) {
      return;
    }

    try {
      setPendingKey(`page:${selectedManagedPage.key}`);
      setError('');
      setManagedPageMessage('');

      const parsed = JSON.parse(managedPageEditor);
      const response = await fetch(`/api/admin/pages/${selectedManagedPage.key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: parsed }),
      });
      const data = (await response.json()) as ManagedPageResponse;

      if (!response.ok || !data.ok || !data.page) {
        setError(data.error || 'Unable to save that page.');
        return;
      }

      setDashboard((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          managedPages: current.managedPages.map((page) =>
            page.key === data.page?.key ? data.page : page
          ),
        };
      });
      setManagedPageEditor(prettyJson(data.page.payload));
      setManagedPageMessage(`${data.page.label} saved.`);
    } catch (saveError: any) {
      setError(
        saveError?.message === 'Unexpected end of JSON input'
          ? 'The page content JSON is incomplete. Finish the structure before saving.'
          : saveError?.message || 'Unable to save that page.'
      );
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <main
      className="min-h-screen px-4 py-6 md:px-6"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--tp-bg) 78%, black 22%) 0%, color-mix(in srgb, var(--tp-bg) 86%, black 14%) 100%)',
        color: 'var(--tp-text)',
      }}
    >
      <div className="mx-auto max-w-[1500px]">
        <header
          className="rounded-[2rem] border px-6 py-6 md:px-8"
          style={{
            background: 'color-mix(in srgb, var(--tp-surface) 90%, black 10%)',
            borderColor: 'color-mix(in srgb, var(--tp-border) 68%, transparent 32%)',
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.26em]"
                style={{ color: 'var(--tp-accent)' }}
              >
                Internal Control Layer
              </div>
              <h1
                className="mt-4 text-4xl md:text-6xl"
                style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
              >
                TuloPots Admin
              </h1>
              <p
                className="mt-4 max-w-3xl text-sm leading-8 md:text-base"
                style={{ color: 'color-mix(in srgb, var(--tp-text) 86%, transparent 14%)' }}
              >
                Signed in as {user.name}. This layer now runs on live Prisma data for products,
                orders, Studio briefs, contact messages, newsletter growth, and content
                visibility.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadDashboard()}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  background: 'var(--tp-card)',
                  color: 'var(--tp-heading)',
                  border: '1px solid var(--tp-border)',
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => void syncCatalog()}
                disabled={pendingKey === 'sync-catalog'}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
                style={{
                  background: 'var(--tp-accent)',
                  color: '#ffffff',
                }}
              >
                <Sparkles className="h-4 w-4" />
                {pendingKey === 'sync-catalog' ? 'Syncing…' : 'Sync Starter Catalog'}
              </button>
              <Link
                href="/progress"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  background: 'transparent',
                  color: 'var(--tp-text)',
                  border: '1px solid var(--tp-border)',
                }}
              >
                Open Progress
              </Link>
            </div>
          </div>

          <div
            className="mt-5 text-xs"
            style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
          >
            Last refreshed: {lastLoadedAt ? formatDate(lastLoadedAt) : 'Loading…'}
          </div>
        </header>

        {error ? (
          <div
            className="mt-4 rounded-[1.5rem] border px-5 py-4 text-sm"
            style={{
              borderColor: 'color-mix(in srgb, var(--tp-accent) 48%, transparent 52%)',
              background: 'color-mix(in srgb, var(--tp-accent) 12%, transparent 88%)',
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside
            className="rounded-[2rem] border p-3"
            style={{
              background: 'color-mix(in srgb, var(--tp-surface) 80%, black 20%)',
              borderColor: 'color-mix(in srgb, var(--tp-border) 60%, transparent 40%)',
            }}
          >
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className="mb-2 flex w-full items-center gap-3 rounded-[1.25rem] px-4 py-3 text-left text-sm last:mb-0"
                  style={{
                    background: isActive ? 'var(--tp-accent)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--tp-text)',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </aside>

          <section className="min-w-0">
            {isLoading || !dashboard ? (
              <PanelShell title="Loading control layer" subtitle="Gathering live business data now." />
            ) : null}

            {!isLoading && dashboard ? (
              <>
                <AdminHelpPanel managedPages={dashboard.managedPages} />

                {tab === 'overview' ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                      {[
                        ['Products', dashboard.counts.products],
                        ['Orders', dashboard.counts.orders],
                        ['Studio Briefs', dashboard.counts.studioBriefs],
                        ['Contacts', dashboard.counts.contactMessages],
                        ['Newsletter', dashboard.counts.newsletterSubscribers],
                        ['Review Queue', dashboard.counts.pendingReviews],
                        ['Signals', dashboard.counts.analyticsEvents],
                      ].map(([label, value]) => (
                        <MetricCard key={label} label={String(label)} value={String(value)} />
                      ))}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                      <PanelShell
                        title="Recent activity"
                        subtitle="The latest movement across orders, Studio, contact, and newsletter."
                      >
                        <div className="space-y-3">
                          {dashboard.activity.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-[1.25rem] border px-4 py-4"
                              style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <div style={{ color: 'var(--tp-heading)' }}>{item.title}</div>
                                  <div
                                    className="mt-1 text-sm"
                                    style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}
                                  >
                                    {item.detail}
                                  </div>
                                </div>
                                <div
                                  className="text-xs"
                                  style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
                                >
                                  {formatDate(item.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </PanelShell>

                      <PanelShell
                        title="Quick actions"
                        subtitle="Move directly into the highest-frequency controls."
                      >
                        <div className="grid gap-3">
                          <button
                            type="button"
                            onClick={() => void runAutomationPass()}
                            disabled={pendingKey === 'automation:operations'}
                            className="rounded-[1.25rem] px-4 py-4 text-left text-sm font-semibold disabled:opacity-60"
                            style={{
                              background: 'var(--tp-accent)',
                              color: 'var(--tp-btn-primary-text)',
                            }}
                          >
                            {pendingKey === 'automation:operations'
                              ? 'Running operations pass...'
                              : 'Run operations pass'}
                          </button>
                          {automationMessage ? (
                            <div
                              className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7"
                              style={{
                                borderColor: 'var(--tp-border)',
                                background: 'var(--tp-card)',
                                color: 'var(--tp-heading)',
                              }}
                            >
                              {automationMessage}
                            </div>
                          ) : null}
                          {[
                            ['Add a product', 'products'],
                            ['Review newest order', 'orders'],
                            ['Respond to Studio brief', 'studio'],
                            ['Moderate newest review', 'reviews'],
                            ['Triage support message', 'support'],
                            ['Export newsletter list', 'newsletter'],
                          ].map(([label, nextTab]) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setTab(nextTab as Tab)}
                              className="rounded-[1.25rem] border px-4 py-4 text-left text-sm"
                              style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </PanelShell>
                    </div>

                    <PanelShell
                      title="Recent signals"
                      subtitle="Consent-approved first-party events from the storefront."
                    >
                      {dashboard.analyticsEvents.length ? (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {dashboard.analyticsEvents.map((event) => (
                            <div
                              key={event.id}
                              className="rounded-[1.25rem] border px-4 py-4"
                              style={{
                                borderColor: 'var(--tp-border)',
                                background: 'var(--tp-card)',
                              }}
                            >
                              <div
                                className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                                style={{ color: 'var(--tp-accent)' }}
                              >
                                {event.eventName.replace(/_/g, ' ')}
                              </div>
                              <div
                                className="mt-2 text-sm"
                                style={{ color: 'var(--tp-heading)' }}
                              >
                                {event.path || 'Path unavailable'}
                              </div>
                              <div
                                className="mt-1 text-xs"
                                style={{
                                  color:
                                    'color-mix(in srgb, var(--tp-text) 68%, transparent 32%)',
                                }}
                              >
                                {event.source || 'direct'} · {event.consentLevel}
                              </div>
                              <div
                                className="mt-3 text-xs"
                                style={{
                                  color:
                                    'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)',
                                }}
                              >
                                {formatDate(event.createdAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="rounded-[1.25rem] border px-4 py-4 text-sm"
                          style={{
                            borderColor: 'var(--tp-border)',
                            background: 'var(--tp-card)',
                            color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)',
                          }}
                        >
                          Signals will appear here as soon as consented storefront activity starts
                          coming through.
                        </div>
                      )}
                    </PanelShell>

                    <PanelShell
                      title="Attribution"
                      subtitle="Order-linked acquisition signals for campaigns, channels, and paid traffic."
                    >
                      {dashboard.orderAttributionSummary.length ? (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {dashboard.orderAttributionSummary.map((entry) => (
                            <div
                              key={`${entry.label}-${entry.medium}`}
                              className="rounded-[1.25rem] border px-4 py-4"
                              style={{
                                borderColor: 'var(--tp-border)',
                                background: 'var(--tp-card)',
                              }}
                            >
                              <div
                                className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                                style={{ color: 'var(--tp-accent)' }}
                              >
                                {entry.medium}
                              </div>
                              <div className="mt-2 text-sm" style={{ color: 'var(--tp-heading)' }}>
                                {entry.label}
                              </div>
                              <div
                                className="mt-2 text-xs"
                                style={{
                                  color:
                                    'color-mix(in srgb, var(--tp-text) 68%, transparent 32%)',
                                }}
                              >
                                {entry.orders} orders · {money(entry.revenue)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="rounded-[1.25rem] border px-4 py-4 text-sm"
                          style={{
                            borderColor: 'var(--tp-border)',
                            background: 'var(--tp-card)',
                            color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)',
                          }}
                        >
                          Orders will surface here once campaign or referral data is attached to
                          checkout activity.
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href="/api/admin/orders?format=csv"
                          className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          style={{
                            background: 'var(--tp-accent)',
                            color: 'var(--tp-btn-primary-text)',
                          }}
                        >
                          Export orders
                        </a>
                        <a
                          href="/api/admin/analytics?format=csv"
                          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          style={{
                            borderColor: 'var(--tp-border)',
                            background: 'var(--tp-card)',
                            color: 'var(--tp-heading)',
                          }}
                        >
                          Export signals
                        </a>
                      </div>
                    </PanelShell>
                  </div>
                ) : null}

                {tab === 'products' ? (
                  <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                    <PanelShell
                      title="Product management"
                      subtitle="Edit the live catalog, review ratings, manage galleries, and keep every product ready for the storefront."
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}>
                          {productQuery.trim()
                            ? `${filteredProducts.length} matching product${filteredProducts.length === 1 ? '' : 's'}`
                            : `${dashboard.products.length} products in the live catalog`}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setProductForm(createDefaultProductForm());
                            setSlugManual(false);
                            setSkuManual(false);
                          }}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                          style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                        >
                          <PackagePlus className="h-4 w-4" />
                          New Product
                        </button>
                      </div>

                      <SearchField
                        value={productQuery}
                        onChange={setProductQuery}
                        placeholder="Search products by name, slug, SKU, category, or size..."
                      />

                      <div className="space-y-3">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="grid gap-4 rounded-[1.5rem] border px-4 py-4 md:grid-cols-[88px_1fr_auto]"
                            style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.image} alt={product.name} className="h-20 w-full rounded-[1rem] object-cover" />
                            <div>
                              <div className="text-lg" style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}>
                                {product.name}
                              </div>
                              <div className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}>
                                {product.slug} · {product.category} · {money(product.price)}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-accent-soft)', color: 'var(--tp-accent)' }}>
                                  {product.gallery.length} image{product.gallery.length === 1 ? '' : 's'}
                                </span>
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {(product.price > 0 ? 'Live pricing' : 'Needs pricing')}
                                </span>
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {product.availableSizes
                                    .map(
                                      (sizeKey) =>
                                        adminAvailableSizeOptions.find(
                                          (option) => option.key === sizeKey
                                        )?.label || sizeKey
                                    )
                                    .join(' / ')}
                                </span>
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {product.modeContent.plant?.price && product.modeContent.pot?.price
                                    ? 'Dual mode'
                                    : 'Single mode'}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {product.visible ? 'Visible' : 'Hidden'}
                                </span>
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {product.available ? 'Available' : 'Unavailable'}
                                </span>
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {product.sku || 'No SKU'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 md:flex-col">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProductId(product.id);
                                  const nextForm = productToForm(product);
                                  setProductForm(nextForm);
                                  setSlugManual(nextForm.slug !== autoSlugForForm(nextForm));
                                  setSkuManual(nextForm.sku !== autoSkuForForm(nextForm));
                                }}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}
                              >
                                <SquarePen className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void updateProductField(product.id, { visible: !product.visible })}
                                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ background: 'var(--tp-surface)', color: 'var(--tp-text)' }}
                              >
                                {product.visible ? 'Hide' : 'Show'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void updateProductField(product.id, { available: !product.available })}
                                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ background: 'var(--tp-surface)', color: 'var(--tp-text)' }}
                              >
                                {product.available ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteProduct(product.id)}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ background: 'color-mix(in srgb, var(--tp-accent) 12%, transparent 88%)', color: 'var(--tp-heading)' }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                        {!filteredProducts.length ? (
                          <div
                            className="rounded-[1.5rem] border px-4 py-5 text-sm"
                            style={{
                              borderColor: 'var(--tp-border)',
                              background: 'var(--tp-card)',
                              color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)',
                            }}
                          >
                            No products match that search yet.
                          </div>
                        ) : null}
                      </div>
                    </PanelShell>

                    <PanelShell
                      title={editingProductId ? 'Edit product' : 'Create product'}
                      subtitle="Use the guided fields below to build a complete storefront record with gallery images, clear pricing, and easier operator defaults."
                    >
                      <div className="grid gap-4">
                        <Field
                          label="Name"
                          value={productForm.name}
                          onChange={(value) =>
                            setProductForm((current) => syncProductForm(current, { name: value }))
                          }
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <SelectField
                            label="Category"
                            value={productForm.category}
                            options={productCategoryOptions}
                            onChange={(value) =>
                              setProductForm((current) =>
                                syncProductForm(current, {
                                  category: value,
                                  availableSizes: normalizeAvailableSizes(undefined, current.size),
                                })
                              )
                            }
                          />
                          <SelectField
                            label="Size Profile"
                            value={productForm.size}
                            options={productSizeProfileOptions}
                            onChange={(value) =>
                              setProductForm((current) =>
                                syncProductForm(current, {
                                  size: value,
                                  availableSizes: normalizeAvailableSizes(undefined, value),
                                })
                              )
                            }
                          />
                        </div>

                        <div
                          className="rounded-[1.25rem] border px-4 py-4"
                          style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}
                        >
                          <div
                            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                            style={{ color: 'var(--tp-accent)' }}
                          >
                            Available sizes
                          </div>
                          <div
                            className="mt-2 text-sm leading-7"
                            style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}
                          >
                            Check only the sizes customers should be able to choose on the product page.
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(productForm.size === 'sets'
                              ? adminAvailableSizeOptions.filter((option) => option.key === 'set')
                              : adminAvailableSizeOptions.filter((option) => option.key !== 'set')
                            ).map((option) => {
                              const isSelected = productForm.availableSizes.includes(option.key);

                              return (
                                <button
                                  key={option.key}
                                  type="button"
                                  onClick={() =>
                                    setProductForm((current) => {
                                      const nextSelected = current.availableSizes.includes(option.key)
                                        ? current.availableSizes.filter((size) => size !== option.key)
                                        : [...current.availableSizes, option.key];

                                      if (!nextSelected.length) {
                                        return current;
                                      }

                                      return syncProductForm(current, {
                                        availableSizes: nextSelected,
                                      });
                                    })
                                  }
                                  className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                  style={{
                                    background: isSelected ? 'var(--tp-accent)' : 'var(--tp-card)',
                                    color: isSelected
                                      ? 'var(--tp-btn-primary-text)'
                                      : 'var(--tp-heading)',
                                    border: isSelected ? 'none' : '1px solid var(--tp-border)',
                                  }}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span
                                className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
                                style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
                              >
                                Slug
                              </span>
                              <div className="flex items-center gap-2">
                                <span
                                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                                  style={{
                                    background: slugManual ? 'var(--tp-surface)' : 'var(--tp-accent-soft)',
                                    color: slugManual ? 'var(--tp-heading)' : 'var(--tp-accent)',
                                  }}
                                >
                                  {slugManual ? 'Custom' : 'Auto'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSlugManual(false);
                                    setProductForm((current) => ({ ...current, slug: autoSlugForForm(current) }));
                                  }}
                                  className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                                  style={{
                                    borderColor: 'var(--tp-border)',
                                    background: 'var(--tp-card)',
                                    color: 'var(--tp-heading)',
                                  }}
                                >
                                  Use auto
                                </button>
                              </div>
                            </div>
                            <input
                              value={productForm.slug}
                              onChange={(event) => {
                                setSlugManual(true);
                                setProductForm((current) => ({ ...current, slug: event.target.value }));
                              }}
                              className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                              style={{
                                borderColor: 'var(--tp-border)',
                                background: 'var(--tp-card)',
                                color: 'var(--tp-heading)',
                              }}
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span
                                className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
                                style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
                              >
                                SKU
                              </span>
                              <div className="flex items-center gap-2">
                                <span
                                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                                  style={{
                                    background: skuManual ? 'var(--tp-surface)' : 'var(--tp-accent-soft)',
                                    color: skuManual ? 'var(--tp-heading)' : 'var(--tp-accent)',
                                  }}
                                >
                                  {skuManual ? 'Custom' : 'Auto'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSkuManual(false);
                                    setProductForm((current) => ({ ...current, sku: autoSkuForForm(current) }));
                                  }}
                                  className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                                  style={{
                                    borderColor: 'var(--tp-border)',
                                    background: 'var(--tp-card)',
                                    color: 'var(--tp-heading)',
                                  }}
                                >
                                  Use auto
                                </button>
                              </div>
                            </div>
                            <input
                              value={productForm.sku}
                              onChange={(event) => {
                                setSkuManual(true);
                                setProductForm((current) => ({ ...current, sku: event.target.value }));
                              }}
                              className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
                              style={{
                                borderColor: 'var(--tp-border)',
                                background: 'var(--tp-card)',
                                color: 'var(--tp-heading)',
                              }}
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <SelectField
                            label="Badge"
                            value={productForm.badge}
                            options={productBadgeOptions.map((item) => ({
                              value: item,
                              label: item || 'No badge',
                            }))}
                            onChange={(value) =>
                              setProductForm((current) => ({ ...current, badge: value }))
                            }
                          />
                        </div>

                        <div
                          className="rounded-[1.25rem] border px-4 py-4 text-sm"
                          style={{
                            borderColor: 'var(--tp-border)',
                            background: 'var(--tp-surface)',
                            color: 'var(--tp-text)',
                          }}
                        >
                          Slug and SKU now fill themselves from the product name, category, and
                          size profile. If the operator needs a custom version, they can type over
                          it and the field stays in custom mode until “Use auto” is selected
                          again. The presentation editor below controls what customers see for
                          Placed with Plant, Clay Form, and each size image swap.
                        </div>

                        <ProductVariantEditor
                          category={productForm.category}
                          forcePotOnly={productForm.forcePotOnly}
                          availableSizes={productForm.availableSizes}
                          modeContent={productForm.modeContent}
                          onChange={(modeContent) =>
                            setProductForm((current) =>
                              syncProductForm(current, {
                                modeContent,
                              })
                            )
                          }
                          disabled={pendingKey === 'save-product'}
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                          <ToggleRow
                            label="Visible on storefront"
                            checked={productForm.visible}
                            onChange={(checked) =>
                              setProductForm((current) => ({ ...current, visible: checked }))
                            }
                          />
                          <ToggleRow
                            label="Available to order"
                            checked={productForm.available}
                            onChange={(checked) =>
                              setProductForm((current) => ({ ...current, available: checked }))
                            }
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => void saveProduct()}
                            disabled={pendingKey === 'save-product'}
                            className="inline-flex min-h-[50px] items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
                            style={{ background: 'var(--tp-accent)', color: '#ffffff' }}
                          >
                            {pendingKey === 'save-product' ? 'Saving…' : editingProductId ? 'Update Product' : 'Create Product'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(null);
                              setProductForm(createDefaultProductForm());
                              setSlugManual(false);
                              setSkuManual(false);
                            }}
                            className="inline-flex min-h-[50px] items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.18em]"
                            style={{ background: 'var(--tp-surface)', color: 'var(--tp-heading)', border: '1px solid var(--tp-border)' }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </PanelShell>
                  </div>
                ) : null}

                {tab === 'orders' ? (
                  <div className="grid gap-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                      <SearchField
                        value={orderQuery}
                        onChange={setOrderQuery}
                        placeholder="Search orders by order number, customer, email, city, source, or tracking code..."
                      />
                      <SelectField
                        label="Status filter"
                        value={orderStatusFilter}
                        options={[
                          { value: 'all', label: 'All statuses' },
                          ...orderStatusOptions.map((status) => ({
                            value: status,
                            label: status,
                          })),
                        ]}
                        onChange={setOrderStatusFilter}
                      />
                    </div>
                    <SplitPanel
                      title="Order management"
                      subtitle="Review live orders and move each one through fulfillment."
                      list={filteredOrders.map((order) => ({
                        id: order.id,
                        title: order.orderNumber,
                        body: `${order.customerName} · ${money(order.totalAmount)} · ${order.status}`,
                        meta: formatDate(order.createdAt),
                      }))}
                      selectedId={selectedOrderId}
                      onSelect={setSelectedOrderId}
                      detail={
                        selectedOrder ? (
                          <div className="space-y-5">
                          <DetailIntro title={selectedOrder.orderNumber} subtitle={`${selectedOrder.customerName} · ${selectedOrder.customerEmail}`} />
                          <div className="flex flex-wrap gap-3">
                            <a
                              href="/api/admin/orders?format=csv"
                              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                              style={{
                                background: 'var(--tp-accent)',
                                color: 'var(--tp-btn-primary-text)',
                              }}
                            >
                              Export orders
                            </a>
                            <a
                              href="/api/admin/analytics?format=csv"
                              className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                              style={{
                                borderColor: 'var(--tp-border)',
                                background: 'var(--tp-card)',
                                color: 'var(--tp-heading)',
                              }}
                            >
                              Export signals
                            </a>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <DetailStat label="Status" value={selectedOrder.status} />
                            <DetailStat label="Payment" value={selectedOrder.paymentMethod} />
                            <DetailStat label="Total" value={money(selectedOrder.totalAmount)} />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <DetailStat
                              label="Delivery expectation"
                              value={
                                selectedOrder.estimatedDeliveryAt
                                  ? `${selectedOrder.isCustomOrder ? '21 days' : '2 days'} · ${formatDate(selectedOrder.estimatedDeliveryAt)}`
                                  : 'Pending'
                              }
                            />
                            <DetailStat label="Tracking code" value={selectedOrder.trackingCode} />
                          </div>
                          <ToggleRow
                            label="Custom order timeline"
                            checked={orderIsCustom}
                            onChange={setOrderIsCustom}
                          />
                          <div className="grid gap-4 md:grid-cols-2">
                            <DetailStat
                              label="Source"
                              value={
                                selectedOrder.attribution.campaign ||
                                selectedOrder.attribution.source ||
                                'Direct / Unattributed'
                              }
                            />
                            <DetailStat
                              label="Channel"
                              value={
                                selectedOrder.attribution.medium ||
                                (selectedOrder.attribution.gclid
                                  ? 'cpc'
                                  : selectedOrder.attribution.fbclid
                                    ? 'paid-social'
                                    : 'direct')
                              }
                            />
                          </div>
                          {selectedOrder.attribution.landingPath ? (
                            <div
                              className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7"
                              style={{
                                borderColor: 'var(--tp-border)',
                                background: 'var(--tp-card)',
                                color: 'var(--tp-heading)',
                              }}
                            >
                              <div
                                className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                                style={{ color: 'var(--tp-accent)' }}
                              >
                                Landing path
                              </div>
                              <div className="mt-2 break-all">{selectedOrder.attribution.landingPath}</div>
                            </div>
                          ) : null}
                          {!!selectedOrder.trackingTimeline.length ? (
                            <div className="rounded-[1.25rem] border p-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--tp-accent)' }}>
                                Tracking timeline
                              </div>
                              <div className="mt-3 space-y-3">
                                {selectedOrder.trackingTimeline.map((entry: any, index: number) => (
                                  <div key={`${entry.createdAt}-${index}`} className="rounded-[1rem] bg-[var(--tp-surface)] px-4 py-3">
                                    <div className="text-sm font-medium tp-heading">{entry.label}</div>
                                    <div className="mt-1 text-sm tp-text-soft">{entry.detail}</div>
                                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] tp-text-muted">
                                      {formatDate(entry.createdAt)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {!!selectedOrder.notificationLog.length ? (
                            <div className="rounded-[1.25rem] border p-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--tp-accent)' }}>
                                Notification queue
                              </div>
                              <div className="mt-3 space-y-3">
                                {selectedOrder.notificationLog.slice(-6).reverse().map((entry: any, index: number) => (
                                  <div key={`${entry.createdAt}-${index}`} className="rounded-[1rem] bg-[var(--tp-surface)] px-4 py-3">
                                    <div className="text-sm font-medium tp-heading">
                                      {entry.channel} · {entry.subject}
                                    </div>
                                    <div className="mt-1 text-sm tp-text-soft">{entry.detail}</div>
                                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] tp-text-muted">
                                      {entry.status} · {entry.target || 'No target'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          <div className="space-y-3">
                            {selectedOrder.items.map((item) => (
                              <div key={item.id} className="rounded-[1.25rem] border px-4 py-3" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                                {item.name} · {item.quantity} · {money(item.lineTotal)}
                              </div>
                            ))}
                          </div>
                          <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}>
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <textarea value={orderNotes} onChange={(event) => setOrderNotes(event.target.value)} rows={5} placeholder="Internal notes for production, delivery, or follow-up" className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }} />
                          <button type="button" onClick={() => void saveOrder()} disabled={pendingKey === `order:${selectedOrder.id}`} className="rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-60" style={{ background: 'var(--tp-accent)', color: '#ffffff' }}>
                            {pendingKey === `order:${selectedOrder.id}` ? 'Saving…' : 'Save Order'}
                          </button>
                          </div>
                        ) : null
                      }
                    />
                  </div>
                ) : null}

                {tab === 'studio' ? (
                  <SplitPanel
                    title="Studio brief management"
                    subtitle="Move custom briefs from receipt to response, with internal notes."
                    list={dashboard.studioBriefs.map((brief) => ({
                      id: brief.id,
                      title: brief.referenceCode,
                      body: `${brief.helpType} · ${brief.space} · ${brief.status}`,
                      meta: formatDate(brief.createdAt),
                    }))}
                    selectedId={selectedBriefId}
                    onSelect={setSelectedBriefId}
                    detail={
                      selectedBrief ? (
                        <div className="space-y-5">
                          <DetailIntro title={selectedBrief.referenceCode} subtitle={`${selectedBrief.helpType} · ${selectedBrief.space}`} />
                          <div className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                            {selectedBrief.summary}
                          </div>
                          <select value={briefStatus} onChange={(event) => setBriefStatus(event.target.value)} className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}>
                            {studioStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <textarea value={briefNotes} onChange={(event) => setBriefNotes(event.target.value)} rows={6} placeholder="Internal notes, response framing, sourcing ideas, or next actions" className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }} />
                          <button type="button" onClick={() => void saveBrief()} disabled={pendingKey === `brief:${selectedBrief.id}`} className="rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-60" style={{ background: 'var(--tp-accent)', color: '#ffffff' }}>
                            {pendingKey === `brief:${selectedBrief.id}` ? 'Saving…' : 'Save Brief'}
                          </button>
                        </div>
                      ) : null
                    }
                  />
                ) : null}

                {tab === 'reviews' ? (
                  <SplitPanel
                    title="Review moderation"
                    subtitle="Approve customer feedback, feature standout testimonials, and keep product trust signals current."
                    list={dashboard.reviews.map((review) => ({
                      id: review.id,
                      title: `${review.name} · ${review.product.name}`,
                      body: `${review.rating} stars · ${review.approved ? 'Approved' : 'Pending moderation'}${review.featured ? ' · Featured' : ''}`,
                      meta: formatDate(review.createdAt),
                    }))}
                    selectedId={selectedReviewId}
                    onSelect={setSelectedReviewId}
                    detail={
                      selectedReview ? (
                        <div className="space-y-5">
                          <DetailIntro
                            title={selectedReview.name}
                            subtitle={`${selectedReview.product.name} · ${selectedReview.rating} stars`}
                          />
                          <div className="grid gap-4 md:grid-cols-3">
                            <DetailStat
                              label="Status"
                              value={
                                selectedReview.approved ? 'Approved' : 'Pending moderation'
                              }
                            />
                            <DetailStat
                              label="Feature"
                              value={selectedReview.featured ? 'Featured' : 'Standard'}
                            />
                            <DetailStat
                              label="Created"
                              value={formatDate(selectedReview.createdAt)}
                            />
                          </div>
                          <div
                            className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7"
                            style={{
                              borderColor: 'var(--tp-border)',
                              background: 'var(--tp-card)',
                            }}
                          >
                            {selectedReview.body}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                void updateReview(selectedReview.id, {
                                  approved: true,
                                })
                              }
                              disabled={pendingKey === `review:${selectedReview.id}`}
                              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                              style={{
                                background: selectedReview.approved
                                  ? 'var(--tp-accent)'
                                  : 'var(--tp-surface)',
                                color: selectedReview.approved ? '#ffffff' : 'var(--tp-heading)',
                              }}
                            >
                              {selectedReview.approved ? 'Approved' : 'Approve Review'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void updateReview(selectedReview.id, {
                                  approved: false,
                                  featured: false,
                                })
                              }
                              disabled={pendingKey === `review:${selectedReview.id}`}
                              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                              style={{
                                background: !selectedReview.approved
                                  ? 'var(--tp-accent)'
                                  : 'var(--tp-surface)',
                                color: !selectedReview.approved
                                  ? '#ffffff'
                                  : 'var(--tp-heading)',
                              }}
                            >
                              Hold Back
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void updateReview(selectedReview.id, {
                                  approved: true,
                                  featured: !selectedReview.featured,
                                })
                              }
                              disabled={pendingKey === `review:${selectedReview.id}`}
                              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                              style={{
                                background: selectedReview.featured
                                  ? 'var(--tp-accent)'
                                  : 'var(--tp-surface)',
                                color: selectedReview.featured
                                  ? '#ffffff'
                                  : 'var(--tp-heading)',
                              }}
                            >
                              {selectedReview.featured ? 'Remove Feature' : 'Feature Review'}
                            </button>
                            <Link
                              href={`/product/${selectedReview.product.slug}`}
                              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                              style={{
                                background: 'transparent',
                                color: 'var(--tp-heading)',
                                border: '1px solid var(--tp-border)',
                              }}
                            >
                              Open Product
                            </Link>
                          </div>
                          <div
                            className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7"
                            style={{
                              borderColor: 'var(--tp-border)',
                              background: 'var(--tp-surface)',
                              color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)',
                            }}
                          >
                            Featured reviews appear first on the product page. Unapproved reviews
                            stay hidden from the storefront until they are approved.
                          </div>
                        </div>
                      ) : null
                    }
                  />
                ) : null}

                {tab === 'support' ? (
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <MetricCard label="Open threads" value={String(dashboard.supportThreads.filter((thread) => thread.status !== 'RESOLVED').length)} />
                      <MetricCard label="Delivery follow-ups" value={String(dashboard.supportThreads.filter((thread) => thread.order && ['PAID', 'PROCESSING', 'SHIPPED'].includes(thread.order.status)).length)} />
                      <MetricCard label="Pending delivery stops" value={String(dashboard.deliverySummary.pending)} />
                    </div>
                    <SearchField
                      value={supportQuery}
                      onChange={setSupportQuery}
                      placeholder="Search by customer, source, order number, location, status, or summary..."
                    />
                    <SplitPanel
                      title="Support threads"
                      subtitle="Manage customer help, delivery follow-up, studio requests, and chatbot escalations in one place."
                      list={filteredSupportThreads.map((thread) => ({
                        id: thread.id,
                        title:
                          thread.customerName ||
                          thread.customerEmail ||
                          thread.order?.orderNumber ||
                          'Support thread',
                        body: `${thread.source.replaceAll('_', ' ')} · ${thread.status} · ${thread.priority}`,
                        meta: thread.order
                          ? `${thread.order.orderNumber} · ${thread.order.shippingCity || 'Location pending'}`
                          : formatDate(thread.updatedAt),
                      }))}
                      selectedId={selectedSupportThreadId}
                      onSelect={setSelectedSupportThreadId}
                      detail={
                        selectedSupportThread ? (
                          <div className="space-y-5">
                            <DetailIntro
                              title={
                                selectedSupportThread.customerName ||
                                selectedSupportThread.customerEmail ||
                                selectedSupportThread.order?.orderNumber ||
                                'Support thread'
                              }
                              subtitle={`${selectedSupportThread.source.replaceAll('_', ' ')} · ${selectedSupportThread.status} · ${selectedSupportThread.priority}`}
                            />
                            <div className="grid gap-3 md:grid-cols-2">
                              <DetailStat
                                label="Contact"
                                value={
                                  selectedSupportThread.customerEmail ||
                                  selectedSupportThread.customerPhone ||
                                  'No direct contact saved'
                                }
                              />
                              <DetailStat
                                label="Delivery"
                                value={
                                  selectedSupportThread.order
                                    ? `${selectedSupportThread.order.orderNumber} · ${selectedSupportThread.order.shippingCity || 'Location pending'}`
                                    : 'No linked order'
                                }
                              />
                            </div>
                            {selectedSupportThread.latestSummary ? (
                              <div className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-accent">
                                  Suggested next step
                                </div>
                                <div className="mt-2">
                                  {selectedSupportThread.latestSummary.shortSummary}
                                </div>
                                {selectedSupportThread.latestSummary.suggestedNextStep ? (
                                  <div className="mt-3 tp-text-soft">
                                    {selectedSupportThread.latestSummary.suggestedNextStep}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                            {selectedSupportThread.latestMessage ? (
                              <div className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                                {selectedSupportThread.latestMessage.body}
                              </div>
                            ) : null}
                            <div className="grid gap-4 md:grid-cols-2">
                              <SelectField
                                label="Thread status"
                                value={supportStatus}
                                options={supportStatusOptions.map((status) => ({
                                  value: status,
                                  label: status,
                                }))}
                                onChange={setSupportStatus}
                                disabled={!dashboard.adminAccess.permissions.includes('support.manage')}
                              />
                              <SelectField
                                label="Priority"
                                value={supportPriority}
                                options={supportPriorityOptions.map((priority) => ({
                                  value: priority,
                                  label: priority,
                                }))}
                                onChange={setSupportPriority}
                                disabled={!dashboard.adminAccess.permissions.includes('support.manage')}
                              />
                            </div>
                            <Field
                              label="Admin note"
                              value={supportNote}
                              onChange={setSupportNote}
                              multiline
                              disabled={!dashboard.adminAccess.permissions.includes('support.manage')}
                            />
                            {dashboard.adminAccess.permissions.includes('support.manage') ? (
                              <button
                                type="button"
                                onClick={() => void saveSupportThread()}
                                disabled={pendingKey === `support:${selectedSupportThread.id}`}
                                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                                style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                              >
                                {pendingKey === `support:${selectedSupportThread.id}` ? 'Saving…' : 'Save support thread'}
                              </button>
                            ) : null}
                          </div>
                        ) : null
                      }
                    />
                  </div>
                ) : null}

                {tab === 'automation' ? (
                  <div className="grid gap-4">
                    <PanelShell
                      title="Automation queue"
                      subtitle="Queued operational work, delivery follow-ups, and customer notifications waiting to run."
                    >
                      <div className="grid gap-4 md:grid-cols-3">
                        <MetricCard
                          label="Pending jobs"
                          value={String(
                            dashboard.automationJobs.filter((job) => job.status === 'PENDING').length
                          )}
                        />
                        <MetricCard
                          label="Failed jobs"
                          value={String(
                            dashboard.automationJobs.filter((job) => job.status === 'FAILED').length
                          )}
                        />
                        <MetricCard
                          label="Pending delivery"
                          value={String(dashboard.deliverySummary.pending)}
                        />
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void runAutomationPass()}
                          disabled={pendingKey === 'automation:operations'}
                          className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                          style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                        >
                          {pendingKey === 'automation:operations' ? 'Running…' : 'Run automation pass'}
                        </button>
                      </div>
                      <div className="mt-6 grid gap-3">
                        {dashboard.automationJobs.slice(0, 12).map((job) => (
                          <div
                            key={job.id}
                            className="rounded-[1.25rem] border px-4 py-4"
                            style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold" style={{ color: 'var(--tp-heading)' }}>
                                  {job.type.replaceAll('_', ' ')}
                                </div>
                                <div className="mt-1 text-xs tp-text-soft">
                                  Run {formatDate(job.runAt)} · Attempts {job.attempts}
                                </div>
                              </div>
                              <span
                                className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                                style={{
                                  background:
                                    job.status === 'FAILED'
                                      ? 'color-mix(in srgb, var(--tp-accent) 12%, var(--tp-card) 88%)'
                                      : 'var(--tp-surface)',
                                  color: job.status === 'FAILED' ? 'var(--tp-accent)' : 'var(--tp-heading)',
                                }}
                              >
                                {job.status}
                              </span>
                            </div>
                            {job.lastError ? (
                              <div className="mt-3 text-sm leading-6" style={{ color: 'var(--tp-accent)' }}>
                                {job.lastError}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </PanelShell>
                  </div>
                ) : null}

                {tab === 'security' ? (
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <MetricCard label="Admin accounts" value={String(dashboard.adminUsers.length)} />
                      <MetricCard
                        label="Security events"
                        value={String(dashboard.securityEvents.length)}
                      />
                      <MetricCard
                        label="Pending deliveries"
                        value={String(dashboard.deliverySummary.pending)}
                      />
                    </div>
                    <SplitPanel
                      title="Security activity"
                      subtitle="Recent access, rate-limit, and permission events across the website."
                      list={dashboard.securityEvents.map((event) => ({
                        id: event.id,
                        title: `${event.type.replaceAll('_', ' ')} · ${event.severity}`,
                        body: event.route || event.identifier || 'Website event',
                        meta: formatDate(event.createdAt),
                      }))}
                      selectedId={selectedSecurityEventId}
                      onSelect={setSelectedSecurityEventId}
                      detail={
                        <div className="space-y-4">
                          <PanelShell
                            title="Selected event"
                            subtitle="Review what happened before changing permissions or roles."
                          >
                            {selectedSecurityEvent ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                <DetailStat
                                  label="Event"
                                  value={`${selectedSecurityEvent.type.replaceAll('_', ' ')} · ${selectedSecurityEvent.severity}`}
                                />
                                <DetailStat
                                  label="When"
                                  value={formatDate(selectedSecurityEvent.createdAt)}
                                />
                                <DetailStat
                                  label="Route"
                                  value={selectedSecurityEvent.route || 'Route not recorded'}
                                />
                                <DetailStat
                                  label="Identifier"
                                  value={selectedSecurityEvent.identifier || 'No identifier recorded'}
                                />
                              </div>
                            ) : (
                              <div className="text-sm tp-text-soft">
                                No security event is selected yet.
                              </div>
                            )}
                          </PanelShell>
                          <PanelShell
                            title="Role access"
                            subtitle="Every admin account now carries an explicit operational role."
                          >
                            <div className="grid gap-3">
                              {dashboard.adminUsers.map((adminUser) => (
                                <div
                                  key={adminUser.id}
                                  className="rounded-[1.25rem] border px-4 py-4"
                                  style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <div className="text-sm font-semibold" style={{ color: 'var(--tp-heading)' }}>
                                        {adminUser.name || adminUser.email || 'Admin account'}
                                      </div>
                                      <div className="mt-1 text-xs tp-text-soft">{adminUser.email}</div>
                                    </div>
                                    <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}>
                                      {adminUser.role.replaceAll('_', ' ')}
                                    </span>
                                  </div>
                                  <div className="mt-3 text-xs tp-text-soft">
                                    Last sign-in {adminUser.lastSignInAt ? formatDate(adminUser.lastSignInAt) : 'not yet'}
                                  </div>
                                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                                    <SelectField
                                      label="Admin role"
                                      value={adminRoleDrafts[adminUser.id] || adminUser.role}
                                      options={adminRoleOptions.map((role) => ({
                                        value: role,
                                        label: role.replaceAll('_', ' '),
                                      }))}
                                      onChange={(value) =>
                                        setAdminRoleDrafts((current) => ({
                                          ...current,
                                          [adminUser.id]: value,
                                        }))
                                      }
                                      disabled={!dashboard.adminAccess.permissions.includes('roles.manage')}
                                    />
                                    {dashboard.adminAccess.permissions.includes('roles.manage') ? (
                                      <button
                                        type="button"
                                        onClick={() => void updateAdminRole(adminUser.id)}
                                        disabled={
                                          pendingKey === `role:${adminUser.id}` ||
                                          (adminRoleDrafts[adminUser.id] || adminUser.role) === adminUser.role
                                        }
                                        className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                                        style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                                      >
                                        {pendingKey === `role:${adminUser.id}` ? 'Saving…' : 'Save role'}
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </PanelShell>
                        </div>
                      }
                    />
                  </div>
                ) : null}

                {tab === 'newsletter' ? (
                  <PanelShell title="Newsletter list" subtitle="People who asked to hear from TuloPots, along with the channels and interests they chose.">
                    <div
                      className="mb-4 rounded-[1.5rem] border p-5"
                      style={{
                        borderColor: 'var(--tp-border)',
                        background: 'var(--tp-card)',
                      }}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div
                            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                            style={{ color: 'var(--tp-accent)' }}
                          >
                            Email marketing
                          </div>
                          <div className="mt-2 text-lg font-semibold" style={{ color: 'var(--tp-heading)' }}>
                            {dashboard.newsletterMarketing.enabled
                              ? 'HubSpot is connected to newsletter signups'
                              : 'HubSpot is not connected yet'}
                          </div>
                          <div className="mt-2 text-sm leading-7 tp-text-soft">
                            TuloPots keeps the signup form on-site, then HubSpot becomes the place where
                            you build, segment, and send newsletters.
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                            <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                              provider: {dashboard.newsletterMarketing.provider}
                            </span>
                            <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                              list: {dashboard.newsletterMarketing.hasListId ? 'connected' : 'not set'}
                            </span>
                            {dashboard.newsletterMarketing.portalId ? (
                              <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                portal: {dashboard.newsletterMarketing.portalId}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            href="/admin/newsletter"
                            className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{
                              borderColor: 'var(--tp-border)',
                              background: 'var(--tp-card)',
                              color: 'var(--tp-heading)',
                            }}
                          >
                            Newsletter page
                          </Link>
                          <button
                            type="button"
                            onClick={() => void syncNewsletterToHubSpot()}
                            disabled={
                              pendingKey === 'newsletter:sync' ||
                              !dashboard.newsletterMarketing.enabled
                            }
                            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                            style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                          >
                            {pendingKey === 'newsletter:sync' ? 'Syncing…' : 'Sync to HubSpot'}
                          </button>
                          <a
                            href={dashboard.newsletterMarketing.manageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{
                              borderColor: 'var(--tp-border)',
                              background: 'var(--tp-card)',
                              color: 'var(--tp-heading)',
                            }}
                          >
                            Open email builder
                          </a>
                          <a
                            href={dashboard.newsletterMarketing.listsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{
                              borderColor: 'var(--tp-border)',
                              background: 'var(--tp-card)',
                              color: 'var(--tp-heading)',
                            }}
                          >
                            Open lists
                          </a>
                        </div>
                      </div>

                      {!dashboard.newsletterMarketing.enabled ? (
                        <div className="mt-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4 text-sm leading-7 tp-text-soft">
                          Add `HUBSPOT_PRIVATE_APP_TOKEN` first, then optionally add
                          `HUBSPOT_NEWSLETTER_LIST_ID`, `HUBSPOT_PORTAL_ID`, and `HUBSPOT_APP_BASE_URL`
                          in Vercel environment variables.
                        </div>
                      ) : null}

                      {newsletterSyncMessage ? (
                        <div className="mt-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4 text-sm" style={{ color: 'var(--tp-heading)' }}>
                          {newsletterSyncMessage}
                        </div>
                      ) : null}
                    </div>

                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}>
                        {newsletterQuery.trim()
                          ? `${filteredNewsletterSubscribers.length} matching subscriber${filteredNewsletterSubscribers.length === 1 ? '' : 's'}`
                          : `${dashboard.newsletterSubscribers.length} subscribers`}
                      </div>
                      <a href="/api/admin/newsletter?format=csv" className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}>
                        Export CSV
                      </a>
                    </div>

                    <SearchField
                      value={newsletterQuery}
                      onChange={setNewsletterQuery}
                      placeholder="Search subscribers by name, email, channel, source, or interest..."
                    />

                    <div className="space-y-3">
                      {filteredNewsletterSubscribers.map((subscriber) => (
                        <div key={subscriber.id} className="flex flex-col gap-3 rounded-[1.25rem] border px-4 py-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                          <div>
                            <div style={{ color: 'var(--tp-heading)' }}>
                              {subscriber.name || 'Newsletter subscriber'}
                            </div>
                            <div className="mt-1 text-sm tp-text-soft">{subscriber.email}</div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                              <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                {subscriber.preferredChannel || 'email'}
                              </span>
                              {subscriber.source ? (
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {subscriber.source}
                                </span>
                              ) : null}
                              {subscriber.interests.map((interest) => (
                                <span key={interest} className="rounded-full px-3 py-1" style={{ background: 'var(--tp-accent-soft)', color: 'var(--tp-accent)' }}>
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}>
                            {formatDate(subscriber.createdAt)}
                          </div>
                        </div>
                      ))}
                      {!filteredNewsletterSubscribers.length ? (
                        <div
                          className="rounded-[1.25rem] border px-4 py-4 text-sm"
                          style={{
                            borderColor: 'var(--tp-border)',
                            background: 'var(--tp-card)',
                            color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)',
                          }}
                        >
                          No subscribers match that search.
                        </div>
                      ) : null}
                    </div>
                  </PanelShell>
                ) : null}

                {tab === 'content' ? (
                  <div className="space-y-6">
                    <PanelShell
                      title="Content visibility"
                      subtitle="Toggle major storefront sections on and off from the database."
                    >
                      <div className="grid gap-3">
                        {dashboard.siteSections.map((section) => (
                          <div key={section.id} className="flex items-center justify-between gap-4 rounded-[1.25rem] border px-4 py-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                            <div>
                              <div style={{ color: 'var(--tp-heading)' }}>{section.label}</div>
                              <div className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}>
                                {section.key}
                                {section.route ? ` · ${section.route}` : ''}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void toggleSection(section.key, !section.visible)}
                              disabled={pendingKey === `section:${section.key}`}
                              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                              style={{
                                background: section.visible ? 'var(--tp-accent)' : 'var(--tp-surface)',
                                color: section.visible ? '#ffffff' : 'var(--tp-heading)',
                              }}
                            >
                              {section.visible ? 'Visible' : 'Hidden'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </PanelShell>

                    <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                      <PanelShell
                        title="Managed pages"
                        subtitle="Choose a page, then open the structured content workspace to update text, images, and repeated sections without touching code."
                      >
                        <div className="mb-4 flex flex-wrap gap-3">
                          <Link
                            href="/admin/content"
                            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                          >
                            Open Content Workspace
                          </Link>
                          <Link
                            href="/admin/newsletter"
                            className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                          >
                            Newsletter Workspace
                          </Link>
                        </div>

                        <div className="space-y-3">
                          {dashboard.managedPages.map((page) => {
                            const isSelected = selectedManagedPageKey === page.key;

                            return (
                              <button
                                key={page.key}
                                type="button"
                                onClick={() => {
                                  setSelectedManagedPageKey(page.key);
                                  setManagedPageMessage('');
                                  setError('');
                                }}
                                className="w-full rounded-[1.25rem] border px-4 py-4 text-left"
                                style={{
                                  borderColor: isSelected
                                    ? 'color-mix(in srgb, var(--tp-accent) 42%, transparent 58%)'
                                    : 'var(--tp-border)',
                                  background: isSelected
                                    ? 'color-mix(in srgb, var(--tp-accent) 10%, var(--tp-card) 90%)'
                                    : 'var(--tp-card)',
                                }}
                              >
                                <div style={{ color: 'var(--tp-heading)' }}>{page.label}</div>
                                <div className="mt-1 text-sm tp-text-soft">{page.route}</div>
                                <div className="mt-2 text-xs tp-text-muted">
                                  {page.updatedAt ? `Updated ${formatDate(page.updatedAt)}` : 'Using default content'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </PanelShell>

                      <PanelShell
                        title="Page editor"
                        subtitle="Use the dedicated content workspace for clean text fields, image uploads, and section-by-section editing."
                      >
                        {selectedManagedPage ? (
                          <div className="space-y-4">
                            <div className="rounded-[1.25rem] border px-4 py-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <div style={{ color: 'var(--tp-heading)' }}>{selectedManagedPage.label}</div>
                                  <div className="mt-1 text-sm tp-text-soft">{selectedManagedPage.description}</div>
                                  <div className="mt-2 text-xs tp-text-muted">{selectedManagedPage.route}</div>
                                </div>
                                <a
                                  href={selectedManagedPage.route}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                  style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}
                                >
                                  Preview page
                                </a>
                              </div>
                            </div>

                            <div className="rounded-[1.25rem] border px-4 py-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--tp-accent)' }}>
                                Editing tips
                              </div>
                              <div className="mt-3 space-y-2 text-sm leading-7 tp-text-soft">
                                {selectedManagedPage.tips.map((tip) => (
                                  <div key={tip}>{tip}</div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-[1.25rem] border px-4 py-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}>
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--tp-accent)' }}>
                                Workspace note
                              </div>
                              <div className="mt-3 text-sm leading-7 tp-text-soft">
                                Edit this page with normal text fields, section cards, and image upload controls in the Content Workspace. Changes there save directly to the live page without needing JSON or code.
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Link
                                href="/admin/content"
                                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                              >
                                Open Content Workspace
                              </Link>
                              <Link
                                href="/admin/newsletter"
                                className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                              >
                                Open Newsletter Workspace
                              </Link>
                            </div>

                            {managedPageMessage ? (
                              <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4 text-sm" style={{ color: 'var(--tp-heading)' }}>
                                {managedPageMessage}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="rounded-[1.25rem] border px-4 py-4 text-sm tp-text-soft" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                            Choose a page from the list to start editing.
                          </div>
                        )}
                      </PanelShell>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function PanelShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[2rem] border p-6 md:p-7"
      style={{
        background: 'color-mix(in srgb, var(--tp-surface) 90%, black 10%)',
        borderColor: 'color-mix(in srgb, var(--tp-border) 68%, transparent 32%)',
      }}
    >
      <div className="mb-5">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'var(--tp-accent)' }}
        >
          {title}
        </div>
        <div
          className="mt-2 text-sm leading-7"
          style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}
        >
          {subtitle}
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[1.5rem] border px-5 py-5"
      style={{
        background: 'color-mix(in srgb, var(--tp-surface) 90%, black 10%)',
        borderColor: 'color-mix(in srgb, var(--tp-border) 68%, transparent 32%)',
      }}
    >
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
      >
        {label}
      </div>
      <div
        className="mt-3 text-4xl"
        style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
      >
        {value}
      </div>
    </div>
  );
}

function SplitPanel({
  title,
  subtitle,
  list,
  selectedId,
  onSelect,
  detail,
}: {
  title: string;
  subtitle: string;
  list: Array<{ id: string; title: string; body: string; meta: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  detail: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <PanelShell title={title} subtitle={subtitle}>
        <div className="space-y-3">
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="w-full rounded-[1.25rem] border px-4 py-4 text-left"
              style={{
                borderColor:
                  selectedId === item.id
                    ? 'color-mix(in srgb, var(--tp-accent) 42%, transparent 58%)'
                    : 'var(--tp-border)',
                background:
                  selectedId === item.id
                    ? 'color-mix(in srgb, var(--tp-accent) 12%, transparent 88%)'
                    : 'var(--tp-card)',
              }}
            >
              <div style={{ color: 'var(--tp-heading)' }}>{item.title}</div>
              <div
                className="mt-1 text-sm"
                style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}
              >
                {item.body}
              </div>
              <div
                className="mt-3 text-xs"
                style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
              >
                {item.meta}
              </div>
            </button>
          ))}
        </div>
      </PanelShell>

      <PanelShell title="Detail" subtitle="Update the selected record and save it back to the database.">
        {detail}
      </PanelShell>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
      >
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={4}
          className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none disabled:opacity-60"
          style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none disabled:opacity-60"
          style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
        />
      )}
    </label>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
      >
        Search
      </span>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[1rem] border px-4 py-3 pl-11 text-sm outline-none"
          style={{
            borderColor: 'var(--tp-border)',
            background: 'var(--tp-card)',
            color: 'var(--tp-heading)',
          }}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none disabled:opacity-60"
        style={{
          borderColor: 'var(--tp-border)',
          background: 'var(--tp-card)',
          color: 'var(--tp-heading)',
        }}
      >
        {options.map((option) => (
          <option key={option.value || 'blank'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-[1rem] border px-4 py-3 text-sm"
      style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
    >
      <span>{label}</span>
      <span
        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{
          background: checked ? 'var(--tp-accent)' : 'var(--tp-surface)',
          color: checked ? 'var(--tp-btn-primary-text)' : 'var(--tp-heading)',
        }}
      >
        {checked ? 'On' : 'Off'}
      </span>
    </button>
  );
}

function DetailIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif', fontSize: '2rem' }}>
        {title}
      </div>
      <div
        className="mt-2 text-sm"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[1.25rem] border px-4 py-4"
      style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
    >
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}
      >
        {label}
      </div>
      <div className="mt-2" style={{ color: 'var(--tp-heading)' }}>
        {value}
      </div>
    </div>
  );
}
