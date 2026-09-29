'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/format';

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const loading = useCartStore((s) => s.loading);
  const goToCheckout = useCartStore((s) => s.goToCheckout);
  const hydrate = useCartStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cream z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
              <h2 className="heading-serif text-xl italic">
                Your Bag ({lines.reduce((n, l) => n + l.quantity, 0)})
              </h2>
              <button onClick={closeCart} aria-label="Close cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <p className="text-ink/50">Your bag is feeling light.</p>
                  <Link href="/shop" onClick={closeCart} className="btn-outline">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-6">
                  {lines.map((item) => (
                    <li key={item.lineId} className="flex gap-4">
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-black/5 shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-ink/50 mt-0.5">
                          {item.color ? `${item.color} · ` : ''}
                          {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-black/15 rounded-full">
                            <button
                              disabled={loading}
                              className="w-7 h-7 flex items-center justify-center text-sm disabled:opacity-40"
                              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              disabled={loading}
                              className="w-7 h-7 flex items-center justify-center text-sm disabled:opacity-40"
                              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.lineId)}
                        aria-label="Remove item"
                        disabled={loading}
                        className="text-ink/30 hover:text-ink/70 self-start disabled:opacity-40"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-black/10 px-6 py-5 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-ink/60">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-1.5 border-t border-black/10">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-ink/40">Promo codes and shipping are entered at checkout.</p>
                </div>

                <button onClick={goToCheckout} disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Updating…' : 'Checkout'}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
