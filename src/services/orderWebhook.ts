import { authenticatedFetch } from "./authenticatedApi";

export interface PlaceOrderRequest {
  addressId: string;
  paymentMethod: "COD";
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export interface PlaceOrderResponse {
  orderReference: string;
  orderSummary: {
    totalAmount: number;
    paymentMethod: string;
    itemCount: number;
    distinctItems: number;
    orderedAt: string;
    address: string;
  };
}

export const placeOrder = async (
  payload: PlaceOrderRequest,
): Promise<PlaceOrderResponse> => {
  const response = await authenticatedFetch("/orders/place", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return (await response.json()) as PlaceOrderResponse;
};
