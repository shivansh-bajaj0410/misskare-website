'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import AnimateIn from '@/components/AnimateIn';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique">
        <AnimateIn className="mb-10 text-center">
          <p className="eyebrow mb-2">Search Results</p>
          <h1 className="heading-serif text-3xl italic">
            {q ? `“${q}”` : 'What are you looking for?'}
          </h1>
        </AnimateIn>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-xl bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-ink/50 py-16">No pieces found. Try another search.</p>
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="pt-32 pb-24 text-center text-ink/50">Loading…</main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
