import { create } from "zustand";

interface CartState {
  total: number;
  cartItems: Record<string, number>;

  addToCart: (itemId: string, maxStock?: number) => void;
  removeFromCart: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
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

  addToCart: (itemId, maxStock) =>
    set((state) => {
      const cartItems = { ...state.cartItems };
      const currentQuantity = cartItems[itemId] || 0;

      if (typeof maxStock === "number" && currentQuantity >= maxStock) {
        return state;
      }

      cartItems[itemId] = currentQuantity + 1;
      const nextState = {
        cartItems,
        total: state.total + 1,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }

      return nextState;
    }),

  removeFromCart: (itemId) =>
    set((state) => {
      if (!state.cartItems[itemId]) return state;

      const cartItems = { ...state.cartItems };

      cartItems[itemId]--;

      if (cartItems[itemId] === 0) {
        delete cartItems[itemId];
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

  deleteItem: (itemId) =>
    set((state) => {
      if (!state.cartItems[itemId]) return state;

      const cartItems = { ...state.cartItems };
      const quantity = cartItems[itemId];

      delete cartItems[itemId];

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
    set(() => {
      const nextState = {
        total: 0,
        cartItems: {},
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }

      return nextState;
    }),
}));
