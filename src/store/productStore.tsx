import { create } from "zustand";
import { fetchProducts } from "../services/productService";

interface CompatibilityItem {
  maker: string;
  line: string;
  model: string;
  configuration: string;
  year: string;
  fuel: string;
  engineVolume: string;
  bodyType: string;
}

interface ProductItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  partNumber: string;
  sku: string;
  stockQuantity: number;
  condition: string;
  chassisNumber: string;
  mrp: number;
  price: number;
  images: string[];
  maker: string;
  model: string;
  configuration: string;
  year: string;
  fuel: string;
  category: string;
  subCategory: string;
  compatibilityList: CompatibilityItem[];
  createdAt: string;
  updatedAt: string;
}

interface ProductQuery {
  page?: number;
  limit?: number;
}

interface ProductState {
  products: ProductItem[];
  total: number;
  page: number;
  limit: number;
  hasSearched: boolean;
  isLoading: boolean;
  error: string | null;
  setProducts: (products: ProductItem[]) => void;
  clearProducts: () => void;
  getProductById: (id: string) => ProductItem | undefined;
  loadProducts: (query?: ProductQuery) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  limit: 12,
  hasSearched: false,
  isLoading: false,
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
      hasSearched: false,
    }),

  getProductById: (id) => get().products.find((product) => product.id === id),

  loadProducts: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchProducts(query);
      set({
        products: response.products,
        total: response.total,
        page: response.page,
        limit: response.limit,
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
        hasSearched: true,
        isLoading: false,
      });
    }
  },
}));
