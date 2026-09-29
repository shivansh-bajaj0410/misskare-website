"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "misskare-cart-v1";

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.payload || state;

    case "ADD": {
      const { product, size, color, qty } = action.payload;
      const lineId = `${product.id}::${size}::${color}`;
      const existing = state.items.find((i) => i.lineId === lineId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            lineId,
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size,
            color,
            qty,
          },
        ],
      };
    }

    case "UPDATE_QTY": {
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.lineId === action.payload.lineId
              ? { ...i, qty: Math.max(1, i.qty + action.payload.delta) }
              : i
          )
          .filter((i) => i.qty > 0),
      };
    }

    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.lineId !== action.payload) };

    case "APPLY_PROMO":
      return { ...state, promo: action.payload };

    case "CLEAR":
      return { items: [], promo: null };

    default:
      return state;
  }
}

const PROMO_CODES = {
  MISSKARE10: 0.1,
  WELCOME15: 0.15,
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], promo: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", payload: JSON.parse(raw) });
    } catch (e) {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountRate = state.promo ? PROMO_CODES[state.promo] || 0 : 0;
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;
  const count = state.items.reduce((sum, i) => sum + i.qty, 0);

  function addItem(product, { size, color, qty = 1 }) {
    dispatch({ type: "ADD", payload: { product, size, color, qty } });
    setDrawerOpen(true);
  }

  function updateQty(lineId, delta) {
    dispatch({ type: "UPDATE_QTY", payload: { lineId, delta } });
  }

  function removeItem(lineId) {
    dispatch({ type: "REMOVE", payload: lineId });
  }

  function applyPromo(code) {
    const normalized = code.trim().toUpperCase();
    if (PROMO_CODES[normalized]) {
      dispatch({ type: "APPLY_PROMO", payload: normalized });
      return { ok: true };
    }
    return { ok: false, message: "That code isn't valid." };
  }

  function clearCart() {
    dispatch({ type: "CLEAR" });
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        promo: state.promo,
        subtotal,
        discount,
        total,
        count,
        drawerOpen,
        setDrawerOpen,
        addItem,
        updateQty,
        removeItem,
        applyPromo,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
