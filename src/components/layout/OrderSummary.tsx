import { PlusIcon, SquarePenIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddressModal from "./AddressModal";
import { useAddressStore, type Address } from "../../store/addressStore";
import { useCartStore } from "../../store/cartStore";

interface OrderSummaryProps {
  totalPrice: number;
}

interface Coupon {
  code: string;
  description: string;
  discount: number;
}

const OrderSummary = ({ totalPrice }: OrderSummaryProps) => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "Rs.";

  const navigate = useNavigate();

  const addresses = useAddressStore((state) => state.addresses);
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const selectAddress = useAddressStore((state) => state.selectAddress);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.cartItems);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [coupon] = useState<Coupon | null>(null);

  const selectedAddress = useMemo<Address | null>(() => {
    if (!selectedAddressId) return null;
    return (
      addresses.find((address) => address.id === selectedAddressId) ?? null
    );
  }, [addresses, selectedAddressId]);

  const handlePlaceOrder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const itemCount = Object.values(cartItems).reduce(
      (sum, quantity) => sum + Number(quantity),
      0,
    );

    const orderSummary = {
      totalAmount: coupon
        ? Number((totalPrice - (coupon.discount / 100) * totalPrice).toFixed(2))
        : totalPrice,
      paymentMethod,
      itemCount,
      distinctItems: Object.keys(cartItems).length,
      orderedAt: new Date().toISOString(),
      address: selectedAddress
        ? `${selectedAddress.name}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}`
        : "Address not selected",
    };

    clearCart();
    navigate("/order-success", {
      state: {
        orderSummary,
      },
    });
  };

  return (
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
              {selectedAddress.name}, {selectedAddress.city},{" "}
              {selectedAddress.state}, {selectedAddress.pincode}
            </p>

            <SquarePenIcon
              size={18}
              className="cursor-pointer"
              onClick={() => selectAddress(0)}
            />
          </div>
        ) : (
          <div>
            {addresses.length > 0 && (
              <select
                className="my-3 w-full rounded border border-slate-400 p-2 outline-none"
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (!Number.isNaN(id)) {
                    selectAddress(id);
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
              onClick={() => setShowAddressModal(true)}
              className="mt-1 flex items-center gap-1 text-slate-600"
            >
              Add Address
              <PlusIcon size={18} />
            </button>
          </div>
        )}
      </div>

      {/* <div className="border-b border-slate-200 pb-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1 text-slate-400">
            <p>Subtotal:</p>
            <p>Shipping:</p>
            {coupon && <p>Coupon:</p>}
          </div>

          <div className="flex flex-col gap-1 text-right font-medium">
            <p>
              {currency}
              {totalPrice.toLocaleString()}
            </p>

            <p>Free</p>

            {coupon && (
              <p>
                -{currency}
                {((coupon.discount / 100) * totalPrice).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {!coupon ? (
          <form
            onSubmit={handleCouponCode}
            className="mt-3 flex justify-center gap-3"
          >
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              className="w-full rounded border border-slate-400 p-1.5 outline-none"
            />

            <button className="rounded bg-slate-600 px-3 text-white transition-all hover:bg-slate-800 active:scale-95">
              Apply
            </button>
          </form>
        ) : (
          <div className="mt-2 flex w-full items-center justify-center gap-2 text-xs">
            <p>
              Code:
              <span className="ml-1 font-semibold">
                {coupon.code.toUpperCase()}
              </span>
            </p>

            <p>{coupon.description}</p>

            <XIcon
              size={18}
              className="cursor-pointer transition hover:text-red-700"
              onClick={() => setCoupon(null)}
            />
          </div>
        )}
      </div> */}

      <div className="flex justify-between py-4">
        <p>Total:</p>

        <p className="text-right font-medium">
          {currency}
          {coupon
            ? (totalPrice - (coupon.discount / 100) * totalPrice).toFixed(2)
            : totalPrice.toLocaleString()}
        </p>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="w-full rounded bg-slate-700 py-2.5 text-white transition-all hover:bg-slate-900 active:scale-95"
      >
        Place Order
      </button>

      {showAddressModal && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </div>
  );
};

export default OrderSummary;
