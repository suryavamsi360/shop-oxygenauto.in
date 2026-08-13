import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  claimGuestCart,
  clearPersistentCart,
  syncAccountCart,
  syncGuestCart,
} from "../../services/cartSyncService";
import { mergeWishlist } from "../../services/wishlistService";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useProductStore } from "../../store/productStore";
import {
  useWishlistStore,
  WISHLIST_STORAGE_KEY,
} from "../../store/wishlistStore";

const toCartRecord = (
  items: Array<{ itemId: string; quantity: number }> = [],
) => Object.fromEntries(items.map((item) => [item.itemId, item.quantity]));

const CommerceStateInitializer = () => {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const userId = useAuthStore((state) => state.user?.id || "");
  const applyingRemoteCart = useRef(false);
  const previousUserId = useRef<string | null>(null);
  const lastConfirmedCart = useRef(useCartStore.getState().cartItems);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    if (!isInitialized || previousUserId.current === userId) return;
    previousUserId.current = userId;
    let cancelled = false;

    if (userId) {
      const localCart = useCartStore.getState().cartItems;
      const guestWishlist = useWishlistStore.getState().itemIds;
      const applyClaimedCart = (
        cart: Awaited<ReturnType<typeof claimGuestCart>>,
      ) => {
        if (cancelled) return;
        const confirmedCart = toCartRecord(cart?.items);
        lastConfirmedCart.current = confirmedCart;
        applyingRemoteCart.current = true;
        useCartStore.getState().replaceCart(confirmedCart);
        applyingRemoteCart.current = false;
      };

      void claimGuestCart(localCart)
        .then(applyClaimedCart)
        .catch((error) => {
          const message = error instanceof Error ? error.message : "";
          const unavailableItemId = message.match(
            /^Item (.+) is not available\.$/,
          )?.[1];
          if (!unavailableItemId || cancelled) {
            console.error("Unable to merge saved cart.", error);
            return;
          }

          const cleanedCart = { ...localCart };
          delete cleanedCart[unavailableItemId];
          useProductStore.getState().invalidateProduct(unavailableItemId);
          setSyncError(message);
          void claimGuestCart(cleanedCart)
            .then(applyClaimedCart)
            .catch((retryError) => {
              console.error("Unable to merge cleaned cart.", retryError);
            });
        });

      void mergeWishlist(guestWishlist)
        .then((wishlist) => {
          if (cancelled) return;
          useWishlistStore.getState().replaceItems(wishlist, true);
          window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
        })
        .catch((error) => {
          console.error("Unable to merge saved wishlist.", error);
        });
    } else {
      useWishlistStore.getState().useGuestWishlist();
      const localCart = useCartStore.getState().cartItems;
      if (Object.keys(localCart).length > 0) {
        void syncGuestCart(localCart)
          .then((cart) => {
            if (cart) lastConfirmedCart.current = toCartRecord(cart.items);
          })
          .catch((error) => {
            console.error("Unable to initialize guest cart.", error);
          });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [isInitialized, userId]);

  useEffect(() => {
    if (!isInitialized) return;
    let timeoutId: number | undefined;
    const unsubscribe = useCartStore.subscribe((state, previousState) => {
      if (
        applyingRemoteCart.current ||
        state.cartItems === previousState.cartItems
      ) {
        return;
      }
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const isAuthenticated = Boolean(useAuthStore.getState().user);
        const operation =
          Object.keys(state.cartItems).length === 0
            ? clearPersistentCart(isAuthenticated)
            : isAuthenticated
              ? syncAccountCart(state.cartItems)
              : syncGuestCart(state.cartItems);
        void operation
          .then((cart) => {
            lastConfirmedCart.current = cart ? toCartRecord(cart.items) : {};
            setSyncError("");
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Unable to save cart changes.";
            const unavailableItemId = message.match(
              /^Item (.+) is not available\.$/,
            )?.[1];
            if (unavailableItemId) {
              useProductStore.getState().invalidateProduct(unavailableItemId);
            }
            applyingRemoteCart.current = true;
            useCartStore
              .getState()
              .replaceCart({ ...lastConfirmedCart.current });
            applyingRemoteCart.current = false;
            setSyncError(message);
            console.error("Unable to save cart changes.", error);
          });
      }, 700);
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [isInitialized]);

  if (!syncError) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-md border border-[#F1B7B2] bg-white p-4 text-sm text-[#7A271A] shadow-xl"
    >
      <p className="min-w-0 flex-1">{syncError}</p>
      <button
        type="button"
        onClick={() => setSyncError("")}
        title="Dismiss"
        aria-label="Dismiss cart message"
        className="flex size-7 shrink-0 items-center justify-center rounded text-[#7A271A] hover:bg-[#FDECEA]"
      >
        <X size={17} />
      </button>
    </div>
  );
};

export default CommerceStateInitializer;
