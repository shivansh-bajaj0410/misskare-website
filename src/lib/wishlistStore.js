'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const ids = get().productIds;
        if (ids.includes(productId)) {
          set({ productIds: ids.filter((id) => id !== productId) });
        } else {
          set({ productIds: [...ids, productId] });
        }
      },
      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: 'misskare-wishlist' }
  )
);
