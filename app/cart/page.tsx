'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Minus,
  Plus,
  ShoppingCart,
  Smartphone,
  CreditCard,
  Shield,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/components/Providers';
import { money } from '@/lib/utils';

type CheckoutOrder = {
  id: string;
  orderNumber: string;
  totalAmount: number;
};

export default function CartPage() {
  const { cart, updateQty, removeItem, isLoggedIn, setShowAuthModal, user } = useStore();

  const [method, setMethod] = useState<'mpesa' | 'card'>('mpesa');

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+254');
  const [shippingAddr1, setShippingAddr1] = useState('');
  const [shippingCity, setShippingCity] = useState('');

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  const [summary, setSummary] = useState({ subtotal: 0, deliveryFee: 0, total: 0 });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');

  const hasItems = cart.length > 0;

  const checkoutItems = useMemo(
    () =>
      cart.map((item) => ({
        key: item.key,
        slug: item.slug,
        sku: item.slug,
        name: item.name,
        image: item.image,
        mode: item.mode,
        sizeLabel: item.sizeLabel,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
    [cart]
  );

  useEffect(() => {
    let active = true;

    async function recalc() {
      if (!hasItems) {
        if (active) setSummary({ subtotal: 0, deliveryFee: 0, total: 0 });
        return;
      }

      setIsLoadingSummary(true);

      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: checkoutItems }),
        });

        const data = await res.json();

        if (active && res.ok) {
          setSummary({
            subtotal: data.subtotal || 0,
            deliveryFee: data.deliveryFee || 0,
            total: data.total || 0,
          });
        }
      } catch {
        const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const deliveryFee = subtotal >= 5000 ? 0 : 350;

        if (active) {
          setSummary({
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee,
          });
        }
      } finally {
        if (active) setIsLoadingSummary(false);
      }
    }

    recalc();

    return () => {
      active = false;
    };
  }, [cart, checkoutItems, hasItems]);

  async function createOrder(): Promise<CheckoutOrder> {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddr1,
        shippingCity,
        paymentMethod: method === 'mpesa' ? 'MPESA' : 'CARD',
        items: checkoutItems,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to create order');
    return data.order as CheckoutOrder;
  }

  async function handleMpesaCheckout() {
    setIsPaying(true);
    setStatusMsg('');

    try {
      const order = await createOrder();

      const payRes = await fetch('/api/payments/mpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, phone: customerPhone }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData?.error || 'Failed to start M-Pesa');

      setStatusMsg(payData?.message || 'M-Pesa request sent. Complete payment on your phone.');
      setStatusType('success');

      setTimeout(() => {
        window.location.href = `/order-confirmation?order=${order.id}&payment=mpesa`;
      }, 2000);
    } catch (e: any) {
      setStatusMsg(e?.message || 'M-Pesa checkout failed');
      setStatusType('error');
      setIsPaying(false);
    }
  }

  async function handleCardCheckout() {
    setIsPaying(true);
    setStatusMsg('');

    try {
      const order = await createOrder();

      const payRes = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData?.error || 'Failed to start Stripe checkout');

      const checkoutUrl = payData?.payment?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Stripe checkout URL not returned');

      window.location.href = checkoutUrl;
    } catch (e: any) {
      setStatusMsg(e?.message || 'Card checkout failed');
      setStatusType('error');
      setIsPaying(false);
    }
  }

  const freeDeliveryGap = Math.max(0, 5000 - summary.subtotal);

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">
          Shopping
        </div>
        <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
          Your Cart
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--tp-text)]/72">
          Review your selections, confirm delivery details, and complete checkout with confidence.
        </p>

        {!hasItems ? (
          <div className="mt-14 rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-8 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--tp-surface)]">
              <ShoppingCart className="h-8 w-8 text-[#B66A3C]" />
            </div>
            <div className="mt-6 serif-display text-4xl text-[var(--tp-heading)]">
              Your cart is empty
            </div>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--tp-text)]/72">
              Looks like you haven&apos;t added any pots yet. Start exploring our collection.
            </p>
            <Link href="/indoor" className="btn-primary mt-6 inline-flex">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/55">
                      Cart Overview
                    </div>
                    <div className="mt-2 text-sm text-[var(--tp-text)]/72">
                      {cart.length} item{cart.length === 1 ? '' : 's'} selected
                    </div>
                  </div>

                  <Link
                    href="/indoor"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B66A3C] transition hover:opacity-80"
                  >
                    Continue Shopping
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl bg-[var(--tp-surface)] px-4 py-4 text-sm text-[var(--tp-text)]/72">
                  {summary.subtotal >= 5000 ? (
                    <span>Free delivery unlocked for your order.</span>
                  ) : (
                    <span>
                      Add {money(freeDeliveryGap)} more to unlock free delivery in Nairobi.
                    </span>
                  )}
                </div>
              </div>

              {cart.map((item) => (
                <div
                  key={item.key}
                  className="grid gap-4 rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5 md:grid-cols-[120px_1fr_auto] md:items-center"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={240}
                    height={240}
                    className="h-28 w-full rounded-[1.5rem] object-cover"
                  />

                  <div>
                    <div className="serif-display text-3xl text-[var(--tp-heading)] md:text-4xl">
                      {item.name}
                    </div>
                    <div className="mt-2 text-sm text-[var(--tp-text)]/72">
                      {item.mode === 'plant' ? 'With Plant' : 'Pot Only'}
                      {item.sizeLabel ? ` · ${item.sizeLabel}` : ''}
                    </div>
                    <div className="mt-2 text-sm font-medium text-[var(--tp-text)]/75">
                      {money(item.unitPrice)}
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#B66A3C]"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-3 py-2">
                      <button
                        onClick={() => updateQty(item.key, -1)}
                        className="rounded-full p-3 text-[var(--tp-text)]/75"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-[var(--tp-heading)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.key, 1)}
                        className="rounded-full p-3 text-[var(--tp-text)]/75"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 text-right serif-display text-3xl text-[var(--tp-heading)]">
                      {money(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-8">
              <div className="serif-display text-4xl text-[var(--tp-heading)]">Summary</div>

              <div className="mt-6 space-y-4 text-sm text-[var(--tp-text)]/75">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{isLoadingSummary ? '…' : money(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {isLoadingSummary
                      ? '…'
                      : summary.deliveryFee
                      ? money(summary.deliveryFee)
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[var(--tp-border)] pt-4 font-semibold text-[var(--tp-heading)]">
                  <span>Total</span>
                  <span>{isLoadingSummary ? '…' : money(summary.total)}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-[var(--tp-text)]/72">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#B66A3C]" />
                  Secure payment flow
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#B66A3C]" />
                  Delivery confirmed during checkout
                </div>
              </div>

              {!isLoggedIn ? (
                <div className="mt-8 rounded-[1.5rem] bg-[var(--tp-surface)] p-5 text-center">
                  <p className="text-sm text-[var(--tp-text)]/72">
                    Sign in to complete your purchase and keep your order details saved.
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-primary mt-4 w-full justify-center"
                  >
                    Sign In to Checkout
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-5">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-text)]/55">
                      Your Details
                    </div>
                    <div className="mt-2 text-sm text-[var(--tp-text)]/68">
                      Complete these fields to move into payment.
                    </div>
                  </div>

                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[#B66A3C]"
                  />

                  <input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email *"
                    className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[#B66A3C]"
                  />

                  <input
                    value={shippingAddr1}
                    onChange={(e) => setShippingAddr1(e.target.value)}
                    placeholder="Street address"
                    className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[#B66A3C]"
                  />

                  <input
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="City (e.g. Nairobi)"
                    className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[#B66A3C]"
                  />

                  <div className="pt-1">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-text)]/55">
                      Payment Method
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMethod('mpesa')}
                        className={`flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          method === 'mpesa'
                            ? 'bg-[#5A3422] text-white'
                            : 'border border-[var(--tp-border)] bg-[var(--tp-surface)] text-[var(--tp-text)]/75'
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        M-Pesa
                      </button>

                      <button
                        onClick={() => setMethod('card')}
                        className={`flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          method === 'card'
                            ? 'bg-[#5A3422] text-white'
                            : 'border border-[var(--tp-border)] bg-[var(--tp-surface)] text-[var(--tp-text)]/75'
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Card
                      </button>
                    </div>
                  </div>

                  {method === 'mpesa' ? (
                    <div className="space-y-3">
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="M-Pesa phone e.g. +254700000000"
                        className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[#B66A3C]"
                      />
                      <button
                        onClick={handleMpesaCheckout}
                        disabled={isPaying || isLoadingSummary}
                        className="w-full rounded-full bg-[#D67C45] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        {isPaying ? 'Sending STK Push…' : `Pay via M-Pesa — ${money(summary.total)}`}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCardCheckout}
                      disabled={isPaying || isLoadingSummary}
                      className="w-full rounded-full bg-[#5A3422] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      {isPaying ? 'Redirecting to Stripe…' : `Pay by Card — ${money(summary.total)}`}
                    </button>
                  )}

                  {statusMsg && (
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-6 ${
                        statusType === 'error'
                          ? 'border border-red-100 bg-red-50 text-red-600'
                          : statusType === 'success'
                          ? 'border border-green-100 bg-green-50 text-green-700'
                          : 'bg-[var(--tp-surface)] text-[var(--tp-text)]/75'
                      }`}
                    >
                      {statusMsg}
                    </div>
                  )}

                  <p className="text-[11px] leading-5 text-[var(--tp-text)]/52">
                    Card payments are processed in USD via Stripe. M-Pesa payments are in KES.
                    Free delivery on orders over KES 5,000.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}