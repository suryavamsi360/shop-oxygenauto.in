import { useEffect, useMemo, useState } from "react";
import { Heart, Trash2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import Counter from "../components/layout/Counter";
import Loading from "../components/layout/Loading";
import OrderSummary from "../components/layout/OrderSummary.tsx";
import PageTitle from "../components/layout/PageTitle";

import {
  clearPersistentCart,
  syncAccountCart,
  syncGuestCart,
} from "../services/cartSyncService";
import { addWishlistItem } from "../services/wishlistService";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useWishlistStore } from "../store/wishlistStore";
import type { ProductListItem } from "../types/product";
import { formatMoney, getCurrencySymbol } from "../utils/currency";
import { getProductImage } from "../utils/productImage";
import { REQUIREMENT_CTA_URL } from "../utils/requirementCta";

export default function Cart() {
  const currency = getCurrencySymbol();
  const navigate = useNavigate();

  const cartItems = useCartStore((state) => state.cartItems);
  const deleteItem = useCartStore((state) => state.deleteItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const replaceCart = useCartStore((state) => state.replaceCart);
  const user = useAuthStore((state) => state.user);
  const addWishlistStoreItem = useWishlistStore((state) => state.addItem);

  const products = useProductStore((state) => state.products);
  const productDetailsByItemId = useProductStore(
    (state) => state.productDetailsByItemId,
  );
  const loadProductDetail = useProductStore((state) => state.loadProductDetail);

  const [isHydratingCart, setIsHydratingCart] = useState(
    Object.keys(cartItems).length > 0,
  );
  const [movingItemId, setMovingItemId] = useState("");
  const [moveError, setMoveError] = useState("");

  const { cartArray, totalPrice } = useMemo(() => {
    let total = 0;
    const items: Array<ProductListItem & { quantity: number }> = [];

    Object.entries(cartItems).forEach(([itemId, quantity]) => {
      const product =
        products.find((item) => item.itemId === itemId) ||
        productDetailsByItemId[itemId];

      if (product) {
        items.push({ ...product, quantity });
        total += product.price * Number(quantity);
      }
    });

    return { cartArray: items, totalPrice: total };
  }, [cartItems, productDetailsByItemId, products]);

  const handlePostRequirement = () => {
    window.open(REQUIREMENT_CTA_URL, "_blank", "noopener,noreferrer");
  };

  const handleClearCart = () => {
    if (window.confirm("Remove all items from your cart?")) {
      clearCart();
    }
  };

  const handleMoveToWishlist = async (itemId: string) => {
    const nextCart = { ...cartItems };
    delete nextCart[itemId];
    setMovingItemId(itemId);
    setMoveError("");

    try {
      if (user) await addWishlistItem(itemId);
      addWishlistStoreItem(itemId);

      if (Object.keys(nextCart).length === 0) {
        await clearPersistentCart(Boolean(user));
        replaceCart({});
      } else {
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
      }
    } catch (error) {
      setMoveError(
        error instanceof Error
          ? error.message
          : "Unable to move this item to the wishlist.",
      );
    } finally {
      setMovingItemId("");
    }
  };

  useEffect(() => {
    let cancelled = false;
    const missingItemIds = Object.keys(cartItems).filter(
      (itemId) =>
        !products.some((product) => product.itemId === itemId) &&
        !productDetailsByItemId[itemId],
    );

    if (missingItemIds.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) setIsHydratingCart(false);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) setIsHydratingCart(true);
    });

    Promise.allSettled(
      missingItemIds.map((itemId) => loadProductDetail(itemId)),
    ).finally(() => {
      if (!cancelled) {
        setIsHydratingCart(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cartItems, loadProductDetail, productDetailsByItemId, products]);

  if (isHydratingCart) {
    return <Loading />;
  }

  if (cartArray.length === 0) {
    return (
      <div className="mx-6 flex min-h-[80vh] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-8 py-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-700 sm:text-4xl">
            Your cart is empty
          </h1>
          <p className="text-sm text-slate-500">
            Browse our products and add something you love.
          </p>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 active:scale-95"
          >
            Go to All Products
          </button>

          <button
            type="button"
            onClick={handlePostRequirement}
            className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            Post your requirement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-6 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <PageTitle
          heading="My Cart"
          text="items in your cart"
          linkText="Add more"
        />

        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            onClick={handleClearCart}
            variant="danger"
            size="sm"
          >
            <Trash2Icon size={15} />
            Clear cart
          </Button>
        </div>

        {moveError && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-[#F1B7B2] bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]"
          >
            {moveError}
          </p>
        )}

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <table className="w-full max-w-4xl table-auto text-slate-600">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left">Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th className="max-md:hidden">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cartArray.map((item) => (
                <tr key={item.id}>
                  <td className="my-4 flex gap-3">
                    <Link
                      to={`/products/${encodeURIComponent(item.itemId)}`}
                      aria-label={`View ${item.partTitle || item.partName || item.name}`}
                      className="flex size-18 shrink-0 items-center justify-center rounded-md bg-slate-100 transition hover:ring-2 hover:ring-[#0D542B]/30"
                    >
                      <img
                        src={getProductImage(item.images)}
                        alt={item.partTitle || item.partName || item.name}
                        className="h-14 w-auto"
                      />
                    </Link>

                    <div>
                      <Link
                        to={`/products/${encodeURIComponent(item.itemId)}`}
                        className="max-sm:text-sm font-medium text-slate-700 transition hover:text-[#0D542B] hover:underline"
                      >
                        {item.partTitle || item.partName || item.name}
                      </Link>
                      {item.partName &&
                        item.partName.toLowerCase() !==
                          (
                            item.partTitle ||
                            item.partName ||
                            item.name
                          ).toLowerCase() && (
                          <p className="text-xs text-slate-500">
                            {item.partName}
                          </p>
                        )}
                      <p className="text-xs text-slate-500">{item.category}</p>
                      <p>
                        {currency}
                        {formatMoney(item.price)}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleMoveToWishlist(item.itemId)}
                        disabled={Boolean(movingItemId)}
                        className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#B8D8C2] px-3 text-xs font-semibold text-[#187A45] transition hover:bg-[#E5F3EA] disabled:cursor-wait disabled:opacity-50 md:hidden"
                      >
                        <Heart size={15} />
                        {movingItemId === item.itemId
                          ? "Moving..."
                          : "Move to wishlist"}
                      </button>
                    </div>
                  </td>

                  <td className="text-center">
                    <Counter
                      itemId={item.itemId}
                      maxStock={item.stockQuantity}
                    />
                  </td>

                  <td className="text-center">
                    {currency}
                    {formatMoney(item.price * item.quantity)}
                  </td>

                  <td className="text-center max-md:hidden">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleMoveToWishlist(item.itemId)}
                        disabled={Boolean(movingItemId)}
                        title="Move to wishlist"
                        className="inline-flex min-h-7 items-center justify-center gap-1 whitespace-nowrap rounded px-1.5 text-[11px] font-semibold text-[#187A45] transition hover:bg-[#E5F3EA] disabled:cursor-wait disabled:opacity-50"
                      >
                        <Heart size={13} />
                        {movingItemId === item.itemId
                          ? "Moving..."
                          : "To Wishlist"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.itemId)}
                        title="Remove from cart"
                        className="inline-flex min-h-7 items-center justify-center gap-1 rounded px-1.5 text-[11px] font-semibold text-red-500 transition hover:bg-red-50 active:scale-95"
                      >
                        <Trash2Icon size={13} />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <OrderSummary totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}
