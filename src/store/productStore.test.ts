import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProductCatalogResponse } from "../services/productService";

const { fetchProductsMock } = vi.hoisted(() => ({
  fetchProductsMock: vi.fn(),
}));

vi.mock("../services/productService", () => ({
  fetchProducts: fetchProductsMock,
  fetchProductDetail: vi.fn(),
}));

import { useProductStore } from "./productStore";

const createResponse = (itemId: string): ProductCatalogResponse => ({
  products: [
    {
      id: itemId,
      itemId,
      sku: `SKU-${itemId}`,
      name: `Product ${itemId}`,
      partTitle: `Product ${itemId}`,
      partName: `Product ${itemId}`,
      stockQuantity: 1,
      mrp: 100,
      price: 90,
      discountPercent: 10,
      images: [],
      maker: "",
      model: "",
      className: "",
      configuration: "",
      lineConfiguration: "",
      year: "",
      fuel: "",
      category: "",
      subCategory: "",
      partCategory: "",
    },
  ],
  total: 1,
  page: 1,
  limit: 30,
  totalPages: 1,
  facets: {
    maker: [],
    lineConfiguration: [],
    year: [],
    partCategory: [],
  },
});

const deferred = <Value>() => {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe("productStore catalog cache", () => {
  beforeEach(() => {
    fetchProductsMock.mockReset();
    useProductStore.getState().clearProducts();
  });

  it("reuses a fresh response for the same normalized query", async () => {
    fetchProductsMock.mockResolvedValue(createResponse("ITM-1"));

    await useProductStore.getState().loadProducts({ maker: " Honda " });
    await useProductStore.getState().loadProducts({ maker: "Honda" });

    expect(fetchProductsMock).toHaveBeenCalledTimes(1);
    expect(useProductStore.getState().products[0].itemId).toBe("ITM-1");
  });

  it("refreshes a cached query when force is requested", async () => {
    fetchProductsMock
      .mockResolvedValueOnce(createResponse("ITM-1"))
      .mockResolvedValueOnce(createResponse("ITM-2"));

    await useProductStore.getState().loadProducts({ page: 1 });
    await useProductStore
      .getState()
      .loadProducts({ page: 1 }, { force: true });

    expect(fetchProductsMock).toHaveBeenCalledTimes(2);
    expect(useProductStore.getState().products[0].itemId).toBe("ITM-2");
  });

  it("deduplicates matching requests already in progress", async () => {
    const request = deferred<ProductCatalogResponse>();
    fetchProductsMock.mockReturnValue(request.promise);

    const firstLoad = useProductStore.getState().loadProducts({ search: "pad" });
    const secondLoad = useProductStore.getState().loadProducts({ search: "pad" });

    expect(fetchProductsMock).toHaveBeenCalledTimes(1);
    request.resolve(createResponse("ITM-1"));
    await Promise.all([firstLoad, secondLoad]);
  });

  it("does not let an older query overwrite the active query", async () => {
    const firstRequest = deferred<ProductCatalogResponse>();
    const secondRequest = deferred<ProductCatalogResponse>();
    fetchProductsMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);

    const firstLoad = useProductStore
      .getState()
      .loadProducts({ search: "first" });
    const secondLoad = useProductStore
      .getState()
      .loadProducts({ search: "second" });

    secondRequest.resolve(createResponse("SECOND"));
    await secondLoad;
    firstRequest.resolve(createResponse("FIRST"));
    await firstLoad;

    expect(useProductStore.getState().products[0].itemId).toBe("SECOND");
  });

  it("evicts an unavailable product and its cached catalog response", async () => {
    fetchProductsMock.mockResolvedValue(createResponse("ITM-1"));
    await useProductStore.getState().loadProducts({ page: 1 });

    useProductStore.getState().invalidateProduct("ITM-1");
    await useProductStore.getState().loadProducts({ page: 1 });

    expect(useProductStore.getState().products).toEqual([
      expect.objectContaining({ itemId: "ITM-1" }),
    ]);
    expect(fetchProductsMock).toHaveBeenCalledTimes(2);
  });
});