import { authenticatedFetch } from "./authenticatedApi";

interface WishlistResponse {
  wishlist: Array<{ itemId: string }>;
}

const listWishlist = async () => {
  const response = await authenticatedFetch("/account/wishlist");
  return ((await response.json()) as WishlistResponse).wishlist.map(
    (entry) => entry.itemId,
  );
};

const addWishlistItem = async (itemId: string) => {
  await authenticatedFetch("/account/wishlist", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });
};

const removeWishlistItem = async (itemId: string) => {
  await authenticatedFetch(`/account/wishlist/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });
};

const clearWishlist = async () => {
  await authenticatedFetch("/account/wishlist", { method: "DELETE" });
};

const mergeWishlist = async (itemIds: string[]) => {
  const response = await authenticatedFetch("/account/wishlist/merge", {
    method: "POST",
    body: JSON.stringify({ itemIds }),
  });
  return ((await response.json()) as WishlistResponse).wishlist.map(
    (entry) => entry.itemId,
  );
};

export {
  addWishlistItem,
  clearWishlist,
  listWishlist,
  mergeWishlist,
  removeWishlistItem,
};