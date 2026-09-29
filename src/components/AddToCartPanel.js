'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/format';
import SizeGuideModal from './SizeGuideModal';

export default function AddToCartPanel({ product }) {
  const colors = JSON.parse(product.colors);
  const sizes = JSON.parse(product.sizes);
  const images = JSON.parse(product.images);
  const hasColors = !(colors.length === 1 && colors[0] === 'Default');

  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = async () => {
    if (!size) {
      setError('Please select a size');
      return;
    }

    const variant = product.variants?.find(
      (v) => (!hasColors || v.color === color) && v.size === size
    );

    if (!variant) {
      setError('That combination is not available');
      return;
    }
    if (!variant.available) {
      setError('This size is currently sold out');
      return;
    }

    setError('');
    setAdding(true);
    try {
      await addItem({
        variantId: variant.id,
        name: product.name,
        image: images[0],
        price: variant.price,
        color: hasColors ? color : '',
        size,
        quantity: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(err.message || 'Could not add this item to your bag');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <p className="eyebrow mb-3">{product.category?.name}</p>
      <h1 className="heading-serif text-3xl sm:text-4xl italic mb-3">{product.name}</h1>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-0.5 text-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}>
              <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-1z" stroke="currentColor" strokeWidth="1" />
            </svg>
          ))}
        </div>
        {product.reviewCount > 0 && <span className="text-xs text-ink/50">{product.reviewCount} reviews</span>}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <p className="text-2xl">{formatPrice(product.price)}</p>
        {product.compareAt && (
          <p className="text-lg text-ink/40 line-through">{formatPrice(product.compareAt)}</p>
        )}
      </div>

      <p className="text-ink/60 leading-relaxed mb-8">{product.description}</p>

      {hasColors && (
        <div className="mb-6">
          <p className="label-boutique">Color — {color}</p>
          <div className="flex gap-2.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={c}
                className={`w-9 h-9 rounded-full border-2 transition-all ${
                  color === c ? 'border-ink scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: swatchColor(c) }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="label-boutique mb-0">Size</p>
          <button
            onClick={() => setSizeGuideOpen(true)}
            className="text-xs text-camel2 underline underline-offset-2"
          >
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSize(s);
                setError('');
              }}
              className={`w-11 h-11 rounded-full border text-sm transition-colors ${
                size === s ? 'bg-ink text-cream border-ink' : 'border-black/20 hover:border-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
      </div>

      <button onClick={handleAdd} disabled={adding} className="btn-primary w-full sm:w-auto mt-6 disabled:opacity-60">
        {adding ? 'Adding…' : added ? 'Added to Bag ✓' : 'Add to Bag'}
      </button>

      {product.material && (
        <p className="text-xs text-ink/50 mt-6">Material: {product.material}</p>
      )}

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}

function swatchColor(name) {
  const map = {
    Camel: '#B98A5E',
    Black: '#1B1512',
    Blush: '#E9C6C0',
    Cream: '#F6EFE6',
  };
  return map[name] || '#B98A5E';
}
