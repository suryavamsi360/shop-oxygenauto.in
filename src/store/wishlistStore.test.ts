import { beforeEach, describe, expect, it, vi } from "vitest";

const createLocalStorageMock = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  };
};

describe("wishlistStore persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  it("clears a guest wishlist and persists the empty state", async () => {
    const { useWishlistStore } = await import("./wishlistStore");
    useWishlistStore.getState().toggleItem("ITEM-101");

    useWishlistStore.getState().clearItems();

    expect(useWishlistStore.getState().itemIds).toEqual([]);
    expect(window.localStorage.getItem("oxygenauto-wishlist")).toBe("[]");
  });

  it("removes one guest wishlist item and persists the remaining items", async () => {
    const { useWishlistStore } = await import("./wishlistStore");
    useWishlistStore.getState().toggleItem("ITEM-101");
    useWishlistStore.getState().toggleItem("ITEM-202");

    useWishlistStore.getState().removeItem("ITEM-101");

    expect(useWishlistStore.getState().itemIds).toEqual(["ITEM-202"]);
    expect(window.localStorage.getItem("oxygenauto-wishlist")).toBe(
      '["ITEM-202"]',
    );
  });
});