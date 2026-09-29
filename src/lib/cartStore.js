'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCart, getCart, addCartLines, updateCartLines, removeCartLines } from './shopifyQueries';

// Cart state now mirrors a real Shopify Cart (see shopifyQueries.js).
// `cartId` is the only thing persisted to localStorage — everything else is
// re-synced from Shopify so it never goes stale across devices/tabs.
export const useCartStore = create(
  persist(
    (set, get) => ({
      cartId: null,
      lines: [],
      checkoutUrl: null,
      subtotal: 0,
      total: 0,
      currency: 'USD',
      isOpen: false,
      loading: false,
      error: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      // Call once on app mount to re-sync with Shopify (cart may have
      // changed or expired since the last visit).
      hydrate: async () => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          const cart = await getCart(cartId);
          if (!cart) {
            set({ cartId: null, lines: [], checkoutUrl: null, subtotal: 0, total: 0 });
            return;
          }
          set({
            lines: cart.lines,
            checkoutUrl: cart.checkoutUrl,
            subtotal: cart.subtotal,
            total: cart.total,
            currency: cart.currency,
          });
        } catch {
          // Cart may have been deleted/expired on Shopify's side — start fresh next add.
          set({ cartId: null, lines: [], checkoutUrl: null });
        }
      },

      // item: { variantId, name, image, price, color, size, quantity }
      addItem: async (item) => {
        set({ loading: true, error: null });
        try {
          const { cartId } = get();
          const lineInput = [{ merchandiseId: item.variantId, quantity: item.quantity || 1 }];
          const cart = cartId ? await addCartLines(cartId, lineInput) : await createCart(lineInput);
          set({
            cartId: cart.id,
            lines: cart.lines,
            checkoutUrl: cart.checkoutUrl,
            subtotal: cart.subtotal,
            total: cart.total,
            currency: cart.currency,
            isOpen: true,
            loading: false,
          });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateQuantity: async (lineId, quantity) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ loading: true, error: null });
        try {
          const cart =
            quantity <= 0
              ? await removeCartLines(cartId, [lineId])
              : await updateCartLines(cartId, [{ id: lineId, quantity }]);
          set({
            lines: cart.lines,
            checkoutUrl: cart.checkoutUrl,
            subtotal: cart.subtotal,
            total: cart.total,
            loading: false,
          });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      removeItem: async (lineId) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ loading: true, error: null });
        try {
          const cart = await removeCartLines(cartId, [lineId]);
          set({
            lines: cart.lines,
            checkoutUrl: cart.checkoutUrl,
            subtotal: cart.subtotal,
            total: cart.total,
            loading: false,
          });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      itemCount: () => get().lines.reduce((n, l) => n + l.quantity, 0),

      // Sends the shopper to Shopify's real hosted checkout.
      goToCheckout: () => {
        const { checkoutUrl } = get();
        if (checkoutUrl) window.location.href = checkoutUrl;
      },
    }),
    { name: 'misskare-cart', partialize: (s) => ({ cartId: s.cartId }) }
  )
);
