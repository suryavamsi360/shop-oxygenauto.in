import { create } from "zustand";
import { fetchProducts } from "../services/productService";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  images: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: ProductItem[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: ProductItem[]) => void;
  clearProducts: () => void;
  getProductById: (id: string) => ProductItem | undefined;
  loadProducts: () => Promise<void>;
}

const fallbackProducts: ProductItem[] = [
  {
    id: "prod_1",
    name: "Oxygen Auto Essentials",
    description: "Fallback product created while the API is unavailable.",
    mrp: 100,
    price: 80,
    images: ["/placeholder-image.svg"],
    category: "Automotive",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useProductStore = create<ProductState>((set, get) => ({
  products: fallbackProducts,
  isLoading: false,
  error: null,

  setProducts: (products) =>
    set({
      products,
    }),

  clearProducts: () =>
    set({
      products: [],
    }),

  getProductById: (id) => get().products.find((product) => product.id === id),

  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await fetchProducts();
      set({ products, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      });
    }
  },
}));
