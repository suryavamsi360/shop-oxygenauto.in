import { create } from "zustand";

interface CartState {
  total: number;
  cartItems: Record<number, number>;

  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  deleteItem: (productId: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "oxygenauto-cart";

const getStoredCart = (): Pick<CartState, "total" | "cartItems"> => {
  if (typeof window === "undefined") return { total: 0, cartItems: {} };

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return { total: 0, cartItems: {} };

    return JSON.parse(storedValue) as Pick<CartState, "total" | "cartItems">;
  } catch {
    return { total: 0, cartItems: {} };
  }
};

export const useCartStore = create<CartState>((set) => ({
  total: getStoredCart().total,
  cartItems: getStoredCart().cartItems,

  addToCart: (productId) =>
    set((state) => {
      const cartItems = { ...state.cartItems };

      cartItems[productId] = (cartItems[productId] || 0) + 1;
      const nextState = {
        cartItems,
        total: state.total + 1,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }

      return nextState;
    }),

  removeFromCart: (productId) =>
    set((state) => {
      if (!state.cartItems[productId]) return state;

      const cartItems = { ...state.cartItems };

      cartItems[productId]--;

      if (cartItems[productId] === 0) {
        delete cartItems[productId];
      }

      const nextState = {
        cartItems,
        total: state.total - 1,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }

      return nextState;
    }),

  deleteItem: (productId) =>
    set((state) => {
      if (!state.cartItems[productId]) return state;

      const cartItems = { ...state.cartItems };
      const quantity = cartItems[productId];

      delete cartItems[productId];

      const nextState = {
        cartItems,
        total: state.total - quantity,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }

      return nextState;
    }),

  clearCart: () =>
    set({
      total: 0,
      cartItems: {},
    }),
}));
