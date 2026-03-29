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
  Sparkles,
  Star,
  SquarePen,
  Trash2,
} from 'lucide-react';
import type { User } from '@/components/Providers';

type Tab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'studio'
  | 'reviews'
  | 'contact'
  | 'newsletter'
  | 'content';

type DashboardData = {
  counts: {
    products: number;
    orders: number;
    studioBriefs: number;
    contactMessages: number;
    newsletterSubscribers: number;
    reviews: number;
    pendingReviews: number;
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
    status: string;
    createdAt: string;
    readAt: string | null;
    handledAt: string | null;
  }>;
  newsletterSubscribers: Array<{
    id: string;
    email: string;
    createdAt: string;
  }>;
  siteSections: Array<{
    id: string;
    key: string;
    label: string;
    route: string | null;
    visible: boolean;
  }>;
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
};

type DashboardResponse = {
  ok: boolean;
  dashboard?: DashboardData;
  error?: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  size: string;
  badge: string;
  short: string;
  description: string;
  cardDescription: string;
  image: string;
  price: string;
  potOnly: string;
  visible: boolean;
  available: boolean;
};

const defaultProductForm: ProductFormState = {
  name: '',
  slug: '',
  sku: '',
  category: 'pots',
  size: 'medium',
  badge: '',
  short: '',
  description: '',
  cardDescription: '',
  image: '',
  price: '',
  potOnly: '',
  visible: true,
  available: true,
};

const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: PackagePlus },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'studio', label: 'Studio', icon: Sparkles },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'newsletter', label: 'Newsletter', icon: Boxes },
  { id: 'content', label: 'Content', icon: PanelsTopLeft },
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
const contactStatusOptions = ['NEW', 'READ', 'HANDLED'];

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

function productToForm(product: DashboardData['products'][number]): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku || '',
    category: product.category,
    size: product.size,
    badge: product.badge || '',
    short: product.short,
    description: product.description,
    cardDescription: product.cardDescription,
    image: product.image,
    price: String(product.price),
    potOnly: product.potOnly == null ? '' : String(product.potOnly),
    visible: product.visible,
    available: product.available,
  };
}

export function AdminDashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState('');
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [orderNotes, setOrderNotes] = useState('');

  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [briefStatus, setBriefStatus] = useState('RECEIVED');
  const [briefNotes, setBriefNotes] = useState('');

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

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

      if (!selectedContactId && data.dashboard.contactMessages.length) {
        setSelectedContactId(data.dashboard.contactMessages[0].id);
      }
    } catch {
      setError('Unable to load the admin dashboard.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const selectedOrder = useMemo(
    () => dashboard?.orders.find((order) => order.id === selectedOrderId) || null,
    [dashboard, selectedOrderId]
  );

  const selectedBrief = useMemo(
    () => dashboard?.studioBriefs.find((brief) => brief.id === selectedBriefId) || null,
    [dashboard, selectedBriefId]
  );

  const selectedContact = useMemo(
    () =>
      dashboard?.contactMessages.find((message) => message.id === selectedContactId) || null,
    [dashboard, selectedContactId]
  );

  const selectedReview = useMemo(
    () => dashboard?.reviews.find((review) => review.id === selectedReviewId) || null,
    [dashboard, selectedReviewId]
  );

  useEffect(() => {
    if (selectedOrder) {
      setOrderStatus(selectedOrder.status);
      setOrderNotes(selectedOrder.adminNotes || '');
    }
  }, [selectedOrder]);

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
          body: JSON.stringify({
            ...productForm,
            price: Number(productForm.price),
            potOnly: productForm.potOnly,
          }),
        }
      );

      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to save product.');
        return;
      }

      setEditingProductId(null);
      setProductForm(defaultProductForm);
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
        setProductForm(defaultProductForm);
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
        body: JSON.stringify({ status: orderStatus, adminNotes: orderNotes }),
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

  async function updateContactStatus(id: string, status: string) {
    try {
      setPendingKey(`contact:${id}`);
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || 'Unable to update contact message.');
        return;
      }

      await loadDashboard();
    } catch {
      setError('Unable to update contact message.');
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
            {tabs.map((item) => {
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
                {tab === 'overview' ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      {[
                        ['Products', dashboard.counts.products],
                        ['Orders', dashboard.counts.orders],
                        ['Studio Briefs', dashboard.counts.studioBriefs],
                        ['Contacts', dashboard.counts.contactMessages],
                        ['Newsletter', dashboard.counts.newsletterSubscribers],
                        ['Review Queue', dashboard.counts.pendingReviews],
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
                          {[
                            ['Add a product', 'products'],
                            ['Review newest order', 'orders'],
                            ['Respond to Studio brief', 'studio'],
                            ['Moderate newest review', 'reviews'],
                            ['Triage contact message', 'contact'],
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
                  </div>
                ) : null}

                {tab === 'products' ? (
                  <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                    <PanelShell
                      title="Product management"
                      subtitle="Edit live catalog entries, visibility, availability, and storefront pricing."
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}>
                          {dashboard.products.length} products in the live catalog
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setProductForm(defaultProductForm);
                          }}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                          style={{ background: 'var(--tp-accent)', color: '#ffffff' }}
                        >
                          <PackagePlus className="h-4 w-4" />
                          New Product
                        </button>
                      </div>

                      <div className="space-y-3">
                        {dashboard.products.map((product) => (
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
                              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {product.visible ? 'Visible' : 'Hidden'}
                                </span>
                                <span className="rounded-full px-3 py-1" style={{ background: 'var(--tp-surface)' }}>
                                  {product.available ? 'Available' : 'Unavailable'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 md:flex-col">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProductId(product.id);
                                  setProductForm(productToForm(product));
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
                      </div>
                    </PanelShell>

                    <PanelShell
                      title={editingProductId ? 'Edit product' : 'Create product'}
                      subtitle="These fields feed the live storefront catalog."
                    >
                      <div className="grid gap-4">
                        {[
                          ['Name', 'name'],
                          ['Slug', 'slug'],
                          ['SKU', 'sku'],
                          ['Badge', 'badge'],
                          ['Short line', 'short'],
                          ['Image URL', 'image'],
                        ].map(([label, key]) => (
                          <Field
                            key={key}
                            label={String(label)}
                            value={productForm[key as keyof ProductFormState] as string}
                            onChange={(value) => setProductForm((current) => ({ ...current, [key]: value }))}
                          />
                        ))}

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Category" value={productForm.category} onChange={(value) => setProductForm((current) => ({ ...current, category: value }))} />
                          <Field label="Size" value={productForm.size} onChange={(value) => setProductForm((current) => ({ ...current, size: value }))} />
                          <Field label="Price" value={productForm.price} onChange={(value) => setProductForm((current) => ({ ...current, price: value }))} />
                          <Field label="Pot only" value={productForm.potOnly} onChange={(value) => setProductForm((current) => ({ ...current, potOnly: value }))} />
                        </div>

                        <Field label="Description" value={productForm.description} multiline onChange={(value) => setProductForm((current) => ({ ...current, description: value }))} />
                        <Field label="Card description" value={productForm.cardDescription} multiline onChange={(value) => setProductForm((current) => ({ ...current, cardDescription: value }))} />

                        <div className="grid gap-3 md:grid-cols-2">
                          <ToggleRow label="Visible on storefront" checked={productForm.visible} onChange={(checked) => setProductForm((current) => ({ ...current, visible: checked }))} />
                          <ToggleRow label="Available to order" checked={productForm.available} onChange={(checked) => setProductForm((current) => ({ ...current, available: checked }))} />
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
                              setProductForm(defaultProductForm);
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
                  <SplitPanel
                    title="Order management"
                    subtitle="Review live orders and move each one through fulfillment."
                    list={dashboard.orders.map((order) => ({
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
                          <div className="grid gap-4 md:grid-cols-3">
                            <DetailStat label="Status" value={selectedOrder.status} />
                            <DetailStat label="Payment" value={selectedOrder.paymentMethod} />
                            <DetailStat label="Total" value={money(selectedOrder.totalAmount)} />
                          </div>
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

                {tab === 'contact' ? (
                  <SplitPanel
                    title="Contact messages"
                    subtitle="Read each message and mark it as new, read, or handled."
                    list={dashboard.contactMessages.map((message) => ({
                      id: message.id,
                      title: message.name,
                      body: `${message.subject} · ${message.status}`,
                      meta: formatDate(message.createdAt),
                    }))}
                    selectedId={selectedContactId}
                    onSelect={setSelectedContactId}
                    detail={
                      selectedContact ? (
                        <div className="space-y-5">
                          <DetailIntro title={selectedContact.subject} subtitle={`${selectedContact.name} · ${selectedContact.email}`} />
                          <div className="rounded-[1.25rem] border px-4 py-4 text-sm leading-7" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                            {selectedContact.message}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {contactStatusOptions.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => void updateContactStatus(selectedContact.id, status)}
                                disabled={pendingKey === `contact:${selectedContact.id}`}
                                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                                style={{
                                  background: selectedContact.status === status ? 'var(--tp-accent)' : 'var(--tp-surface)',
                                  color: selectedContact.status === status ? '#ffffff' : 'var(--tp-heading)',
                                }}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null
                    }
                  />
                ) : null}

                {tab === 'newsletter' ? (
                  <PanelShell title="Newsletter list" subtitle="Current subscribers collected through the live storefront form.">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)' }}>
                        {dashboard.newsletterSubscribers.length} subscribers
                      </div>
                      <a href="/api/admin/newsletter?format=csv" className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ background: 'var(--tp-accent)', color: '#ffffff' }}>
                        Export CSV
                      </a>
                    </div>

                    <div className="space-y-3">
                      {dashboard.newsletterSubscribers.map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center justify-between gap-4 rounded-[1.25rem] border px-4 py-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
                          <div style={{ color: 'var(--tp-heading)' }}>{subscriber.email}</div>
                          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)' }}>
                            {formatDate(subscriber.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PanelShell>
                ) : null}

                {tab === 'content' ? (
                  <PanelShell title="Content visibility" subtitle="Toggle major storefront sections on and off from the database.">
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
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
          rows={4}
          className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
          style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
          style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
        />
      )}
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
          color: checked ? '#ffffff' : 'var(--tp-heading)',
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
