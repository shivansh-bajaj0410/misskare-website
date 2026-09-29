'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/useSession';
import { useWishlistStore } from '@/lib/wishlistStore';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { user, loading } = useSession();
  const guestIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (user) {
      fetch('/api/wishlist')
        .then((res) => res.json())
        .then((data) => setProducts((data.items || []).map((i) => i.product)))
        .finally(() => setFetching(false));
    } else if (guestIds.length) {
      fetch(`/api/products?ids=${guestIds.join(',')}`)
        .then((res) => res.json())
        .then((data) => setProducts(data.products || []))
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [user, loading, guestIds]);

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique">
        <p className="eyebrow mb-2 text-center">My Account</p>
        <h1 className="heading-serif text-3xl italic mb-2 text-center">Wishlist</h1>
        {!user && (
          <p className="text-center text-xs text-ink/50 mb-10">
            Saved on this device.{' '}
            <Link href="/account/login" className="underline text-camel2">Sign in</Link> to sync across devices.
          </p>
        )}
        {user && <div className="mb-10" />}

        {loading || fetching ? (
          <p className="text-center text-ink/50 py-16">Loading…</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink/60 mb-6">Nothing saved yet — tap the heart on any piece to add it here.</p>
            <Link href="/shop" className="btn-primary">Browse the Edit</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
