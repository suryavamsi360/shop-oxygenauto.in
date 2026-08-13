import { LoaderCircle, PlusIcon, SquarePenIcon, Truck } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import AddressModal from "./AddressModal";
import { placeOrder } from "../../services/orderWebhook";
import { fetchShippingEstimate } from "../../services/shippingService";
import { useAddressStore, type Address } from "../../store/addressStore";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useProductStore } from "../../store/productStore";
import { formatMoney, getCurrencySymbol } from "../../utils/currency";

interface OrderSummaryProps {
  totalPrice: number;
}

const OrderSummary = ({ totalPrice }: OrderSummaryProps) => {
  const currency = getCurrencySymbol();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const addresses = useAddressStore((state) => state.addresses);
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const addressesError = useAddressStore((state) => state.error);
  const loadAddresses = useAddressStore((state) => state.loadAddresses);
  const resetAddresses = useAddressStore((state) => state.reset);
  const selectAddress = useAddressStore((state) => state.selectAddress);
  const clearSelectedAddress = useAddressStore(
    (state) => state.clearSelectedAddress,
  );
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const products = useProductStore((state) => state.products);
  const productDetailsByItemId = useProductStore(
    (state) => state.productDetailsByItemId,
  );

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingAmount, setShippingAmount] = useState<number | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const selectedAddress = useMemo<Address | null>(() => {
    if (!selectedAddressId) return null;
    return (
      addresses.find((address) => address.id === selectedAddressId) ?? null
    );
  }, [addresses, selectedAddressId]);

  const resolvedCartItemCount = useMemo(
    () =>
      Object.keys(cartItems).filter(
        (itemId) =>
          products.some((item) => item.itemId === itemId) ||
          productDetailsByItemId[itemId],
      ).length,
    [cartItems, productDetailsByItemId, products],
  );

  const shippingItems = useMemo(
    () =>
      Object.entries(cartItems).map(([itemId, quantity]) => ({
        itemId,
        quantity,
      })),
    [cartItems],
  );
  const totalAmount =
    shippingAmount === null ? null : totalPrice + shippingAmount;

  useEffect(() => {
    if (user) {
      void loadAddresses();
    } else if (isAuthInitialized) {
      resetAddresses();
    }
  }, [isAuthInitialized, loadAddresses, resetAddresses, user]);

  useEffect(() => {
    let cancelled = false;

    if (!user || !selectedAddress || shippingItems.length === 0) {
      setShippingAmount(null);
      setShippingError("");
      setIsShippingLoading(false);
      return;
    }

    setShippingAmount(null);
    setShippingError("");
    setIsShippingLoading(true);

    const timeoutId = window.setTimeout(() => {
      void fetchShippingEstimate({
        addressId: selectedAddress.id,
        items: shippingItems,
        paymentMethod: "COD",
      })
        .then((estimate) => {
          if (!cancelled) {
            setShippingAmount(estimate.amount);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setShippingError(
              error instanceof Error
                ? error.message
                : "Shipping estimate is unavailable.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsShippingLoading(false);
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [selectedAddress, shippingItems, user]);

  const handlePlaceOrder = async (
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();

    if (!user) {
      navigate("/login?returnTo=%2Fcart");
      return;
    }
    if (!selectedAddress) {
      setFormError(
        "Please select or add an address before placing your order.",
      );
      return;
    }
    if (resolvedCartItemCount === 0) {
      setFormError("Your cart is empty. Add items before placing your order.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const result = await placeOrder({
        addressId: selectedAddress.id,
        paymentMethod: "COD",
        items: Object.entries(cartItems).map(([itemId, quantity]) => ({
          itemId,
          quantity,
        })),
      });

      clearCart();
      navigate("/order-success", {
        state: {
          orderSummary: result.orderSummary,
          orderReference: result.orderReference,
        },
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to place your order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50/30 p-7 text-sm text-slate-500 lg:max-w-[340px]">
        <h2 className="text-xl font-medium text-slate-600">Payment Summary</h2>

        <p className="my-4 text-xs text-slate-400">Payment Method</p>
        <div className="flex items-center gap-2">
          <input id="COD" type="radio" checked readOnly />
          <label htmlFor="COD">COD</label>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input id="ONLINE" type="radio" disabled />
          <label htmlFor="ONLINE" className="text-slate-400">
            Online payment
          </label>
        </div>

        <div className="my-4 border-y border-slate-200 py-4 text-slate-400">
          <p>Address</p>

          {!user ? (
            <button
              type="button"
              onClick={() => navigate("/login?returnTo=%2Fcart")}
              className="mt-2 font-semibold text-[#0D542B]"
            >
              Sign in to save a delivery address
            </button>
          ) : selectedAddress ? (
            <div className="flex items-center gap-2">
              <p>
                {selectedAddress.name}, {selectedAddress.city},{" "}
                {selectedAddress.state}, {selectedAddress.pincode}
              </p>
              <SquarePenIcon
                size={18}
                className="cursor-pointer"
                onClick={clearSelectedAddress}
              />
            </div>
          ) : (
            <div>
              {addresses.length > 0 && (
                <select
                  value={selectedAddressId || ""}
                  className="my-3 w-full rounded border border-slate-400 p-2 outline-none"
                  onChange={(event) => {
                    if (event.target.value) {
                      selectAddress(event.target.value);
                    } else {
                      clearSelectedAddress();
                    }
                  }}
                >
                  <option value="">Select Address</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name}, {address.city}, {address.state},{" "}
                      {address.pincode}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="mt-1 flex items-center gap-1 text-slate-600"
              >
                Add Address
                <PlusIcon size={18} />
              </button>
            </div>
          )}

          {addressesError && (
            <p className="mt-2 text-xs text-red-600">{addressesError}</p>
          )}
        </div>

        <div className="border-b border-slate-200 pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-700">
                {currency}
                {formatMoney(totalPrice, true)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-slate-500">
                <Truck size={16} />
                Estimated shipping
              </span>
              <span
                className="text-right font-medium text-slate-700"
                role="status"
                aria-live="polite"
              >
                {isShippingLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <LoaderCircle size={14} className="animate-spin" />
                    Calculating
                  </span>
                ) : shippingAmount !== null ? (
                  `${currency}${formatMoney(shippingAmount, true)}`
                ) : selectedAddress ? (
                  "Unavailable"
                ) : (
                  "Select address"
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 text-slate-700">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total amount</span>
            <span>
              {totalAmount === null
                ? "—"
                : `${currency}${formatMoney(totalAmount, true)}`}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Shipping estimate includes applicable Delhivery charges and taxes.
          </p>

          <button
            type="button"
            disabled={
              isSubmitting ||
              !isAuthInitialized ||
              Boolean(
                selectedAddress &&
                (isShippingLoading || shippingAmount === null),
              )
            }
            onClick={handlePlaceOrder}
            className="mt-5 w-full rounded-md bg-slate-800 px-4 py-3 font-medium text-white transition hover:bg-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Placing Order..."
              : user
                ? "Place Order"
                : "Sign in to place order"}
          </button>

          {formError && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {formError}
            </div>
          )}
          {shippingError && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {shippingError}
            </div>
          )}
        </div>
      </div>

      {showAddressModal && user && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </>
  );
};

export default OrderSummary;
