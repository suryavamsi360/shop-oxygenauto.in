import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  sendOrderWebhook,
  type OrderWebhookPayload,
} from "../services/orderWebhook";
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
  submissionStatus?: "success" | "partial_success" | "error";
  webhookError?: string;
  retryPayload?: OrderWebhookPayload | null;
}

const OrderSuccess = () => {
  const currency = getCurrencySymbol();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const orderSummary = state?.orderSummary;
  const submissionStatus = state?.submissionStatus;
  const webhookError = state?.webhookError;
  const retryPayload = state?.retryPayload;

  const [retryMessage, setRetryMessage] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!retryPayload) {
      return;
    }

    setIsRetrying(true);
    setRetryMessage("");

    try {
      const result = await sendOrderWebhook(retryPayload);

      if (result.submissionStatus === "success" || result.status === "success") {
        setRetryMessage("Order forwarded successfully.");
        return;
      }

      setRetryMessage(
        result.webhookError || "Order forwarding is still pending.",
      );
    } catch (error) {
      setRetryMessage(
        error instanceof Error ? error.message : "Retry failed.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="mx-6 flex min-h-[75vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={52} />

        <h1 className="text-3xl font-semibold text-slate-800">
          Thanks for your order
        </h1>

        <p className="mt-3 text-slate-600">
          {submissionStatus === "partial_success"
            ? "Your order was captured, but the processing webhook needs another try."
            : "Your order has been placed successfully. We will share shipping details with you soon."}
        </p>

        {webhookError && submissionStatus === "partial_success" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
            <p className="font-semibold">Processing issue</p>
            <p className="mt-1">{webhookError}</p>
          </div>
        )}

        {retryMessage && (
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-left text-sm text-sky-900">
            {retryMessage}
          </div>
        )}

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

          {submissionStatus === "partial_success" && retryPayload && (
            <button
              type="button"
              onClick={() => void handleRetry()}
              disabled={isRetrying}
              className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRetrying ? "Retrying..." : "Retry order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;