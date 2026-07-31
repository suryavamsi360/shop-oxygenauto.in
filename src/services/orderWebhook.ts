const API_BASE_URL =
  import.meta.env.VITE_ORDER_API_URL ||
  import.meta.env.VITE_PRODUCTS_API_BASE_URL ||
  import.meta.env.VITE_PRODUCTS_API_URL ||
  "http://localhost:8000/api";

const ORDER_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/orders/place`;

export interface OrderWebhookPayload {
  orderSummary: {
    totalAmount: number;
    paymentMethod: string;
    itemCount: number;
    distinctItems: number;
    orderedAt: string;
    address: string;
  };
  customerAddress: unknown;
  items: Array<{
    productId: string;
    itemId: string;
    name: string;
    quantity: number;
    price: number;
    mrp: number;
    discountPercent: number;
    lineTotal: number;
  }>;
  webhookSource: string;
}

export interface OrderWebhookResponse {
  status: "success" | "partial_success" | "error";
  submissionStatus?: "success" | "partial_success" | "error";
  forwarded?: boolean;
  retryable?: boolean;
  webhookStatus?: string;
  webhookStatusCode?: number;
  webhookError?: string;
}

export const sendOrderWebhook = async (
  payload: OrderWebhookPayload,
): Promise<OrderWebhookResponse> => {
  const response = await fetch(ORDER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = (await response.json()) as OrderWebhookResponse;

  if (!response.ok && response.status !== 207) {
    throw new Error(
      responseBody.webhookError ||
        `Order request failed with status ${response.status}`,
    );
  }

  return responseBody;
};