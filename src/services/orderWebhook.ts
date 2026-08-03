const ORDER_WEBHOOK_URL = import.meta.env.VITE_ORDER_WEBHOOK_URL;

interface OrderCustomerAddress {
  id: number;
  name: string;
  mobile: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}

export interface OrderWebhookPayload {
  orderSummary: {
    totalAmount: number;
    paymentMethod: string;
    itemCount: number;
    distinctItems: number;
    orderedAt: string;
    address: string;
  };
  customerAddress: OrderCustomerAddress;
  items: Array<{
    productId: string;
    itemId: string;
    name: string;
    quantity: number;
    price: number;
    salePrice: number;
    mrp: number;
    discountPercent: number;
    lineTotal: number;
    sku: string;
    partCategory: string;
    maker: string;
    lineConfiguration: string;
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