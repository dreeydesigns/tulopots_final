'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, ShoppingBag, MessageCircle } from 'lucide-react';

type OrderData = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  shippingCity?: string;
  createdAt: string;
  items: Array<{
    name: string;
    mode: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image?: string;
    sizeLabel?: string;
  }>;
};

function money(n: number) {
  return `KES ${n.toLocaleString('en-KE')}`;
}

export default function OrderConfirmationPage() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const paymentStatus = params.get('payment'); // 'success' | 'cancelled'

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided.');
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.order) setOrder(data.order);
        else setError('Order not found.');
      })
      .catch(() => setError('Could not load order details.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const isCancelled = paymentStatus === 'cancelled';
  const isPaid = order?.status === 'PAID';
  const isPending = order?.status === 'CONFIRMED' || order?.status === 'PENDING';

  if (loading) {
    return (
      <main className="container-shell py-32 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e8dccf] border-t-[#B66A3C]" />
        <p className="mt-4 text-sm text-[#9a8a80]">Loading your order…</p>
      </main>
    );
  }

  if (error || isCancelled) {
    return (
      <main className="container-shell py-32 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="mt-6 serif-display text-5xl text-[#3d2a20]">
          {isCancelled ? 'Payment Cancelled' : 'Something went wrong'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#76675c]">
          {isCancelled
            ? 'Your payment was cancelled. Your cart is still saved — you can try again whenever you are ready.'
            : error}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/cart" className="btn-primary">Back to Cart</Link>
          <Link href="/" className="btn-secondary">Home</Link>
        </div>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="min-h-screen bg-[#F7F2EA] pt-24 pb-16">
      <div className="container-shell max-w-2xl">

        {/* Status header */}
        <div className="text-center mb-10">
          {isPaid ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fdf5ee]">
              <Clock className="h-10 w-10 text-[#B66A3C]" />
            </div>
          )}

          <h1 className="mt-6 serif-display text-5xl text-[#3d2a20]">
            {isPaid ? 'Order Confirmed!' : 'Order Received'}
          </h1>
          <p className="mt-2 text-sm text-[#9a8a80]">
            {isPaid
              ? `Payment received — we will prepare your order shortly.`
              : order.paymentMethod === 'MPESA'
              ? `We are waiting for your M-Pesa payment. Check your phone.`
              : `Processing your payment. This page will update automatically.`}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white border border-[#e8dccf] px-5 py-2.5 text-sm font-semibold text-[#3d2a20]">
            <ShoppingBag className="h-4 w-4 text-[#B66A3C]" />
            {order.orderNumber}
          </div>
        </div>

        {/* Order card */}
        <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6 space-y-6">

          {/* Customer */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b0a09a] mb-3">
              Customer
            </div>
            <div className="text-sm text-[#3d2a20] font-medium">{order.customerName}</div>
            <div className="text-xs text-[#9a8a80]">{order.customerEmail}</div>
            {order.shippingCity && (
              <div className="text-xs text-[#9a8a80]">{order.shippingCity}</div>
            )}
          </div>

          {/* Items */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b0a09a] mb-3">
              Items
            </div>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-[#3d2a20]">{item.name}</div>
                    <div className="text-xs text-[#9a8a80]">
                      {item.mode === 'plant' ? 'With Plant' : 'Pot Only'}
                      {item.sizeLabel ? ` · ${item.sizeLabel}` : ''}
                      {' · '}Qty {item.quantity}
                    </div>
                  </div>
                  <div className="text-[#3d2a20] font-medium">{money(item.lineTotal)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-[#f0e6df] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#76675c]">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#76675c]">
              <span>Delivery</span>
              <span>{order.deliveryFee ? money(order.deliveryFee) : 'Free'}</span>
            </div>
            <div className="flex justify-between font-semibold text-[#3d2a20] text-base pt-1">
              <span>Total</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl bg-[#fdf9f5] px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-[#9a8a80]">Payment method</div>
            <div className="text-sm font-semibold text-[#3d2a20]">
              {order.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Card (Stripe)'}
            </div>
          </div>

          {/* M-Pesa pending instructions */}
          {order.paymentMethod === 'MPESA' && !isPaid && (
            <div className="rounded-2xl border border-[#B66A3C]/20 bg-[#fdf5ee] p-4 text-sm leading-6 text-[#76675c]">
              <div className="font-semibold text-[#3d2a20] mb-1">📱 Check your phone</div>
              A payment prompt has been sent to your M-Pesa number. Enter your PIN to complete the
              payment. If you didn&apos;t receive it, contact us on WhatsApp and we&apos;ll help you
              complete the order.
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn-primary flex-1 text-center">
            Continue Shopping
          </Link>
          <a
            href={`https://wa.me/254700000000?text=${encodeURIComponent(
              `Hi TuloPots! I need help with order ${order.orderNumber}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex-1 text-center inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Support
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-[#b0a09a]">
          A confirmation email will be sent to {order.customerEmail}
        </p>
      </div>
    </main>
  );
}
