'use client';

import { useEffect, useState } from 'react';
import { Clock3, Mail, MapPin, Search, Truck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type DeliveryOrder = {
  id: string;
  orderNumber: string;
  trackingCode: string;
  status: string;
  isCustomOrder: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  estimatedDispatchAt: string | null;
  estimatedDeliveryAt: string | null;
  trackingTimeline: Array<{
    status: string;
    label: string;
    detail: string;
    createdAt: string;
  }>;
  notificationLog: Array<{
    channel: string;
    subject: string;
    detail: string;
    status: string;
    createdAt: string;
    target?: string | null;
  }>;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    mode: string;
    image?: string | null;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return 'Pending';
  return new Date(value).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DeliveryPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [trackingCode, setTrackingCode] = useState(searchParams.get('tracking') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<DeliveryOrder | null>(null);

  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('email')) {
      void lookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          email,
          trackingCode,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        order?: DeliveryOrder;
      };

      if (!response.ok || !data.ok || !data.order) {
        throw new Error(data.error || 'Unable to find that order.');
      }

      setOrder(data.order);
    } catch (lookupError: any) {
      setOrder(null);
      setError(lookupError?.message || 'Unable to find that order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="tp-page min-h-screen pb-20 pt-24">
      <div className="container-shell max-w-5xl">
        <section className="rounded-[2rem] border tp-card p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Delivery Tracking
          </div>
          <h1 className="mt-3 serif-display text-5xl tp-heading md:text-6xl">
            Track Your Order
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 tp-text-soft">
            Standard paid orders are planned around a 2-day delivery window after purchase.
            Custom work follows a longer studio rhythm and can take up to 21 days.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_0.8fr_auto]">
            <input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="Order number"
              className="tp-input rounded-[1rem] px-4 py-3 text-sm outline-none"
              style={{ borderWidth: '1px' }}
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Customer email"
              className="tp-input rounded-[1rem] px-4 py-3 text-sm outline-none"
              style={{ borderWidth: '1px' }}
            />
            <input
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value)}
              placeholder="Tracking code (optional)"
              className="tp-input rounded-[1rem] px-4 py-3 text-sm outline-none"
              style={{ borderWidth: '1px' }}
            />
            <button type="button" onClick={() => void lookup()} className="btn-primary" disabled={loading}>
              <Search className="h-4 w-4" />
              {loading ? 'Checking...' : 'Check Order'}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-[1rem] px-4 py-3 text-sm tp-accent" style={{ background: 'var(--tp-accent-soft)' }}>
              {error}
            </div>
          ) : null}
        </section>

        {order ? (
          <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border tp-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-text-muted">
                    Order
                  </div>
                  <div className="mt-2 serif-display text-3xl tp-heading">
                    {order.orderNumber}
                  </div>
                </div>
                <div className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ background: 'var(--tp-accent-soft)', color: 'var(--tp-accent)' }}>
                  {order.status}
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                    Delivery window
                  </div>
                  <div className="mt-2 text-sm tp-heading">
                    {order.isCustomOrder ? 'Custom order · up to 21 days' : 'Standard order · about 2 days'}
                  </div>
                </div>
                <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                    <Truck className="h-3.5 w-3.5 tp-accent" />
                    Estimated dispatch
                  </div>
                  <div className="mt-2 text-sm tp-heading">{formatDate(order.estimatedDispatchAt)}</div>
                </div>
                <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                    <Clock3 className="h-3.5 w-3.5 tp-accent" />
                    Estimated delivery
                  </div>
                  <div className="mt-2 text-sm tp-heading">{formatDate(order.estimatedDeliveryAt)}</div>
                </div>
                <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                    <Mail className="h-3.5 w-3.5 tp-accent" />
                    Notifications
                  </div>
                  <div className="mt-2 text-sm tp-heading">
                    {order.notificationLog.length
                      ? `${order.notificationLog[order.notificationLog.length - 1]?.channel || 'email'} updates queued`
                      : 'No notifications queued yet'}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                  <MapPin className="h-3.5 w-3.5 tp-accent" />
                  Tracking code
                </div>
                <div className="mt-2 text-sm tp-heading">{order.trackingCode}</div>
              </div>

              <div className="mt-6 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
                  Queued updates
                </div>
                <div className="mt-3 space-y-3">
                  {order.notificationLog.length ? (
                    order.notificationLog
                      .slice(-3)
                      .reverse()
                      .map((entry, index) => (
                        <div
                          key={`${entry.createdAt}-${index}`}
                          className="rounded-[1rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-4 py-3"
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] tp-accent">
                            {entry.channel}
                          </div>
                          <div className="mt-2 text-sm font-semibold tp-heading">{entry.subject}</div>
                          <div className="mt-1 text-sm leading-6 tp-text-soft">{entry.detail}</div>
                          <div className="mt-2 text-[10px] uppercase tracking-[0.14em] tp-text-muted">
                            {entry.target || 'Target pending'}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm tp-text-soft">
                      No delivery notifications have been queued yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border tp-card p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] tp-text-muted">
                Timeline
              </div>
              <div className="mt-5 space-y-4">
                {order.trackingTimeline.map((entry, index) => (
                  <div key={`${entry.createdAt}-${index}`} className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                    <div className="text-sm font-semibold tp-heading">{entry.label}</div>
                    <div className="mt-2 text-sm leading-7 tp-text-soft">{entry.detail}</div>
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] tp-text-muted">
                      {formatDate(entry.createdAt)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] tp-text-muted">
                Items
              </div>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4">
                    <div>
                      <div className="text-sm font-semibold tp-heading">{item.name}</div>
                      <div className="mt-1 text-xs tp-text-muted">
                        {item.mode === 'plant' ? 'Pot + Plant' : 'Clay Form'} · Qty {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
