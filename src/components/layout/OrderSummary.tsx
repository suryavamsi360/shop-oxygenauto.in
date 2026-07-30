import { PlusIcon, SquarePenIcon } from "lucide-react";
import { useMemo, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import AddressModal from "./AddressModal";
import { useAddressStore, type Address } from "../../store/addressStore";
import { useCartStore } from "../../store/cartStore";
import { useProductStore } from "../../store/productStore";
import {
  sendOrderWebhook,
  type OrderWebhookPayload,
} from "../../services/orderWebhook";
import { formatMoney, getCurrencySymbol } from "../../utils/currency";

interface OrderSummaryProps {
  totalPrice: number;
}

interface Coupon {
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
}

const COUPONS: Coupon[] = [
  {
    code: "OXYGEN10",
    description: "10% off on orders above Rs. 1,500",
    kind: "percent",
    value: 10,
    minOrderAmount: 1500,
    maxDiscount: 750,
  },
  {
    code: "PARTNER150",
    description: "Flat Rs. 150 off on orders above Rs. 2,000",
    kind: "flat",
    value: 150,
    minOrderAmount: 2000,
  },
];

const OrderSummary = ({ totalPrice }: OrderSummaryProps) => {
  const currency = getCurrencySymbol();
  const navigate = useNavigate();

  const addresses = useAddressStore((state) => state.addresses);
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const selectAddress = useAddressStore((state) => state.selectAddress);
  const clearSelectedAddress = useAddressStore(
    (state) => state.clearSelectedAddress,
  );
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const products = useProductStore((state) => state.products);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAddress = useMemo<Address | null>(() => {
    if (!selectedAddressId) return null;
    return (
      addresses.find((address) => address.id === selectedAddressId) ?? null
    );
  }, [addresses, selectedAddressId]);

  const orderItems = useMemo(() => {
    return Object.entries(cartItems)
      .map(([itemId, quantity]) => {
        const product = products.find((item) => item.itemId === itemId);

        if (!product) {
          return null;
        }

        return {
          productId: product.itemId,
          itemId: product.itemId,
          name: product.name,
          quantity,
          price: product.price,
          mrp: product.mrp,
          discountPercent: product.discountPercent,
          lineTotal: Number((product.price * quantity).toFixed(2)),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cartItems, products]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) {
      return 0;
    }

    if (totalPrice < appliedCoupon.minOrderAmount) {
      return 0;
    }

    if (appliedCoupon.kind === "percent") {
      const rawDiscount = (appliedCoupon.value / 100) * totalPrice;
      if (typeof appliedCoupon.maxDiscount === "number") {
        return Math.min(rawDiscount, appliedCoupon.maxDiscount);
      }
      return rawDiscount;
    }

    return Math.min(appliedCoupon.value, totalPrice);
  }, [appliedCoupon, totalPrice]);

  const payableTotal = useMemo(() => {
    return Number((totalPrice - couponDiscount).toFixed(2));
  }, [totalPrice, couponDiscount]);

  const handleCouponCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = couponCodeInput.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("Enter a coupon code.");
      return;
    }

    const matchingCoupon = COUPONS.find(
      (coupon) => coupon.code === normalizedCode,
    );

    if (!matchingCoupon) {
      setCouponError("Invalid coupon code.");
      return;
    }

    if (totalPrice < matchingCoupon.minOrderAmount) {
      setCouponError(
        `This coupon requires a minimum order of ${currency}${formatMoney(matchingCoupon.minOrderAmount)}.`,
      );
      return;
    }

    setAppliedCoupon(matchingCoupon);
    setCouponError("");
    setCouponCodeInput(normalizedCode);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponCodeInput("");
  };

  const handlePlaceOrder = async (
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();

    if (!selectedAddress) {
      setFormError(
        "Please select or add an address before placing your order.",
      );
      return;
    }

    if (orderItems.length === 0) {
      setFormError("Your cart is empty. Add items before placing your order.");
      return;
    }

    setFormError("");
    setSubmitError("");
    setIsSubmitting(true);

    const sanitizedAddress = {
      ...selectedAddress,
      name: selectedAddress.name.trim(),
      mobile: selectedAddress.mobile.trim(),
      address1: selectedAddress.address1.trim(),
      address2: selectedAddress.address2?.trim() || "",
      city: selectedAddress.city.trim(),
      state: selectedAddress.state.trim(),
      pincode: selectedAddress.pincode.trim(),
      landmark: selectedAddress.landmark?.trim() || "",
    };

    const itemCount = Object.values(cartItems).reduce(
      (sum, quantity) => sum + Number(quantity),
      0,
    );

    const orderSummary = {
      totalAmount: payableTotal,
      paymentMethod,
      itemCount,
      distinctItems: Object.keys(cartItems).length,
      orderedAt: new Date().toISOString(),
      address: `${sanitizedAddress.name}, ${sanitizedAddress.city}, ${sanitizedAddress.state}, ${sanitizedAddress.pincode}`,
    };

    const webhookPayload: OrderWebhookPayload = {
      orderSummary,
      customerAddress: sanitizedAddress,
      items: orderItems,
      webhookSource: "oxygenauto-web-store",
    };

    try {
      const result = await sendOrderWebhook(webhookPayload);

      clearCart();
      navigate("/order-success", {
        state: {
          orderSummary,
          submissionStatus: result.submissionStatus || result.status,
          webhookError: result.webhookError,
          retryPayload: result.retryable ? webhookPayload : null,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Order submission failed.";

      setSubmitError(message);
      clearCart();
      navigate("/order-success", {
        state: {
          orderSummary,
          submissionStatus: "partial_success",
          webhookError: message,
          retryPayload: webhookPayload,
        },
      });
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
          <input
            id="COD"
            type="radio"
            checked={paymentMethod === "COD"}
            onChange={() => setPaymentMethod("COD")}
            className="accent-gray-500"
          />
          <label htmlFor="COD" className="cursor-pointer">
            COD
          </label>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <input
            id="ONLINE"
            name="payment"
            type="radio"
            checked={paymentMethod === "ONLINE"}
            onChange={() => setPaymentMethod("ONLINE")}
            className="accent-gray-500"
            disabled
          />
          <label htmlFor="ONLINE" className="cursor-pointer text-slate-400">
            Online payment
          </label>
        </div>

        <div className="my-4 border-y border-slate-200 py-4 text-slate-400">
          <p>Address</p>

          {selectedAddress ? (
            <div className="flex items-center gap-2">
              <p>
                {selectedAddress.name}, {selectedAddress.city}, {" "}
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
                  className="my-3 w-full rounded border border-slate-400 p-2 outline-none"
                  onChange={(event) => {
                    if (!event.target.value) {
                      clearSelectedAddress();
                      return;
                    }

                    const id = Number(event.target.value);
                    if (!Number.isNaN(id)) {
                      selectAddress(id);
                    }
                  }}
                >
                  <option value="">Select Address</option>

                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name}, {address.city}, {address.state}, {" "}
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
        </div>

        <div className="border-b border-slate-200 pb-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-1 text-slate-400">
              <p>Subtotal:</p>
              <p>Shipping:</p>
              {appliedCoupon && <p>Coupon:</p>}
            </div>

            <div className="flex flex-col gap-1 text-right font-medium">
              <p>
                {currency}
                {formatMoney(totalPrice, true)}
              </p>

              <p>Free</p>

              {appliedCoupon && (
                <p>
                  -{currency}
                  {formatMoney(couponDiscount, true)}
                </p>
              )}
            </div>
          </div>

          {!appliedCoupon ? (
            <>
              <form
                onSubmit={handleCouponCode}
                className="mt-3 flex justify-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCodeInput}
                  onChange={(event) => setCouponCodeInput(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
                />

                <button
                  type="submit"
                  className="rounded-md bg-slate-800 px-4 py-2 font-medium text-white transition hover:bg-slate-900"
                >
                  Apply
                </button>
              </form>

              {couponError && (
                <p className="mt-2 text-xs text-rose-600">{couponError}</p>
              )}
            </>
          ) : (
            <div className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
              <div>
                <p className="font-semibold">{appliedCoupon.code}</p>
                <p className="text-xs">{appliedCoupon.description}</p>
              </div>

              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-semibold underline underline-offset-2"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 text-slate-700">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>
              {currency}
              {formatMoney(payableTotal, true)}
            </span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePlaceOrder}
            className="mt-5 w-full rounded-md bg-slate-800 px-4 py-3 font-medium text-white transition hover:bg-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>

          {(formError || submitError) && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {formError || submitError}
            </div>
          )}
        </div>
      </div>

      {showAddressModal && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </>
  );
};

export default OrderSummary;