import { API_BASE_URL } from "../config/api";
import { authenticatedFetch } from "./authenticatedApi";

const CART_TOKEN_KEY = "oxygenauto-cart-session";

export interface SyncedCart {
  id: string;
  status: "active" | "abandoned" | "converted" | "cleared";
  checkoutStage: string;
  items: Array<{ itemId: string; quantity: number }>;
}

interface CartResponse {
  cart: SyncedCart | null;
  guestToken?: string;
}

const toItems = (cartItems: Record<string, number>) =>
  Object.entries(cartItems).map(([itemId, quantity]) => ({ itemId, quantity }));

const getGuestCartToken = () =>
  typeof window === "undefined"
    ? ""
    : window.localStorage.getItem(CART_TOKEN_KEY) || "";

const setGuestCartToken = (token: string) => {
  if (typeof window !== "undefined") {
    if (token) window.localStorage.setItem(CART_TOKEN_KEY, token);
    else window.localStorage.removeItem(CART_TOKEN_KEY);
  }
};

const parseResponse = async (response: Response) => {
  const payload = (await response.json().catch(() => null)) as
    | (CartResponse & { message?: string })
    | null;
  if (!response.ok) {
    throw new Error(payload?.message || `Cart request failed (${response.status}).`);
  }
  return payload;
};

const syncGuestCart = async (cartItems: Record<string, number>) => {
  let guestToken = getGuestCartToken();
  if (!guestToken) {
    const response = await fetch(`${API_BASE_URL}/carts/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: toItems(cartItems) }),
    });
    const payload = await parseResponse(response);
    guestToken = payload?.guestToken || "";
    setGuestCartToken(guestToken);
    return payload?.cart || null;
  }

  const response = await fetch(`${API_BASE_URL}/carts/session`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Cart-Token": guestToken,
    },
    body: JSON.stringify({ items: toItems(cartItems) }),
  });
  return (await parseResponse(response))?.cart || null;
};

const syncAccountCart = async (cartItems: Record<string, number>) => {
  const response = await authenticatedFetch("/account/cart", {
    method: "PUT",
    body: JSON.stringify({ items: toItems(cartItems) }),
  });
  return ((await response.json()) as CartResponse).cart;
};

const claimGuestCart = async (cartItems: Record<string, number>) => {
  const response = await authenticatedFetch("/account/cart/claim", {
    method: "POST",
    body: JSON.stringify({
      guestToken: getGuestCartToken(),
      items: toItems(cartItems),
    }),
  });
  const cart = ((await response.json()) as CartResponse).cart;
  setGuestCartToken("");
  return cart;
};

const clearPersistentCart = async (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    await authenticatedFetch("/account/cart", { method: "DELETE" });
    return;
  }

  const guestToken = getGuestCartToken();
  if (!guestToken) return;
  const response = await fetch(`${API_BASE_URL}/carts/session`, {
    method: "DELETE",
    headers: { "X-Cart-Token": guestToken },
  });
  if (!response.ok) throw new Error("Unable to clear the saved cart.");
  setGuestCartToken("");
};

const updateCartStage = async (stage: string) => {
  await authenticatedFetch("/account/cart/stage", {
    method: "PATCH",
    body: JSON.stringify({ stage }),
  });
};

export {
  claimGuestCart,
  clearPersistentCart,
  getGuestCartToken,
  syncAccountCart,
  syncGuestCart,
  updateCartStage,
};