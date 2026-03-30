'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '@/components/Providers';
import { trackEvent } from '@/lib/tracking';

type OrderData = {
  id: string;
  orderNumber: string;
  trackingCode: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  shippingCity?: string;
  isCustomOrder?: boolean;
  estimatedDispatchAt?: string;
  estimatedDeliveryAt?: string;
  trackingTimeline?: Array<{
    status: string;
    label: string;
    detail: string;
    createdAt: string;
  }>;
  createdAt: string;
  items: Array<{
    productSlug?: string;
    name: string;
    mode: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image?: string;
    sizeLabel?: string;
  }>;
};

function money(amount: number) {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function OrderConfirmationInner() {
  const params = useSearchParams();
  const { clearPurchasedItems } = useStore();
  const orderId = params.get('order');
  const paymentStatus = params.get('payment');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearedOrderId, setClearedOrderId] = useState<string | null>(null);
  const [trackedPurchaseId, setTrackedPurchaseId] = useState<string | null>(null);

  const isCancelled = paymentStatus === 'cancelled';
  const isPaid = order?.status === 'PAID';
  const isFailed = order?.status === 'FAILED';
  const isPolling = useMemo(
    () => Boolean(orderId && !isCancelled && order && !isPaid && !isFailed),
    [isCancelled, isFailed, isPaid, order, orderId]
  );

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided.');
      setLoading(false);
      return;
    }

    let active = true;

    const loadOrder = async (showSpinner: boolean) => {
      if (showSpinner && active) {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok || !data?.order) {
          throw new Error(data?.error || 'Order not found.');
        }

        if (active) {
          setOrder(data.order);
          setError('');
        }
      } catch (loadError: any) {
        if (active) {
          setError(loadError?.message || 'Could not load order details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOrder(true);

    return () => {
      active = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (!isPolling) {
      return;
    }

    const interval = window.setInterval(() => {
      fetch(`/api/orders/${orderId}`, {
        cache: 'no-store',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data?.order) {
            setOrder(data.order);
          }
        })
        .catch(() => undefined);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPolling, orderId]);

  useEffect(() => {
    if (!orderId) {
      setClearedOrderId(null);
      setTrackedPurchaseId(null);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isPaid || !order || clearedOrderId === order.id) {
      return;
    }

    const purchasedItems = order.items
      .filter((item) => item.productSlug)
      .map((item) => ({
        slug: item.productSlug as string,
        mode: item.mode as 'plant' | 'pot',
        sizeLabel: item.sizeLabel || null,
      }));

    if (purchasedItems.length) {
      clearPurchasedItems(purchasedItems);
    }

    setClearedOrderId(order.id);
  }, [clearPurchasedItems, clearedOrderId, isPaid, order]);

  useEffect(() => {
    if (!isPaid || !order || trackedPurchaseId === order.id) {
      return;
    }

    void trackEvent(
      'purchase',
      {
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        value: order.totalAmount,
        itemCount: order.items.length,
      },
      'analytics'
    );
    setTrackedPurchaseId(order.id);
  }, [isPaid, order, trackedPurchaseId]);

  if (loading) {
    return (
      <main className="container-shell py-32 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--tp-border)] border-t-[var(--tp-accent)]" />
        <p className="mt-4 text-sm text-[var(--tp-text)]/65">
          Loading your order...
        </p>
      </main>
    );
  }

  if (error || isCancelled) {
    return (
      <main className="container-shell py-32 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
          <XCircle className="h-10 w-10 text-[var(--tp-accent)]" />
        </div>
        <h1 className="mt-6 serif-display text-5xl text-[var(--tp-heading)]">
          {isCancelled ? 'Payment Cancelled' : 'Something went wrong'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--tp-text)]/72">
          {isCancelled
            ? 'Your payment was cancelled. Your cart is still saved so you can try again whenever you are ready.'
            : error}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/cart" className="btn-primary">
            Back to Cart
          </Link>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const statusMessage = isPaid
    ? 'Payment received. We are preparing your order now.'
    : isFailed
    ? 'Payment could not be completed. You can return to your cart and try again.'
    : order.paymentMethod === 'MPESA'
    ? 'We are waiting for your M-Pesa confirmation. Keep this page open while we refresh the status.'
    : 'We are confirming your card payment with Stripe. This page refreshes automatically.';

  return (
    <main className="min-h-screen bg-[var(--tp-bg)] pb-16 pt-24">
      <div className="container-shell max-w-2xl">
        <div className="mb-10 text-center">
          {isPaid ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
              <CheckCircle className="h-10 w-10 text-[var(--tp-accent)]" />
            </div>
          ) : isFailed ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
              <XCircle className="h-10 w-10 text-[var(--tp-accent)]" />
            </div>
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--tp-surface)]">
              <Clock className="h-10 w-10 text-[var(--tp-accent)]" />
            </div>
          )}

          <h1 className="mt-6 serif-display text-5xl text-[var(--tp-heading)]">
            {isPaid
              ? 'Order Confirmed'
              : isFailed
              ? 'Payment Needed'
              : 'Order Received'}
          </h1>
          <p className="mt-2 text-sm text-[var(--tp-text)]/65">{statusMessage}</p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-5 py-2.5 text-sm font-semibold text-[var(--tp-heading)]">
            <ShoppingBag className="h-4 w-4 text-[var(--tp-accent)]" />
            {order.orderNumber}
          </div>

          <div className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--tp-text)]/55">
            Tracking code: {order.trackingCode}
          </div>

          {order.estimatedDeliveryAt ? (
            <div className="mt-4 text-sm text-[var(--tp-text)]/65">
              {order.isCustomOrder
                ? `Custom order timeline: up to 21 days · estimated delivery ${new Date(order.estimatedDeliveryAt).toLocaleDateString('en-KE')}`
                : `Standard delivery target: about 2 days · estimated delivery ${new Date(order.estimatedDeliveryAt).toLocaleDateString('en-KE')}`}
            </div>
          ) : null}
        </div>

        <div className="space-y-6 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6">
          <div>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-text)]/45">
              Customer
            </div>
            <div className="text-sm font-medium text-[var(--tp-heading)]">
              {order.customerName}
            </div>
            <div className="text-xs text-[var(--tp-text)]/65">
              {order.customerEmail}
            </div>
            {order.shippingCity && (
              <div className="text-xs text-[var(--tp-text)]/65">
                {order.shippingCity}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--tp-text)]/45">
              Items
            </div>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium text-[var(--tp-heading)]">
                      {item.name}
                    </div>
                    <div className="text-xs text-[var(--tp-text)]/65">
                      {item.mode === 'plant' ? 'With Plant' : 'Clay Form'}
                      {item.sizeLabel ? ` · ${item.sizeLabel}` : ''}
                      {` · Qty ${item.quantity}`}
                    </div>
                  </div>
                  <div className="font-medium text-[var(--tp-heading)]">
                    {money(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-[var(--tp-border)] pt-4 text-sm">
            <div className="flex items-center justify-between text-[var(--tp-text)]/72">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--tp-text)]/72">
              <span>Delivery</span>
              <span>{money(order.deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-[var(--tp-heading)]">
              <span>Total</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </div>

          {order.paymentMethod === 'MPESA' && !isPaid && !isFailed && (
            <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4 text-sm leading-6 text-[var(--tp-text)]/72">
              <div className="mb-1 font-semibold text-[var(--tp-heading)]">
                Check your phone
              </div>
              A payment prompt has been sent to your M-Pesa number. Enter your PIN
              to complete the payment and this page will update automatically.
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary flex-1 text-center">
            Continue Shopping
          </Link>
          <Link
            href={`/delivery?tracking=${encodeURIComponent(order.trackingCode)}&order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerEmail)}`}
            className="btn-secondary flex-1 text-center"
          >
            Track Order
          </Link>
          <a
            href={`https://wa.me/254743817931?text=${encodeURIComponent(
              `Hi TuloPots! I need help with order ${order.orderNumber}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex flex-1 items-center justify-center gap-2 text-center"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Support
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--tp-text)]/45">
          A confirmation email will be sent to {order.customerEmail}
        </p>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="container-shell py-32 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--tp-border)] border-t-[var(--tp-accent)]" />
          <p className="mt-4 text-sm text-[var(--tp-text)]/65">
            Loading order page...
          </p>
        </main>
      }
    >
      <OrderConfirmationInner />
    </Suspense>
  );
}
