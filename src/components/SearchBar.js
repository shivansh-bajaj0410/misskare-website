'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/format';

export default function SearchBar({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.products || []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onNavigate?.();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={submit} className="card-boutique flex items-center px-4 py-3 bg-cream">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink/50 mr-3 shrink-0">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lace, satin, sets…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink/40"
        />
      </form>

      {query.trim().length >= 2 && (
        <div className="absolute mt-2 w-full card-boutique bg-cream overflow-hidden z-50 max-h-96 overflow-y-auto">
          {loading && <div className="p-4 text-sm text-ink/50">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="p-4 text-sm text-ink/50">No pieces found for “{query}”.</div>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              onClick={onNavigate}
              className="flex items-center gap-3 p-3 hover:bg-black/5 transition-colors"
            >
              <div className="relative w-12 h-14 rounded overflow-hidden shrink-0 bg-black/5">
                <Image src={JSON.parse(p.images)[0]} alt={p.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0">
                <p className="text-sm truncate">{p.name}</p>
                <p className="text-xs text-ink/50">{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
          {results.length > 0 && (
            <button
              onClick={submit}
              className="w-full text-left p-3 text-xs uppercase tracking-widest2 text-camel2 border-t border-black/5"
            >
              View all results →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
