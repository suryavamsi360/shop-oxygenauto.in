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
              itemId: "ITM-1",
              sku: "SKU-1",
              partTitle: "Front Pulse Generator",
              itemName: "Sample Product",
              mrp: 1000,
              salePrice: 900,
              discountPercent: 10,
              images: ["/placeholder-image.svg"],
              className: "Fuel System",
              groupName: "Engine",
              subClass: "Fuel Pump",
              partCategory: "Fuel Pump",
              quantity: 5,
              availableStock: 3,
              compatibility: {
                maker: "Honda",
                model: "City",
                configuration: "1.5 VTEC",
                year: 2020,
                fuelType: "Petrol",
              },
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
            lineConfiguration: [
              { value: "City 1.5 VTEC", count: 1 },
            ],
            year: [{ value: "2020", count: 1 }],
            partCategory: [{ value: "Fuel Pump", count: 1 }],
          },
        }),
      }),
    );

    const result = await fetchProducts({ page: 1, limit: 30, maker: "Honda" });

    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toMatchObject({
      name: "Front Pulse Generator",
      partName: "Sample Product",
      sku: "SKU-1",
      price: 900,
      stockQuantity: 5,
      category: "Engine",
      maker: "Honda",
      partCategory: "Fuel Pump",
    });
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.facets.maker[0].value).toBe("Honda");
    expect(Object.keys(result.facets).sort()).toEqual([
      "lineConfiguration",
      "maker",
      "partCategory",
      "year",
    ]);
  });

  it("normalizes missing facet arrays", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [],
          facets: {
            maker: [{ value: "Honda", count: 1 }],
          },
        }),
      }),
    );

    const result = await fetchProducts();

    expect(result.facets).toEqual({
      maker: [{ value: "Honda", count: 1 }],
      lineConfiguration: [],
      year: [],
      partCategory: [],
    });
  });

  it("serializes the current item exclusion", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ products: [], facets: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchProducts({
      maker: " Honda ",
      excludeItemId: " ITM-1 ",
      limit: 10,
    });

    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestUrl.searchParams.get("maker")).toBe("Honda");
    expect(requestUrl.searchParams.get("excludeItemId")).toBe("ITM-1");
    expect(requestUrl.searchParams.get("limit")).toBe("10");
  });

  it("parses product detail response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          product: {
            itemId: "ITM-1",
            partTitle: "Front Pulse Generator",
            itemName: "Sample Product",
            salesDescription: "Sample description",
            partNumber: "PN-1",
            referenceId: "REF-123",
            sku: "SKU-1",
            quantity: 5,
            availableStock: 5,
            condition: "Refurbished",
            mrp: 1000,
            salePrice: 900,
            discountPercent: 10,
            images: ["/placeholder-image.svg"],
            className: "Fuel System",
            groupName: "Engine",
            subClass: "Fuel Pump",
            compatibility: {
              maker: "Honda",
              model: "City",
              configuration: "1.5 VTEC",
              year: 2020,
              fuelType: "Petrol",
            },
            compatibilityList: [],
            inventoryCreatedTime: "2026-01-01T00:00:00.000Z",
            inventoryLastModifiedTime: "2026-01-02T00:00:00.000Z",
          },
        }),
      }),
    );

    const detail = await fetchProductDetail("ITM-1");

    expect(detail.itemId).toBe("ITM-1");
    expect(detail.description).toBe("Sample description");
    expect(detail.referenceId).toBe("REF-123");
  });
});
