'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import AnimateIn from './AnimateIn';

const ALL_COLORS = ['Camel', 'Black', 'Blush', 'Cream'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ShopBrowser({ category, categories = [] }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState(category || '');
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sort, setSort] = useState('featured');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (colors.length) params.set('colors', colors.join(','));
    if (sizes.length) params.set('sizes', sizes.join(','));
    params.set('maxPrice', String(maxPrice * 100));
    params.set('sort', sort);
    return params.toString();
  }, [activeCategory, colors, sizes, maxPrice, sort]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?${query}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [query]);

  const toggle = (arr, setArr, value) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-8">
      {/* Mobile filter toggle */}
      <button
        onClick={() => setFiltersOpen((v) => !v)}
        className="lg:hidden btn-outline w-full justify-between"
      >
        Filters & Sort
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-8`}>
        {!category && (
          <div>
            <p className="label-boutique">Category</p>
            <div className="space-y-2">
              {categories.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={activeCategory === c.slug}
                    onChange={() => setActiveCategory(c.slug)}
                  />
                  {c.name}
                </label>
              ))}
              <button
                onClick={() => setActiveCategory('')}
                className="text-xs text-camel2 underline mt-1"
              >
                Clear category
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="label-boutique">Color</p>
          <div className="space-y-2">
            {ALL_COLORS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={colors.includes(c)}
                  onChange={() => toggle(colors, setColors, c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="label-boutique">Size</p>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggle(sizes, setSizes, s)}
                className={`w-9 h-9 rounded-full border text-xs transition-colors ${
                  sizes.includes(s)
                    ? 'bg-ink text-cream border-ink'
                    : 'border-black/20 hover:border-ink'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-boutique">Max Price: ${maxPrice}</p>
          <input
            type="range"
            min="20"
            max="200"
            step="5"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-camel"
          />
        </div>

        <div>
          <p className="label-boutique">Sort By</p>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-boutique">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-xl bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-ink/50">No pieces match those filters yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
            {products.map((p, i) => (
              <AnimateIn key={p.id} delay={Math.min(i * 0.04, 0.3)}>
                <ProductCard product={p} />
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
