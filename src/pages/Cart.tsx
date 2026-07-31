import { useEffect, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Counter from "../components/layout/Counter";
import Loading from "../components/layout/Loading";
import OrderSummary from "../components/layout/OrderSummary.tsx";
import PageTitle from "../components/layout/PageTitle";

import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import type { ProductListItem } from "../types/product";
import { formatMoney, getCurrencySymbol } from "../utils/currency";
import { REQUIREMENT_CTA_URL } from "../utils/requirementCta";

const PLACEHOLDER_IMAGE = "/placeholder-image.svg";

const getImageSrc = (images: string[] = []) => {
  const firstImage = images.find(
    (image) => typeof image === "string" && image.trim().length > 0,
  );

  if (!firstImage) {
    return PLACEHOLDER_IMAGE;
  }

  return firstImage;
};

export default function Cart() {
  const currency = getCurrencySymbol();
  const navigate = useNavigate();

  const cartItems = useCartStore((state) => state.cartItems);
  const deleteItem = useCartStore((state) => state.deleteItem);

  const products = useProductStore((state) => state.products);
  const productDetailsByItemId = useProductStore(
    (state) => state.productDetailsByItemId,
  );
  const loadProductDetail = useProductStore(
    (state) => state.loadProductDetail,
  );

  const [cartArray, setCartArray] = useState<
    Array<ProductListItem & { quantity: number }>
  >([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isHydratingCart, setIsHydratingCart] = useState(
    Object.keys(cartItems).length > 0,
  );

  const handlePostRequirement = () => {
    window.open(REQUIREMENT_CTA_URL, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const missingItemIds = Object.keys(cartItems).filter(
      (itemId) =>
        !products.some((product) => product.itemId === itemId) &&
        !productDetailsByItemId[itemId],
    );

    if (missingItemIds.length === 0) {
      setIsHydratingCart(false);
      return;
    }

    let cancelled = false;
    setIsHydratingCart(true);

    Promise.allSettled(missingItemIds.map((itemId) => loadProductDetail(itemId)))
      .finally(() => {
        if (!cancelled) {
          setIsHydratingCart(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cartItems, loadProductDetail, productDetailsByItemId, products]);

  useEffect(() => {
    let total = 0;
    const items: Array<ProductListItem & { quantity: number }> = [];

    Object.entries(cartItems).forEach(([itemId, quantity]) => {
      const product =
        products.find((item) => item.itemId === itemId) ||
        productDetailsByItemId[itemId];

      if (product) {
        items.push({
          ...product,
          quantity,
        });

        total += product.price * Number(quantity);
      }
    });

    setCartArray(items);
    setTotalPrice(total);
  }, [cartItems, productDetailsByItemId, products]);

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

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <table className="w-full max-w-4xl table-auto text-slate-600">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left">Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th className="max-md:hidden">Remove</th>
              </tr>
            </thead>

            <tbody>
              {cartArray.map((item) => (
                <tr key={item.id}>
                  <td className="my-4 flex gap-3">
                    <div className="flex size-18 items-center justify-center rounded-md bg-slate-100">
                      <img
                        src={getImageSrc(item.images)}
                        alt={item.name}
                        className="h-14 w-auto"
                      />
                    </div>

                    <div>
                      <p className="max-sm:text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                      <p>
                        {currency}
                        {formatMoney(item.price)}
                      </p>
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
                    <button
                      onClick={() => deleteItem(item.itemId)}
                      className="rounded-full p-2.5 text-red-500 transition hover:bg-red-50 active:scale-95"
                    >
                      <Trash2Icon size={18} />
                    </button>
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
