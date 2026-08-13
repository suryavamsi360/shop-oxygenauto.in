import { authenticatedFetch } from "./authenticatedApi";

interface ShippingItem {
  itemId: string;
  quantity: number;
}

interface ShippingEstimateResponse {
  estimate: {
    amount: number;
    grossAmount: number;
    chargedWeightGrams: number;
    zone: string;
    originPincode: string;
    destinationPincode: string;
    weightGrams: number;
    fallbackUnits: number;
    paymentMethod: string;
  };
}

export const fetchShippingEstimate = async (payload: {
  addressId: string;
  items: ShippingItem[];
  paymentMethod: "COD";
}) => {
  const response = await authenticatedFetch("/shipping/estimate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as ShippingEstimateResponse;
  return result.estimate;
};