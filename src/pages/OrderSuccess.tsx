import { CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { formatMoney, getCurrencySymbol } from "../utils/currency";

interface OrderSummaryState {
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  distinctItems: number;
  orderedAt: string;
  address: string;
}

interface LocationState {
  orderSummary?: OrderSummaryState;
}

const OrderSuccess = () => {
  const currency = getCurrencySymbol();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const orderSummary = state?.orderSummary;

  return (
    <div className="mx-6 flex min-h-[75vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={52} />

        <h1 className="text-3xl font-semibold text-slate-800">
          Thanks for your order
        </h1>

        <p className="mt-3 text-slate-600">
          Your request has been placed successfully. We will share estimate and
          quotation with you soon.
        </p>

        {orderSummary && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4 text-left text-sm text-slate-700">
            <h2 className="mb-3 text-base font-semibold text-slate-800">
              Order Summary
            </h2>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <p>
                <span className="font-medium">Total:</span> {currency}
                {formatMoney(orderSummary.totalAmount, true)}
              </p>
              <p>
                <span className="font-medium">Payment:</span>{" "}
                {orderSummary.paymentMethod}
              </p>
              <p>
                <span className="font-medium">Items:</span>{" "}
                {orderSummary.itemCount}
              </p>
              <p>
                <span className="font-medium">Products:</span>{" "}
                {orderSummary.distinctItems}
              </p>
              <p className="sm:col-span-2">
                <span className="font-medium">Address:</span>{" "}
                {orderSummary.address}
              </p>
              <p className="sm:col-span-2">
                <span className="font-medium">Ordered At:</span>{" "}
                {new Date(orderSummary.orderedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/products"
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Continue Shopping
          </Link>

          <Link
            to="/cart"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
