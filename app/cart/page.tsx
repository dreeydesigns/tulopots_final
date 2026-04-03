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
import {
  countryOptions,
  getCountryLabel,
  getDeliverySummary,
  isKenyanCountry,
} from '@/lib/customer-preferences';
import { LEGAL_ROUTES } from '@/lib/policies';
import { getTrackingSessionKey, readAttribution, trackEvent } from '@/lib/tracking';
import { money } from '@/lib/utils';

type CheckoutOrder = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  displayCurrency?: string | null;
  preferredLanguage?: string | null;
};

type FieldErrors = Partial<
  Record<
    'customerName' | 'customerEmail' | 'customerPhone' | 'shippingCity' | 'shippingCountry',
    string
  >
>;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^\+?[0-9]{10,15}$/.test(value);
}

const activeMethodStyle = {
  background: 'var(--tp-accent)',
  color: 'var(--tp-btn-primary-text)',
};

const inactiveMethodStyle = {
  background: 'var(--tp-surface)',
  color: 'color-mix(in srgb, var(--tp-text) 78%, transparent 22%)',
  border: '1px solid var(--tp-border)',
};

export default function CartPage() {
  const { cart, updateQty, removeItem, isLoggedIn, setShowAuthModal, user } = useStore();

  const [method, setMethod] = useState<'mpesa' | 'card'>('mpesa');

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+254');
  const [shippingAddr1, setShippingAddr1] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingCountry, setShippingCountry] = useState('KE');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      if (user.phone) setCustomerPhone(user.phone);
      if (user.defaultShippingAddress) setShippingAddr1(user.defaultShippingAddress);
      if (user.defaultShippingCity) setShippingCity(user.defaultShippingCity);
      if (user.defaultShippingCountry) setShippingCountry(user.defaultShippingCountry);
    }
  }, [user]);

  const [summary, setSummary] = useState({
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    isInternational: false,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');

  const hasItems = cart.length > 0;
  const displayCurrency = user?.preferredCurrency || 'KES';
  const displayLanguage = user?.preferredLanguage || 'en';
  const isKenyanDelivery = isKenyanCountry(shippingCountry);
  const showBaseKes = displayCurrency !== 'KES';
  const formatDisplayMoney = (value: number) =>
    money(value, { currency: displayCurrency, language: displayLanguage });

  const checkoutItems = useMemo(
    () =>
      cart.map((item) => ({
        key: item.key,
        slug: item.slug,
        sku: item.sku || item.slug,
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
        if (active) {
          setSummary({ subtotal: 0, deliveryFee: 0, total: 0, isInternational: false });
        }
        return;
      }

      setIsLoadingSummary(true);

      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: checkoutItems, shippingCountry }),
        });

        const data = await res.json();

        if (active && res.ok) {
          setSummary({
            subtotal: data.subtotal || 0,
            deliveryFee: data.deliveryFee || 0,
            total: data.total || 0,
            isInternational: Boolean(data.isInternational),
          });
        }
      } catch {
        const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const fallback = getDeliverySummary({
          subtotalKes: subtotal,
          itemCount: cart.length,
          shippingCountry,
        });

        if (active) {
          setSummary({
            subtotal: fallback.subtotalKes,
            deliveryFee: fallback.deliveryFeeKes,
            total: fallback.totalKes,
            isInternational: fallback.isInternational,
          });
        }
      } finally {
        if (active) setIsLoadingSummary(false);
      }
    }

    void recalc();

    return () => {
      active = false;
    };
  }, [cart, checkoutItems, hasItems, shippingCountry]);

  function validateCheckout() {
    const nextErrors: FieldErrors = {};

    if (!customerName.trim()) {
      nextErrors.customerName = 'Enter the customer name for this order.';
    }

    if (!isValidEmail(customerEmail.trim())) {
      nextErrors.customerEmail = 'Enter a valid email address.';
    }

    if (!isValidPhone(customerPhone.trim())) {
      nextErrors.customerPhone = 'Use a valid phone number, for example +254700000000.';
    }

    if (!shippingCity.trim()) {
      nextErrors.shippingCity = 'Add the delivery city so we can route the order.';
    }

    if (!shippingCountry.trim()) {
      nextErrors.shippingCountry = 'Choose the delivery country for this order.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function createOrder(): Promise<CheckoutOrder> {
    const attribution = readAttribution();
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddr1,
        shippingCity,
        shippingCountry,
        paymentMethod: method === 'mpesa' ? 'MPESA' : 'CARD',
        displayCurrency,
        preferredLanguage: displayLanguage,
        attribution,
        sessionKey: getTrackingSessionKey(),
        items: checkoutItems,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to create order');
    return data.order as CheckoutOrder;
  }

  function ensureReadyForCheckout() {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return false;
    }

    setStatusMsg('');
    setStatusType('info');

    if (!validateCheckout()) {
      setStatusMsg('Complete the required details before starting payment.');
      setStatusType('error');
      return false;
    }

    return true;
  }

  async function handleMpesaCheckout() {
    if (!ensureReadyForCheckout()) {
      return;
    }

    setIsPaying(true);
    setStatusMsg('');

    try {
      const order = await createOrder();
      void trackEvent(
        'begin_checkout',
        {
          paymentMethod: 'mpesa',
          value: order.totalAmount,
          itemCount: checkoutItems.length,
        },
        'analytics'
      );

      const payRes = await fetch('/api/payments/mpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, phone: customerPhone }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData?.error || 'Failed to start M-Pesa');

      setStatusMsg(payData?.message || 'M-Pesa request sent. Complete payment on your phone.');
      setStatusType('success');

      window.setTimeout(() => {
        window.location.href = `/order-confirmation?order=${order.id}&payment=mpesa`;
      }, 1800);
    } catch (error: any) {
      setStatusMsg(error?.message || 'M-Pesa checkout failed');
      setStatusType('error');
      setIsPaying(false);
    }
  }

  async function handleCardCheckout() {
    if (!ensureReadyForCheckout()) {
      return;
    }

    setIsPaying(true);
    setStatusMsg('');

    try {
      const order = await createOrder();
      void trackEvent(
        'begin_checkout',
        {
          paymentMethod: 'card',
          value: order.totalAmount,
          itemCount: checkoutItems.length,
        },
        'analytics'
      );

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
    } catch (error: any) {
      setStatusMsg(error?.message || 'Card checkout failed');
      setStatusType('error');
      setIsPaying(false);
    }
  }

  const freeDeliveryGap = Math.max(0, 5000 - summary.subtotal);
  const deliveryMessage = isKenyanDelivery
    ? summary.subtotal >= 5000
      ? 'Free delivery unlocked for your order.'
      : `Add ${formatDisplayMoney(freeDeliveryGap)} more to unlock free delivery in Kenya.`
    : summary.isInternational
    ? `International delivery has been estimated for ${getCountryLabel(shippingCountry)}.`
    : `Delivery will be estimated for ${getCountryLabel(shippingCountry)}.`;

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tp-accent)]">
          Crafted for Living
        </div>
        <h1 className="mt-4 serif-display text-5xl text-[var(--tp-heading)] md:text-6xl">
          Your Cart
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--tp-text)]/72">
          Review your chosen forms, confirm delivery details, and move into payment with
          clarity.
        </p>

        {!hasItems ? (
          <div className="mt-14 rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] px-8 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--tp-surface)]">
              <ShoppingCart className="h-8 w-8 text-[var(--tp-accent)]" />
            </div>
            <div className="mt-6 serif-display text-4xl text-[var(--tp-heading)]">
              Your cart is empty
            </div>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--tp-text)]/72">
              There are no clay pieces in your cart yet. Explore the collection and return when a
              piece feels right for your space.
            </p>
            <Link href="/pots" className="btn-primary mt-6 inline-flex">
              View Clay Forms
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
                    href="/pots"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)] transition hover:opacity-80"
                  >
                    Continue Shopping
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl bg-[var(--tp-surface)] px-4 py-4 text-sm text-[var(--tp-text)]/72">
                  <span>{deliveryMessage}</span>
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
                      {item.mode === 'plant' ? 'Placed with Plant' : 'Clay Form'}
                      {item.sizeLabel ? ` · ${item.sizeLabel}` : ''}
                    </div>
                    <div className="mt-2 text-sm font-medium text-[var(--tp-text)]/75">
                      {formatDisplayMoney(item.unitPrice)}
                    </div>
                    {showBaseKes ? (
                      <div className="mt-1 text-xs text-[var(--tp-text)]/52">{money(item.unitPrice)}</div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent)]"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-3 py-2">
                      <button
                        type="button"
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
                        type="button"
                        onClick={() => updateQty(item.key, 1)}
                        className="rounded-full p-3 text-[var(--tp-text)]/75"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 text-right serif-display text-3xl text-[var(--tp-heading)]">
                      {formatDisplayMoney(item.unitPrice * item.quantity)}
                    </div>
                    {showBaseKes ? (
                      <div className="mt-1 text-right text-xs text-[var(--tp-text)]/52">
                        {money(item.unitPrice * item.quantity)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-8">
              <div className="serif-display text-4xl text-[var(--tp-heading)]">Summary</div>

              <div className="mt-6 space-y-4 text-sm text-[var(--tp-text)]/75">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{isLoadingSummary ? '…' : formatDisplayMoney(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {isLoadingSummary
                      ? '…'
                      : summary.deliveryFee
                      ? formatDisplayMoney(summary.deliveryFee)
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[var(--tp-border)] pt-4 font-semibold text-[var(--tp-heading)]">
                  <span>Total</span>
                  <span>{isLoadingSummary ? '…' : formatDisplayMoney(summary.total)}</span>
                </div>
              </div>

              {showBaseKes ? (
                <div className="mt-4 rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-3 text-xs leading-6 text-[var(--tp-text)]/62">
                  Base checkout amount: {money(summary.total)}. Displayed currency follows your saved regional preference.
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 text-sm text-[var(--tp-text)]/72">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--tp-accent)]" />
                  Secure payment flow
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[var(--tp-accent)]" />
                  Delivery confirmed after order placement
                </div>
              </div>

              {!isLoggedIn ? (
                <div className="mt-8 rounded-[1.5rem] bg-[var(--tp-surface)] p-5 text-center">
                  <p className="text-sm text-[var(--tp-text)]/72">
                    Sign in to continue with checkout and keep your order details saved.
                  </p>
                  <button
                    type="button"
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
                      These details are used for delivery and payment confirmation.
                    </div>
                  </div>

                  <div>
                    <input
                      value={customerName}
                      onChange={(event) => {
                        setCustomerName(event.target.value);
                        setFieldErrors((current) => ({ ...current, customerName: undefined }));
                      }}
                      placeholder="Full Name *"
                      autoComplete="name"
                      className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                    />
                    {fieldErrors.customerName ? (
                      <p className="mt-2 text-xs text-[var(--tp-accent)]">
                        {fieldErrors.customerName}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <input
                      value={customerEmail}
                      onChange={(event) => {
                        setCustomerEmail(event.target.value);
                        setFieldErrors((current) => ({ ...current, customerEmail: undefined }));
                      }}
                      placeholder="Email *"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                    />
                    {fieldErrors.customerEmail ? (
                      <p className="mt-2 text-xs text-[var(--tp-accent)]">
                        {fieldErrors.customerEmail}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <input
                      value={customerPhone}
                      onChange={(event) => {
                        setCustomerPhone(event.target.value);
                        setFieldErrors((current) => ({ ...current, customerPhone: undefined }));
                      }}
                      placeholder="Phone * e.g. +254700000000"
                      autoComplete="tel"
                      className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                    />
                    <p className="mt-2 text-xs text-[var(--tp-text)]/55">
                      {method === 'mpesa'
                        ? 'We use this number for delivery updates and your M-Pesa payment prompt.'
                        : 'We use this number for delivery updates and order follow-up.'}
                    </p>
                    {fieldErrors.customerPhone ? (
                      <p className="mt-2 text-xs text-[var(--tp-accent)]">
                        {fieldErrors.customerPhone}
                      </p>
                    ) : null}
                  </div>

                  <input
                    value={shippingAddr1}
                    onChange={(event) => setShippingAddr1(event.target.value)}
                    placeholder="Building, estate, or street"
                    autoComplete="address-line1"
                    className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                  />

                  <div>
                    <select
                      value={shippingCountry}
                      onChange={(event) => {
                        setShippingCountry(event.target.value);
                        setFieldErrors((current) => ({ ...current, shippingCountry: undefined }));
                      }}
                      className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                    >
                      {countryOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.shippingCountry ? (
                      <p className="mt-2 text-xs text-[var(--tp-accent)]">
                        {fieldErrors.shippingCountry}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <input
                      value={shippingCity}
                      onChange={(event) => {
                        setShippingCity(event.target.value);
                        setFieldErrors((current) => ({ ...current, shippingCity: undefined }));
                      }}
                      placeholder="City *"
                      autoComplete="address-level2"
                      className="w-full rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3.5 text-sm text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                    />
                    {fieldErrors.shippingCity ? (
                      <p className="mt-2 text-xs text-[var(--tp-accent)]">
                        {fieldErrors.shippingCity}
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-1">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-text)]/55">
                      Payment Method
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMethod('mpesa')}
                        className="flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition"
                        style={method === 'mpesa' ? activeMethodStyle : inactiveMethodStyle}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        M-Pesa
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod('card')}
                        className="flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition"
                        style={method === 'card' ? activeMethodStyle : inactiveMethodStyle}
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Card
                      </button>
                    </div>
                  </div>

                  {method === 'mpesa' ? (
                    <button
                      type="button"
                      onClick={handleMpesaCheckout}
                      disabled={isPaying || isLoadingSummary}
                      className="w-full rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'var(--tp-accent)' }}
                    >
                      {isPaying
                        ? 'Sending STK Push…'
                        : `Pay via M-Pesa — ${formatDisplayMoney(summary.total)}`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCardCheckout}
                      disabled={isPaying || isLoadingSummary}
                      className="w-full rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
                      style={{
                        background:
                          'color-mix(in srgb, var(--tp-heading) 82%, var(--tp-accent) 18%)',
                      }}
                    >
                      {isPaying
                        ? 'Redirecting to Stripe…'
                        : `Pay by Card — ${formatDisplayMoney(summary.total)}`}
                    </button>
                  )}

                  {statusMsg ? (
                    <div
                      className="rounded-2xl px-4 py-3 text-xs leading-6"
                      style={{
                        border: '1px solid var(--tp-border)',
                        background:
                          statusType === 'error'
                            ? 'color-mix(in srgb, var(--tp-accent) 10%, var(--tp-card) 90%)'
                            : statusType === 'success'
                            ? 'color-mix(in srgb, var(--tp-success) 12%, var(--tp-card) 88%)'
                            : 'var(--tp-surface)',
                        color:
                          statusType === 'error'
                            ? 'var(--tp-accent)'
                            : 'color-mix(in srgb, var(--tp-heading) 86%, transparent 14%)',
                      }}
                    >
                      {statusMsg}
                    </div>
                  ) : null}

                  <p className="text-[11px] leading-5 text-[var(--tp-text)]/52">
                    Card payments are processed through Stripe. M-Pesa orders use an STK push to
                    the number above. Kenya orders unlock free delivery over KES 5,000, while
                    non-Kenya destinations use an estimated international shipping fee.
                  </p>
                  <p className="text-[11px] leading-5 text-[var(--tp-text)]/46">
                    By continuing, you agree to the{' '}
                    <Link href={LEGAL_ROUTES.terms} className="text-[var(--tp-accent)] underline">
                      Terms of Use
                    </Link>{' '}
                    and{' '}
                    <Link
                      href={LEGAL_ROUTES.privacy}
                      className="text-[var(--tp-accent)] underline"
                    >
                      Privacy Policy
                    </Link>
                    . Card details stay on Stripe-hosted pages and are not stored on our servers.
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
