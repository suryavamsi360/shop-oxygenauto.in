import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendOrderWebhook,
  type OrderWebhookPayload,
} from "./orderWebhook";

const payload: OrderWebhookPayload = {
  orderSummary: {
    totalAmount: 1800,
    paymentMethod: "COD",
    itemCount: 2,
    distinctItems: 1,
    orderedAt: "2026-08-03T10:00:00.000Z",
    address: "Customer, Pune, Maharashtra, 411001",
  },
  customerAddress: {
    id: 1,
    name: "Customer",
    mobile: "9876543210",
    address1: "123 Main Road",
    address2: "Near Market",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    landmark: "Clock Tower",
    isDefault: true,
  },
  items: [
    {
      productId: "ITM-1",
      itemId: "ITM-1",
      name: "Brake Pad",
      quantity: 2,
      price: 900,
      salePrice: 900,
      mrp: 1000,
      discountPercent: 10,
      lineTotal: 1800,
      sku: "SKU-1",
      partCategory: "Brakes",
      maker: "Maruti Suzuki",
      lineConfiguration: "Alto 800 0.8 Petrol",
    },
  ],
  webhookSource: "oxygenauto-web-store",
};

describe("sendOrderWebhook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts complete item and customer address data as JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await sendOrderWebhook(payload);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, request] = fetchMock.mock.calls[0];
    expect(request.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(request.body)).toEqual(payload);
  });
});
