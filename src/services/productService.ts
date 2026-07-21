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
  createdAt: string;
  updatedAt: string;
}

interface ProductQuery {
  page?: number;
  limit?: number;
}

interface ProductResponse {
  products: ProductItem[];
  total: number;
  page: number;
  limit: number;
}

const PLACEHOLDER_IMAGE = "/placeholder-image.svg";
const PRODUCTS_API_URL = "https://api-oxygen-auto.onrender.com/api/zoho/export-json";

interface ZohoProductItem {
  "Item Id"?: string;
  "Item Name"?: string;
  "Part Number"?: string;
  "Description:"?: string;
  Description?: string;
  Maker?: string;
  Model?: string;
  Year?: string;
  "Stock Quantity"?: string;
  SKU?: string;
  "Market Price"?: string;
  "Sale Price"?: string;
  Group?: string;
  Class?: string;
  "Sub Class"?: string;
  Condition?: string;
  "Chassis Number"?: string;
  "Created Time"?: string;
}

interface ZohoExportResponse {
  status?: string;
  data?: {
    data?: ZohoProductItem[];
  };
}

const normalizeImages = (images: unknown): string[] => {
  if (!Array.isArray(images)) {
    return [PLACEHOLDER_IMAGE];
  }

  const normalized = images.filter((img): img is string => typeof img === "string" && img.trim().length > 0);

  return normalized.length > 0 ? normalized : [PLACEHOLDER_IMAGE];
};

const normalizeText = (value: unknown, fallbackValue: string): string => {
  if (typeof value !== "string") {
    return fallbackValue;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : fallbackValue;
};

const parseInrCurrency = (value: unknown): number => {
  if (typeof value !== "string") {
    return 0;
  }

  const numericValue = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const parseNumber = (value: unknown): number => {
  if (typeof value !== "string") {
    return 0;
  }

  const numericValue = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeProducts = (
  rawProducts: ZohoProductItem[],
): ProductItem[] => {
  return rawProducts.map((item, index) => {
    const itemId = normalizeText(item["Item Id"], String(index + 1));
    const name = normalizeText(item["Item Name"], `Product ${index + 1}`);
    const partNumber = normalizeText(item["Part Number"], "N/A");
    const sku = normalizeText(item.SKU, "N/A");
    const maker = normalizeText(item.Maker, "Oxygen Auto");
    const model = normalizeText(item.Model, `Model ${index + 1}`);
    const group = normalizeText(item.Group, "General");
    const className = normalizeText(item.Class, "Standard");
    const subClass = normalizeText(item["Sub Class"], "");
    const condition = normalizeText(item.Condition, "No condition details available.");
    const apiDescription = normalizeText(
      item["Description:"] ?? item.Description,
      "",
    );
    const chassisNumber = normalizeText(item["Chassis Number"], "N/A");
    const stockQuantity = parseNumber(item["Stock Quantity"]);
    const marketPrice = parseInrCurrency(item["Market Price"]);
    const salePrice = parseInrCurrency(item["Sale Price"]);
    const finalPrice = salePrice > 0 ? salePrice : marketPrice;
    const finalMrp = marketPrice > 0 ? marketPrice : finalPrice;

    return {
      // Keep an integer-compatible id for cart keys while preserving order fallback.
      id: String(index + 1),
      itemId,
      name,
      description:
        apiDescription.length > 0
          ? apiDescription
          : subClass.length > 0
            ? `${className} / ${subClass}. ${condition}`
            : `${className}. ${condition}`,
      partNumber,
      sku,
      stockQuantity,
      condition,
      chassisNumber,
      mrp: finalMrp,
      price: finalPrice,
      images: normalizeImages(undefined),
      maker,
      model,
      configuration: className,
      year: normalizeText(item.Year, String(new Date().getFullYear())),
      fuel: normalizeText(subClass, "Universal"),
      category: group,
      createdAt: normalizeText(item["Created Time"], new Date().toISOString()),
      updatedAt: new Date().toISOString(),
    } satisfies ProductItem;
  });
};

export const fetchProducts = async (
  query: ProductQuery = {},
): Promise<ProductResponse> => {
  try {
    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch products");

    const payload = (await response.json()) as ZohoExportResponse;
    const rawProducts = payload.data?.data ?? [];

    const normalizedProducts = normalizeProducts(rawProducts);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? query.limit : normalizedProducts.length;
    const paginatedProducts =
      query.page || query.limit
        ? normalizedProducts.slice((page - 1) * limit, page * limit)
        : normalizedProducts;

    return {
      products: paginatedProducts,
      total: normalizedProducts.length,
      page,
      limit,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong while loading products.",
    );
  }
};
