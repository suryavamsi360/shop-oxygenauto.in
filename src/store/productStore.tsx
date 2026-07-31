import { create } from "zustand";
import {
  fetchProductDetail,
  fetchProducts,
  type ProductCatalogQuery,
  type ProductFacets,
} from "../services/productService";
import type { ProductItem, ProductListItem } from "../types/product";

export type { ProductItem, ProductListItem } from "../types/product";

const EMPTY_FACETS: ProductFacets = {
  maker: [],
  lineConfiguration: [],
  year: [],
  partCategory: [],
};

interface ProductState {
  products: ProductListItem[];
  productDetailsByItemId: Record<string, ProductItem>;
  facets: ProductFacets;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasSearched: boolean;
  isLoading: boolean;
  isDetailsLoading: boolean;
  error: string | null;
  setProducts: (products: ProductListItem[]) => void;
  clearProducts: () => void;
  getProductById: (id: string) => ProductListItem | undefined;
  getProductDetailByItemId: (itemId: string) => ProductItem | undefined;
  loadProducts: (query?: ProductCatalogQuery) => Promise<void>;
  loadProductDetail: (itemId: string) => Promise<ProductItem>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  productDetailsByItemId: {},
  facets: EMPTY_FACETS,
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
  hasSearched: false,
  isLoading: false,
  isDetailsLoading: false,
  error: null,

  setProducts: (products) =>
    set({
      products,
    }),

  clearProducts: () =>
    set({
      products: [],
      total: 0,
      page: 1,
      totalPages: 1,
      facets: EMPTY_FACETS,
      hasSearched: false,
    }),

  getProductById: (id) => get().products.find((product) => product.id === id),
  getProductDetailByItemId: (itemId) => get().productDetailsByItemId[itemId],

  loadProducts: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchProducts(query);
      set({
        products: response.products,
        facets: response.facets,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        hasSearched: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Something went wrong while loading products.",
        products: [],
        total: 0,
        page: query.page && query.page > 0 ? query.page : 1,
        limit: query.limit && query.limit > 0 ? query.limit : 12,
        totalPages: 1,
        facets: EMPTY_FACETS,
        hasSearched: true,
        isLoading: false,
      });
    }
  },

  loadProductDetail: async (itemId) => {
    const normalizedItemId = itemId.trim();

    if (!normalizedItemId) {
      throw new Error("Product itemId is required.");
    }

    const cached = get().productDetailsByItemId[normalizedItemId];
    if (cached) {
      return cached;
    }

    set({ isDetailsLoading: true, error: null });

    try {
      const detail = await fetchProductDetail(normalizedItemId);

      set((state) => ({
        isDetailsLoading: false,
        productDetailsByItemId: {
          ...state.productDetailsByItemId,
          [normalizedItemId]: detail,
        },
      }));

      return detail;
    } catch (err) {
      set({
        isDetailsLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Something went wrong while loading product details.",
      });
      throw err;
    }
  },
}));
