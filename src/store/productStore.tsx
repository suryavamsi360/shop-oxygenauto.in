import { create } from "zustand";
import {
  fetchProductDetail,
  fetchProducts,
  type ProductCatalogQuery,
  type ProductCatalogResponse,
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

const CATALOG_CACHE_TTL_MS = 60_000;

interface CachedCatalogResponse extends ProductCatalogResponse {
  cachedAt: number;
}

interface LoadProductsOptions {
  force?: boolean;
}

const catalogCache = new Map<string, CachedCatalogResponse>();
const catalogRequests = new Map<string, Promise<ProductCatalogResponse>>();

const normalizeCatalogQuery = (
  query: ProductCatalogQuery,
): Required<ProductCatalogQuery> => ({
  page: query.page && query.page > 0 ? Math.trunc(query.page) : 1,
  limit: query.limit && query.limit > 0 ? Math.trunc(query.limit) : 30,
  search: query.search?.trim() || "",
  maker: query.maker?.trim() || "",
  lineConfiguration: query.lineConfiguration?.trim() || "",
  year: query.year?.trim() || "",
  partCategory: query.partCategory?.trim() || "",
});

const getCatalogQueryKey = (query: Required<ProductCatalogQuery>) =>
  JSON.stringify(query);

const toCatalogState = (response: ProductCatalogResponse) => ({
  products: response.products,
  facets: response.facets,
  total: response.total,
  page: response.page,
  limit: response.limit,
});

interface ProductState {
  products: ProductListItem[];
  productDetailsByItemId: Record<string, ProductItem>;
  facets: ProductFacets;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isDetailsLoading: boolean;
  error: string | null;
  activeCatalogKey: string | null;
  clearProducts: () => void;
  loadProducts: (
    query?: ProductCatalogQuery,
    options?: LoadProductsOptions,
  ) => Promise<boolean>;
  loadProductDetail: (itemId: string) => Promise<ProductItem>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  productDetailsByItemId: {},
  facets: EMPTY_FACETS,
  total: 0,
  page: 1,
  limit: 12,
  isLoading: false,
  isRefreshing: false,
  isDetailsLoading: false,
  error: null,
  activeCatalogKey: null,

  clearProducts: () => {
    catalogCache.clear();
    set({
      products: [],
      total: 0,
      page: 1,
      facets: EMPTY_FACETS,
      isLoading: false,
      isRefreshing: false,
      activeCatalogKey: null,
    });
  },

  loadProducts: async (query = {}, options = {}) => {
    const normalizedQuery = normalizeCatalogQuery(query);
    const queryKey = getCatalogQueryKey(normalizedQuery);
    const cached = catalogCache.get(queryKey);
    const isCacheFresh =
      cached && Date.now() - cached.cachedAt < CATALOG_CACHE_TTL_MS;

    if (cached) {
      set({
        ...toCatalogState(cached),
        activeCatalogKey: queryKey,
        isLoading: false,
        isRefreshing: options.force === true || !isCacheFresh,
        error: null,
      });
    } else {
      set({
        activeCatalogKey: queryKey,
        isLoading: true,
        isRefreshing: false,
        error: null,
      });
    }

    if (isCacheFresh && !options.force) {
      return true;
    }

    let request = catalogRequests.get(queryKey);
    if (!request) {
      request = fetchProducts(normalizedQuery);
      catalogRequests.set(queryKey, request);
    }

    try {
      const response = await request;
      catalogCache.set(queryKey, {
        ...response,
        cachedAt: Date.now(),
      });

      if (get().activeCatalogKey !== queryKey) {
        return true;
      }

      set({
        ...toCatalogState(response),
        isLoading: false,
        isRefreshing: false,
      });
      return true;
    } catch (err) {
      if (get().activeCatalogKey !== queryKey) {
        return false;
      }

      if (cached) {
        set({ isLoading: false, isRefreshing: false });
        return false;
      }

      set({
        error:
          err instanceof Error
            ? err.message
            : "Something went wrong while loading products.",
        products: [],
        total: 0,
        page: normalizedQuery.page,
        limit: normalizedQuery.limit,
        facets: EMPTY_FACETS,
        isLoading: false,
        isRefreshing: false,
      });
      return false;
    } finally {
      if (catalogRequests.get(queryKey) === request) {
        catalogRequests.delete(queryKey);
      }
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
