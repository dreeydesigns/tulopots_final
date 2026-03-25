'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Smartphone, CreditCard } from 'lucide-react';
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

  // Pre-fill from logged-in user
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
        if (active) setSummary({ subtotal, deliveryFee, total: subtotal + deliveryFee });
      } finally {
        if (active) setIsLoadingSummary(false);
      }
    }
    recalc();
    return () => { active = false; };
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
      // Redirect to confirmation after 2s
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

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">Shopping</div>
        <h1 className="mt-4 serif-display text-6xl text-[#3d2a20]">Your Cart</h1>

        {!hasItems ? (
          <div className="mt-14 rounded-[2rem] border border-[#e6d9cd] bg-white px-8 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f5ede4]">
              <ShoppingCart className="h-8 w-8 text-[#B66A3C]" />
            </div>
            <div className="mt-6 serif-display text-4xl text-[#4b3428]">Your cart is empty</div>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#76675c]">
              Looks like you haven&apos;t added any pots yet. Start exploring our collection.
            </p>
            <Link href="/indoor" className="btn-primary mt-6 inline-flex">Browse Collection</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

            {/* Cart items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.key}
                  className="grid gap-4 rounded-[2rem] border border-[#e6d9cd] bg-white p-5 md:grid-cols-[120px_1fr_auto] md:items-center"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={240}
                    height={240}
                    className="h-28 w-full rounded-[1.5rem] object-cover"
                  />
                  <div>
                    <div className="serif-display text-4xl text-[#4b3428]">{item.name}</div>
                    <div className="mt-2 text-sm text-[#7d6d61]">
                      {item.mode === 'plant' ? 'With Plant' : 'Pot Only'}
                      {item.sizeLabel ? ` · ${item.sizeLabel}` : ''}
                    </div>
                    <div className="mt-2 text-sm text-[#7d6d61]">{money(item.unitPrice)}</div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#B66A3C]"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center rounded-full border border-[#e4d7ca] px-3 py-2">
                      <button onClick={() => updateQty(item.key, -1)} className="rounded-full p-3">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.key, 1)} className="rounded-full p-3">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 text-right serif-display text-3xl text-[#4b3428]">
                      {money(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/indoor" className="btn-secondary inline-flex">Continue Shopping</Link>
            </div>

            {/* Summary & Checkout */}
            <div className="rounded-[2rem] border border-[#e6d9cd] bg-white p-8">
              <div className="serif-display text-4xl text-[#4b3428]">Summary</div>
              <div className="mt-6 space-y-4 text-sm text-[#76675c]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{isLoadingSummary ? '…' : money(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{isLoadingSummary ? '…' : summary.deliveryFee ? money(summary.deliveryFee) : 'Free'}</span>
                </div>
                <div className="flex justify-between border-t border-[#eaded3] pt-4 font-semibold text-[#4b3428]">
                  <span>Total</span>
                  <span>{isLoadingSummary ? '…' : money(summary.total)}</span>
                </div>
              </div>

              {!isLoggedIn ? (
                <div className="mt-6 text-center">
                  <p className="text-sm text-[#76675c] mb-4">Sign in to complete your purchase.</p>
                  <button onClick={() => setShowAuthModal(true)} className="btn-primary w-full">
                    Sign In to Checkout
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7a6e]">
                    Your Details
                  </div>

                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full rounded-2xl border border-[#e6d9cd] bg-[#fdf9f6] px-5 py-3.5 text-sm outline-none focus:border-[#B66A3C] transition"
                  />
                  <input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email *"
                    className="w-full rounded-2xl border border-[#e6d9cd] bg-[#fdf9f6] px-5 py-3.5 text-sm outline-none focus:border-[#B66A3C] transition"
                  />
                  <input
                    value={shippingAddr1}
                    onChange={(e) => setShippingAddr1(e.target.value)}
                    placeholder="Street address"
                    className="w-full rounded-2xl border border-[#e6d9cd] bg-[#fdf9f6] px-5 py-3.5 text-sm outline-none focus:border-[#B66A3C] transition"
                  />
                  <input
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="City (e.g. Nairobi)"
                    className="w-full rounded-2xl border border-[#e6d9cd] bg-[#fdf9f6] px-5 py-3.5 text-sm outline-none focus:border-[#B66A3C] transition"
                  />

                  {/* Payment method */}
                  <div className="pt-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7a6e] mb-3">
                      Payment Method
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMethod('mpesa')}
                        className={`flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          method === 'mpesa'
                            ? 'bg-[#5A3422] text-white'
                            : 'border border-[#d8c9bc] bg-white text-[#7a6b5f]'
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5" /> M-Pesa
                      </button>
                      <button
                        onClick={() => setMethod('card')}
                        className={`flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          method === 'card'
                            ? 'bg-[#5A3422] text-white'
                            : 'border border-[#d8c9bc] bg-white text-[#7a6b5f]'
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Card
                      </button>
                    </div>
                  </div>

                  {method === 'mpesa' ? (
                    <div className="space-y-3">
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="M-Pesa phone e.g. +254700000000"
                        className="w-full rounded-2xl border border-[#e6d9cd] bg-[#fdf9f6] px-5 py-3.5 text-sm outline-none focus:border-[#B66A3C] transition"
                      />
                      <button
                        onClick={handleMpesaCheckout}
                        disabled={isPaying || isLoadingSummary}
                        className="w-full rounded-full bg-[#D67C45] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60 transition hover:opacity-90"
                      >
                        {isPaying ? 'Sending STK Push…' : `Pay via M-Pesa — ${money(summary.total)}`}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCardCheckout}
                      disabled={isPaying || isLoadingSummary}
                      className="w-full rounded-full bg-[#5A3422] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60 transition hover:opacity-90"
                    >
                      {isPaying ? 'Redirecting to Stripe…' : `Pay by Card — ${money(summary.total)}`}
                    </button>
                  )}

                  {statusMsg && (
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-6 ${
                        statusType === 'error'
                          ? 'bg-red-50 border border-red-100 text-red-600'
                          : statusType === 'success'
                          ? 'bg-green-50 border border-green-100 text-green-700'
                          : 'bg-[#fdf5ee] text-[#76675c]'
                      }`}
                    >
                      {statusMsg}
                    </div>
                  )}

                  <p className="text-[11px] leading-5 text-[#b0a09a]">
                    Card payments are processed in USD via Stripe. M-Pesa payments are in KES. Free
                    delivery on orders over KES 5,000.
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
