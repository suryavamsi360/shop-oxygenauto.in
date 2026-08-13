import { create } from "zustand";

const STORAGE_KEY = "oxygenauto-wishlist";

const readGuestWishlist = () => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value)
      ? [...new Set(value.map((itemId) => String(itemId).trim()).filter(Boolean))]
      : [];
  } catch {
    return [];
  }
};

interface WishlistState {
  itemIds: string[];
  isAccountMode: boolean;
  replaceItems: (itemIds: string[], isAccountMode?: boolean) => void;
  clearItems: () => void;
  addItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (itemId: string) => boolean;
  useGuestWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  itemIds: readGuestWishlist(),
  isAccountMode: false,

  replaceItems: (itemIds, isAccountMode) =>
    set((state) => ({
      itemIds: [...new Set(itemIds)],
      isAccountMode: isAccountMode ?? state.isAccountMode,
    })),

  clearItems: () =>
    set((state) => {
      if (!state.isAccountMode && typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "[]");
      }
      return { itemIds: [] };
    }),

  addItem: (itemId) =>
    set((state) => {
      if (state.itemIds.includes(itemId)) return state;
      const itemIds = [...state.itemIds, itemId];
      if (!state.isAccountMode && typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itemIds));
      }
      return { itemIds };
    }),

  removeItem: (itemId) =>
    set((state) => {
      const itemIds = state.itemIds.filter((value) => value !== itemId);
      if (!state.isAccountMode && typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itemIds));
      }
      return { itemIds };
    }),

  toggleItem: (itemId) => {
    let isAdded = false;
    set((state) => {
      isAdded = !state.itemIds.includes(itemId);
      const itemIds = isAdded
        ? [...state.itemIds, itemId]
        : state.itemIds.filter((value) => value !== itemId);
      if (!state.isAccountMode && typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itemIds));
      }
      return { itemIds };
    });
    return isAdded;
  },

  useGuestWishlist: () =>
    set({ itemIds: readGuestWishlist(), isAccountMode: false }),
}));

export { STORAGE_KEY as WISHLIST_STORAGE_KEY };