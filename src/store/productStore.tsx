import { create } from "zustand";
import { fetchProducts } from "../services/productService";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  images: string[];
  maker: string;
  model: string;
  configuration: string;
  year: string;
  fuel: string;
  category: string;
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

const fallbackProducts: ProductItem[] = [
  {
    id: "prod_1",
    name: "Oxygen Auto Essentials",
    description: "Fallback product created while the API is unavailable.",
    mrp: 100,
    price: 80,
    images: ["/placeholder-image.svg"],
    maker: "Oxygen Auto",
    model: "Essentials",
    configuration: "Standard",
    year: String(new Date().getFullYear()),
    fuel: "Universal",
    category: "Automotive",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
        error: err instanceof Error ? err.message : "Unknown error",
        products: query.page && query.page > 1 ? [] : fallbackProducts,
        total: query.page && query.page > 1 ? 0 : fallbackProducts.length,
        page: query.page && query.page > 0 ? query.page : 1,
        limit: query.limit && query.limit > 0 ? query.limit : 12,
        hasSearched: true,
        isLoading: false,
      });
    }
  },
}));
