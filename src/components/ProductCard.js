'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { useWishlistStore } from '@/lib/wishlistStore';
import { useEffect, useState } from 'react';

export default function ProductCard({ product, priority = false }) {
  const images = JSON.parse(product.images);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggle = useWishlistStore((s) => s.toggle);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-black/5">
          <Image
            src={images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {images[1] && (
            <Image
              src={images[1]}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-cream/90 text-ink text-[10px] uppercase tracking-widest2 px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {product.compareAt && (
            <span className="absolute top-3 right-3 bg-camel text-cream text-[10px] uppercase tracking-widest2 px-2.5 py-1 rounded-full">
              Sale
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggle(product.id)}
        aria-label="Toggle wishlist"
        className="absolute top-3 right-3 sm:top-3 sm:right-3 w-8 h-8 rounded-full bg-cream/90 flex items-center justify-center shadow-sm"
        style={{ display: product.compareAt ? 'none' : 'flex' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={mounted && isWishlisted ? '#B98A5E' : 'none'}>
          <path
            d="M12 20s-7-4.35-9.5-8.8C.8 7.8 2.2 4 6 4c2 0 3.5 1.2 4 2.4C10.5 5.2 12 4 14 4c3.8 0 5.2 3.8 3.5 7.2C19 15.65 12 20 12 20z"
            stroke="#B98A5E"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      <Link href={`/product/${product.slug}`} className="block mt-3">
        <p className="text-sm font-medium truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-ink/70">{formatPrice(product.price)}</p>
          {product.compareAt && (
            <p className="text-xs text-ink/40 line-through">{formatPrice(product.compareAt)}</p>
          )}
        </div>
      </Link>
    </div>
  );
}
