'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { useCartStore } from '@/lib/cartStore';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setOrder(data?.order || null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <main className="pt-40 pb-24">
      <div className="container-boutique max-w-xl text-center">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#8C6541" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="eyebrow mb-2">Order Confirmed</p>
        <h1 className="heading-serif text-3xl italic mb-4">Thank you for shopping MissKare</h1>

        {loading ? (
          <p className="text-ink/50">Loading your order…</p>
        ) : order ? (
          <>
            <p className="text-ink/60 mb-8">
              A confirmation has been sent to <strong>{order.email}</strong>. Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <div className="card-boutique p-6 text-left mb-8">
              <ul className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} ({item.color}, {item.size}) × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-black/10 pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="text-xs text-ink/50 mt-4">
                Shipping to {order.shippingLine1}, {order.shippingCity}, {order.shippingState} {order.shippingPostal}
              </p>
            </div>
          </>
        ) : (
          <p className="text-ink/60 mb-8">Your payment was received. Order details will arrive by email.</p>
        )}

        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={<main className="pt-40 pb-24 text-center text-ink/50">Loading…</main>}
    >
      <SuccessContent />
    </Suspense>
  );
}
