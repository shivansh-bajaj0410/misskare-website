"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { formatINR } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import SizeGuideModal from "./SizeGuideModal";
import ProductCard from "./ProductCard";

export default function ProductDetail({ product, related }) {
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0].name);
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wished = isWishlisted(product.id);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  function handleAddToCart() {
    addItem(product, { size, color, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div
            className="relative mb-3 aspect-[3/4.2] cursor-zoom-in overflow-hidden border border-ink/10 bg-cream/60"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover object-top transition-transform duration-200"
              style={
                zoom
                  ? {
                      transform: "scale(1.9)",
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : undefined
              }
            />
          </div>
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-20 w-16 overflow-hidden border ${
                  activeImg === i ? "border-ink" : "border-ink/15"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-wide text-ink/50">{product.sku}</div>
          <h1 className="mb-2 font-serif text-3xl">{product.name}</h1>
          <div className="mb-4 flex items-center gap-2 text-[13px]">
            <span className="text-amber">
              {"★".repeat(Math.round(product.rating))}
              <span className="text-ink/20">{"★".repeat(5 - Math.round(product.rating))}</span>
            </span>
            <span className="text-ink/50">({product.reviewCount} reviews)</span>
          </div>
          <div className="mb-6 flex items-center gap-3 font-serif text-2xl">
            {formatINR(product.price)}
            {product.compareAt && (
              <span className="text-base text-ink/40 line-through">{formatINR(product.compareAt)}</span>
            )}
          </div>

          <p className="mb-6 max-w-md text-sm leading-relaxed text-ink/70">{product.description}</p>

          <div className="mb-5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6B2737]">
              Color: {color}
            </div>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    color === c.name ? "border-ink" : "border-transparent"
                  }`}
                  style={{ background: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6B2737]">
                Size: {size}
              </span>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="text-[11px] underline underline-offset-2"
              >
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`border px-3 py-1.5 text-[12px] ${
                    size === s ? "border-ink bg-ink text-cream" : "border-ink/25"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center border border-ink/25">
              <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-ink py-3 text-[13px] uppercase tracking-wide text-cream transition hover:bg-[#6B2737]"
            >
              {added ? "Added ✓" : "Add to bag"}
            </button>
            <button
              onClick={() => toggle(product.id)}
              className="flex h-11 w-11 items-center justify-center border border-ink/25"
              aria-label="Toggle wishlist"
            >
              <Heart size={17} fill={wished ? "#6B2737" : "none"} color={wished ? "#6B2737" : "#221118"} />
            </button>
          </div>

          <details className="border-t border-ink/10 py-3 text-sm">
            <summary className="cursor-pointer font-medium">Shipping & returns</summary>
            <p className="mt-2 text-ink/65">
              Free shipping on orders over ₹2,500. Easy 30-day returns on
              unworn items with tags attached.
            </p>
          </details>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-serif text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard product={p} key={p.id} index={i} />
            ))}
          </div>
        </div>
      )}

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
