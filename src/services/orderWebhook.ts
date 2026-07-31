const ORDER_WEBHOOK_URL = import.meta.env.VITE_ORDER_WEBHOOK_URL;

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

export const sendOrderWebhook = async (
  payload: OrderWebhookPayload,
): Promise<void> => {
  if (!ORDER_WEBHOOK_URL) {
    throw new Error("Order webhook is not configured.");
  }

  const response = await fetch(ORDER_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Order request failed with status ${response.status}.`);
  }
};