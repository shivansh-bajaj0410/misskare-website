"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { filterAndSortProducts, formatINR } from "@/lib/products";

export default function ShopListing({ products, title }) {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [priceMax, setPriceMax] = useState(6000);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allColors = useMemo(
    () => [...new Set(products.flatMap((p) => p.colors.map((c) => c.name)))],
    [products]
  );
  const allSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes))],
    [products]
  );

  const filtered = useMemo(
    () =>
      filterAndSortProducts(products, {
        colors,
        sizes,
        maxPrice: priceMax,
        sort: sort === "featured" ? null : sort,
      }),
    [products, colors, sizes, priceMax, sort]
  );

  function toggle(list, setList, value) {
    setList((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-serif text-3xl">{title}</h1>
        <span className="text-[13px] text-ink/60">{filtered.length} styles</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          className="border border-ink/25 px-4 py-2 text-[12px] uppercase tracking-wide md:hidden"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          Filters
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-ink/25 bg-transparent px-3 py-2 text-[12px]"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} md:block`}>
          <div className="mb-6">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6B2737]">
              Color
            </h4>
            {allColors.map((c) => (
              <label key={c} className="mb-1.5 flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={colors.includes(c)}
                  onChange={() => toggle(colors, setColors, c)}
                />
                {c}
              </label>
            ))}
          </div>
          <div className="mb-6">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6B2737]">
              Size
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(sizes, setSizes, s)}
                  className={`border px-2.5 py-1 text-[11px] ${
                    sizes.includes(s) ? "border-ink bg-ink text-cream" : "border-ink/25"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6B2737]">
              Max price: {formatINR(priceMax)}
            </h4>
            <input
              type="range"
              min="1000"
              max="6000"
              step="100"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink/60">
              No styles match those filters — try widening your selection.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard product={p} key={p.id} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
