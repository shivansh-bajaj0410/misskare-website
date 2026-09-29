"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const CATEGORIES = [
  { name: "Bras", slug: "bras" },
  { name: "Sets", slug: "sets" },
  { name: "Sleepwear", slug: "sleepwear" },
  { name: "Shapewear", slug: "shapewear" },
];

export default function Nav() {
  const { count, setDrawerOpen } = useCart();
  const { ids } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-ink/10 bg-cream/95 px-5 py-2.5 backdrop-blur sm:px-8">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/" className="font-serif text-2xl italic tracking-tight">
          MissKare
        </Link>
      </div>

      <div className="hidden gap-7 md:flex">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="text-[13px] tracking-wide text-ink/75 transition hover:text-ink hover:border-b hover:border-amber"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link href="/search" aria-label="Search" className="text-ink">
          <Search size={18} />
        </Link>
        <Link href="/account/wishlist" aria-label="Wishlist" className="relative text-ink">
          <Heart size={18} fill={ids.length ? "#6B2737" : "none"} color={ids.length ? "#6B2737" : "currentColor"} />
          {ids.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6B2737] text-[10px] text-cream">
              {ids.length}
            </span>
          )}
        </Link>
        <button
          aria-label="Cart"
          className="relative text-ink"
          onClick={() => setDrawerOpen(true)}
        >
          <ShoppingBag size={18} />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6B2737] text-[10px] text-cream">
              {count}
            </span>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 top-full z-40 flex w-full flex-col gap-1 border-b border-ink/10 bg-cream px-5 py-4 md:hidden">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className="py-2 text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
