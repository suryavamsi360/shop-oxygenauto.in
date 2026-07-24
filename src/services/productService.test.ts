import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchProductDetail, fetchProducts } from "./productService";

describe("productService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses catalog response with products, pagination, and facets", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              id: "ITM-1",
              itemId: "ITM-1",
              name: "Sample Product",
              mrp: 1000,
              price: 900,
              discountPercent: 10,
              images: ["/placeholder-image.svg"],
              maker: "Honda",
              model: "City",
              className: "Fuel System",
              configuration: "1.5 VTEC",
              year: "2020",
              fuel: "Petrol",
              category: "Engine",
              subCategory: "Fuel Pump",
              stockQuantity: 5,
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 30,
            totalPages: 1,
          },
          facets: {
            maker: [{ value: "Honda", count: 1 }],
            model: [{ value: "City", count: 1 }],
            year: [{ value: "2020", count: 1 }],
            fuelType: [{ value: "Petrol", count: 1 }],
            group: [{ value: "Engine", count: 1 }],
            className: [{ value: "Fuel System", count: 1 }],
            subClass: [{ value: "Fuel Pump", count: 1 }],
          },
        }),
      }),
    );

    const result = await fetchProducts({ page: 1, limit: 30, maker: "Honda" });

    expect(result.products).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.facets.maker[0].value).toBe("Honda");
  });

  it("parses product detail response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          product: {
            id: "ITM-1",
            itemId: "ITM-1",
            sourceReferenceId: "REF-1",
            name: "Sample Product",
            description: "Sample description",
            partNumber: "PN-1",
            sku: "SKU-1",
            stockQuantity: 5,
            condition: "Refurbished",
            chassisNumber: "CH-1",
            mrp: 1000,
            price: 900,
            discountPercent: 10,
            images: ["/placeholder-image.svg"],
            maker: "Honda",
            model: "City",
            className: "Fuel System",
            configuration: "1.5 VTEC",
            year: "2020",
            fuel: "Petrol",
            category: "Engine",
            subCategory: "Fuel Pump",
            compatibilityList: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
          },
        }),
      }),
    );

    const detail = await fetchProductDetail("ITM-1");

    expect(detail.itemId).toBe("ITM-1");
    expect(detail.description).toBe("Sample description");
  });
});
