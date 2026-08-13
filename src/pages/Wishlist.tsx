import { ArrowRight, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Loading from "../components/layout/Loading";
import ProductCard from "../components/layout/ProductCard";
import { syncAccountCart, syncGuestCart } from "../services/cartSyncService";
import { clearWishlist as clearAccountWishlist } from "../services/wishlistService";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useWishlistStore } from "../store/wishlistStore";

const Wishlist = () => {
  const itemIds = useWishlistStore((state) => state.itemIds);
  const clearWishlist = useWishlistStore((state) => state.clearItems);
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.cartItems);
  const replaceCart = useCartStore((state) => state.replaceCart);
  const details = useProductStore((state) => state.productDetailsByItemId);
  const loadProductDetail = useProductStore((state) => state.loadProductDetail);
  const [isLoading, setIsLoading] = useState(itemIds.length > 0);
  const [pendingAction, setPendingAction] = useState<"move" | "clear" | null>(
    null,
  );
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const missing = itemIds.filter((itemId) => !details[itemId]);
    if (missing.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void Promise.allSettled(
      missing.map((itemId) => loadProductDetail(itemId)),
    ).then(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [details, itemIds, loadProductDetail]);

  const products = useMemo(
    () => itemIds.map((itemId) => details[itemId]).filter(Boolean),
    [details, itemIds],
  );

  const clearPersistedWishlist = async () => {
    if (user) await clearAccountWishlist();
    clearWishlist();
  };

  const handleMoveAllToCart = async () => {
    const nextCart = { ...cartItems };
    for (const product of products) {
      if (product.stockQuantity > 0 && !nextCart[product.itemId]) {
        nextCart[product.itemId] = 1;
      }
    }

    setPendingAction("move");
    setActionError("");
    try {
      const savedCart = user
        ? await syncAccountCart(nextCart)
        : await syncGuestCart(nextCart);
      replaceCart(
        savedCart
          ? Object.fromEntries(
              savedCart.items.map((item) => [item.itemId, item.quantity]),
            )
          : nextCart,
      );
      await clearPersistedWishlist();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to move wishlist items to the cart.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm("Remove all items from your wishlist?")) return;
    setPendingAction("clear");
    setActionError("");
    try {
      await clearPersistedWishlist();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to clear wishlist.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="text-[#0D542B]" />
            <h1 className="font-display text-3xl font-bold text-[#202522]">
              My Wishlist
            </h1>
          </div>
          <Link
            to="/products"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#0D542B] hover:text-[#093F20]"
          >
            Add more items
            <ArrowRight size={15} />
          </Link>
        </div>

        {products.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleMoveAllToCart()}
              disabled={pendingAction !== null}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#187A45] px-4 text-sm font-semibold text-white transition hover:bg-[#126638] disabled:cursor-wait disabled:opacity-60"
            >
              <ShoppingCart size={17} />
              {pendingAction === "move" ? "Moving..." : "Move all to cart"}
            </button>
            <button
              type="button"
              onClick={() => void handleClearWishlist()}
              disabled={pendingAction !== null}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#F1B7B2] bg-white px-4 text-sm font-semibold text-[#B42318] transition hover:bg-[#FDECEA] disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 size={17} />
              {pendingAction === "clear" ? "Clearing..." : "Clear wishlist"}
            </button>
          </div>
        )}
      </div>

      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-[#F1B7B2] bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]"
        >
          {actionError}
        </p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.itemId} product={product} />
          ))}
        </div>
      ) : (
        <div className="border-y border-[#D7DCD5] py-16 text-center">
          <p className="text-lg font-semibold text-[#202522]">
            Your wishlist is empty.
          </p>
          <Link
            to="/products"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-[#0D542B] px-5 text-sm font-semibold text-white hover:bg-[#093F20]"
          >
            Browse products
          </Link>
        </div>
      )}
    </main>
  );
};

export default Wishlist;
