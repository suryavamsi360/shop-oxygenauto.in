import { beforeEach, describe, expect, it, vi } from "vitest";

const createLocalStorageMock = () => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

describe("cartStore persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    const localStorage = createLocalStorageMock();
    vi.stubGlobal("window", { localStorage });
  });

  it("persists cleared cart to localStorage", async () => {
    const { useCartStore } = await import("./cartStore");

    useCartStore.getState().addToCart("ITEM-101");
    useCartStore.getState().clearCart();

    const persisted = window.localStorage.getItem("oxygenauto-cart");
    expect(persisted).toBe(JSON.stringify({ total: 0, cartItems: {} }));
  });
});
