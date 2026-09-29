'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/useSession';
import { formatPrice } from '@/lib/format';

export default function OrdersPage() {
  const { user, loading } = useSession();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (loading) return <main className="pt-40 pb-24 text-center text-ink/50">Loading…</main>;
  if (!user) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="text-ink/60 mb-6">Sign in to view your order history.</p>
        <Link href="/account/login" className="btn-primary">Sign In</Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique max-w-3xl">
        <p className="eyebrow mb-2">My Account</p>
        <h1 className="heading-serif text-3xl italic mb-8">Order History</h1>

        {ordersLoading ? (
          <p className="text-ink/50">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink/60 mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="card-boutique p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-ink/50">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs uppercase tracking-widest2 bg-gold/20 text-camel2 px-3 py-1 rounded-full">
                    {order.status}
                  </span>
                </div>
                <ul className="text-sm text-ink/70 space-y-1 mb-4">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} ({item.color}, {item.size}) × {item.quantity}
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-medium border-t border-black/10 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
