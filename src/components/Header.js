'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cartStore';
import SearchBar from './SearchBar';

const NAV_LINKS = [
  { href: '/shop/bras', label: 'Bras' },
  { href: '/shop/sets', label: 'Sets' },
  { href: '/shop/sleepwear', label: 'Sleepwear' },
  { href: '/shop/shapewear', label: 'Shapewear' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const itemCount = useCartStore((s) => s.itemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = isHome && !scrolled && !mobileOpen && !searchOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        transparent ? 'bg-transparent py-6' : 'bg-cream/95 backdrop-blur-md shadow-sm py-3'
      }`}
    >
      <div className="container-boutique flex items-center justify-between gap-4">
        <button
          className={`lg:hidden ${transparent ? 'text-cream' : 'text-ink'}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-widest2 transition-colors ${
                transparent ? 'text-cream/90 hover:text-goldlight' : 'text-ink/80 hover:text-camel'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className={`heading-serif text-2xl sm:text-3xl italic tracking-wide ${
            transparent ? 'text-cream' : 'text-ink'
          }`}
        >
          MissKare
        </Link>

        <div className="flex items-center gap-4 sm:gap-5">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className={transparent ? 'text-cream' : 'text-ink'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className={`hidden sm:block ${transparent ? 'text-cream' : 'text-ink'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 20s-7-4.35-9.5-8.8C.8 7.8 2.2 4 6 4c2 0 3.5 1.2 4 2.4C10.5 5.2 12 4 14 4c3.8 0 5.2 3.8 3.5 7.2C19 15.65 12 20 12 20z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </Link>

          <Link
            href="/account"
            aria-label="Account"
            className={`hidden sm:block ${transparent ? 'text-cream' : 'text-ink'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.5 20c1.5-4 4-6 7.5-6s6 2 7.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>

          <button
            aria-label="Cart"
            onClick={toggleCart}
            className={`relative ${transparent ? 'text-cream' : 'text-ink'}`}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
              <path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-camel text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="container-boutique mt-4">
          <SearchBar onNavigate={() => setSearchOpen(false)} />
        </div>
      )}

      {mobileOpen && (
        <nav className="lg:hidden container-boutique mt-5 flex flex-col gap-4 pb-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm uppercase tracking-widest2 text-ink/80 py-1"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-widest2 text-ink/80 py-1">
            Account
          </Link>
          <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-widest2 text-ink/80 py-1">
            Wishlist
          </Link>
        </nav>
      )}
    </header>
  );
}
