import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticatedFetchMock } = vi.hoisted(() => ({
  authenticatedFetchMock: vi.fn(),
}));

vi.mock("./authenticatedApi", () => ({
  authenticatedFetch: authenticatedFetchMock,
}));

import {
  placeOrder,
  type PlaceOrderRequest,
} from "./orderWebhook";

const payload: PlaceOrderRequest = {
  addressId: "address-1",
  paymentMethod: "COD",
  items: [
    {
      itemId: "ITM-1",
      quantity: 2,
    },
  ],
};

describe("placeOrder", () => {
  beforeEach(() => {
    authenticatedFetchMock.mockReset();
  });

  it("posts item IDs, quantities, and the saved address ID", async () => {
    authenticatedFetchMock.mockResolvedValue({
      json: async () => ({
        orderReference: "ORDER-1",
        orderSummary: {},
      }),
    });

    await placeOrder(payload);

    expect(authenticatedFetchMock).toHaveBeenCalledOnce();
    const [path, request] = authenticatedFetchMock.mock.calls[0];
    expect(path).toBe("/orders/place");
    expect(request.method).toBe("POST");
    expect(JSON.parse(request.body)).toEqual(payload);
  });
});
