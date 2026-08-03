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

interface RawCompatibilityItem {
  maker?: string;
  line?: string;
  model?: string;
  configuration?: string;
  lineConfiguration?: string;
  startYear?: number | null;
  endYear?: number | null;
  year?: number | string | null;
  fuelType?: string;
  engineVolume?: number | string;
  bodyType?: string;
}

interface RawProductListItem {
  itemId?: string;
  itemName?: string;
  sku?: string;
  partTitle?: string;
  salePrice?: number | string;
  mrp?: number | string;
  discountPercent?: number | string;
  quantity?: number | string;
  availableStock?: number | string;
  images?: string[];
  groupName?: string;
  className?: string;
  subClass?: string;
  partCategory?: string;
  compatibility?: RawCompatibilityItem | null;
}

interface RawProductItem extends RawProductListItem {
  salesDescription?: string;
  partNumber?: string;
  condition?: string;
  compatibilityList?: RawCompatibilityItem[];
  inventoryCreatedTime?: string;
  inventoryLastModifiedTime?: string;
}

interface RawCatalogResponse {
  products?: RawProductListItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  facets?: Partial<ProductFacets>;
}

interface RawProductDetailResponse {
  product?: RawProductItem;
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

const toText = (value: unknown) => String(value ?? "").trim();

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeProduct = (product: RawProductListItem): ProductListItem => {
  const compatibility = product.compatibility;
  const partTitle = toText(product.partTitle);
  const partName = toText(product.itemName);

  return {
    id: toText(product.itemId),
    itemId: toText(product.itemId),
    sku: toText(product.sku),
    name: partTitle || partName,
    partTitle,
    partName,
    stockQuantity: Math.max(
      0,
      Math.trunc(
        Math.max(
          toNumber(product.availableStock),
          toNumber(product.quantity),
        ),
      ),
    ),
    mrp: toNumber(product.mrp),
    price: toNumber(product.salePrice),
    discountPercent: toNumber(product.discountPercent),
    images: Array.isArray(product.images) ? product.images : [],
    maker: toText(compatibility?.maker),
    model: toText(compatibility?.model || compatibility?.line),
    className: toText(product.className),
    configuration: toText(compatibility?.configuration),
    lineConfiguration: toText(compatibility?.lineConfiguration),
    year: toText(compatibility?.year),
    fuel: toText(compatibility?.fuelType),
    category: toText(product.groupName),
    subCategory: toText(product.subClass),
    partCategory:
      toText(product.partCategory) ||
      toText(product.subClass) ||
      toText(product.className) ||
      toText(product.groupName),
  };
};

const normalizeCompatibility = (
  compatibility: RawCompatibilityItem,
): ProductItem["compatibilityList"][number] => ({
  maker: toText(compatibility.maker),
  line: toText(compatibility.line),
  model: toText(compatibility.model),
  configuration: toText(compatibility.configuration),
  lineConfiguration: toText(compatibility.lineConfiguration),
  startYear: compatibility.startYear ?? null,
  endYear: compatibility.endYear ?? null,
  year: toText(compatibility.year),
  fuel: toText(compatibility.fuelType),
  engineVolume: toText(compatibility.engineVolume),
  bodyType: toText(compatibility.bodyType),
});

const normalizeProductDetail = (product: RawProductItem): ProductItem => ({
  ...normalizeProduct(product),
  description: toText(product.salesDescription),
  partNumber: toText(product.partNumber),
  condition: toText(product.condition),
  compatibilityList: Array.isArray(product.compatibilityList)
    ? product.compatibilityList.map(normalizeCompatibility)
    : [],
  inventoryCreatedTime: toText(product.inventoryCreatedTime),
  inventoryLastModifiedTime: toText(product.inventoryLastModifiedTime),
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

    const products = Array.isArray(payload.products)
      ? payload.products.map(normalizeProduct)
      : [];
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

  return normalizeProductDetail(payload.product);
};
