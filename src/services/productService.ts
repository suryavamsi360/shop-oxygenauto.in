import type { ProductItem, ProductListItem } from "../types/product";

export interface ProductCatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  maker?: string;
  lineConfiguration?: string;
  year?: string;
  partCategory?: string;
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface ProductFacets {
  maker: FacetOption[];
  lineConfiguration: FacetOption[];
  year: FacetOption[];
  partCategory: FacetOption[];
}

export interface ProductCatalogResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: ProductFacets;
}

interface RawCatalogResponse {
  products?: ProductListItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  facets?: Partial<ProductFacets>;
}

interface RawProductDetailResponse {
  product?: ProductItem;
}

const DEFAULT_BASE_URL = "http://localhost:8000/api";
const PRODUCTS_API_BASE_URL =
  import.meta.env.VITE_PRODUCTS_API_BASE_URL ||
  import.meta.env.VITE_PRODUCTS_API_URL ||
  DEFAULT_BASE_URL;

const normalizeFacets = (
  facets: Partial<ProductFacets> | undefined,
): ProductFacets => ({
  maker: Array.isArray(facets?.maker) ? facets.maker : [],
  lineConfiguration: Array.isArray(facets?.lineConfiguration)
    ? facets.lineConfiguration
    : [],
  year: Array.isArray(facets?.year) ? facets.year : [],
  partCategory: Array.isArray(facets?.partCategory)
    ? facets.partCategory
    : [],
});

const buildCatalogUrl = (query: ProductCatalogQuery) => {
  const params = new URLSearchParams();

  if (query.page && query.page > 0) {
    params.set("page", String(query.page));
  }

  if (query.limit && query.limit > 0) {
    params.set("limit", String(query.limit));
  }

  const filterKeys: Array<keyof ProductCatalogQuery> = [
    "search",
    "maker",
    "lineConfiguration",
    "year",
    "partCategory",
  ];

  for (const key of filterKeys) {
    const value = query[key];
    if (typeof value === "string" && value.trim().length > 0) {
      params.set(key, value.trim());
    }
  }

  return `${PRODUCTS_API_BASE_URL}/products?${params.toString()}`;
};

export const fetchProducts = async (
  query: ProductCatalogQuery = {},
): Promise<ProductCatalogResponse> => {
  try {
    const response = await fetch(buildCatalogUrl(query));

    if (!response.ok) {
      throw new Error(`Failed to fetch products (status ${response.status}).`);
    }

    const payload = (await response.json()) as RawCatalogResponse;

    const products = Array.isArray(payload.products) ? payload.products : [];
    const total = Number(payload.pagination?.total || 0);
    const page = Number(payload.pagination?.page || query.page || 1);
    const limit = Number(payload.pagination?.limit || query.limit || 30);
    const totalPages = Number(payload.pagination?.totalPages || 1);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
      facets: normalizeFacets(payload.facets),
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong while loading products.",
    );
  }
};

export const fetchProductDetail = async (itemId: string): Promise<ProductItem> => {
  if (!itemId.trim()) {
    throw new Error("Product itemId is required.");
  }

  const response = await fetch(
    `${PRODUCTS_API_BASE_URL}/products/${encodeURIComponent(itemId.trim())}`,
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Product not found."
        : `Failed to fetch product details (status ${response.status}).`,
    );
  }

  const payload = (await response.json()) as RawProductDetailResponse;

  if (!payload.product) {
    throw new Error("Product details response is invalid.");
  }

  return payload.product;
};
