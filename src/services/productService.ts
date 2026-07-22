interface ProductItem {
  id: string;
  itemId: string;
  sourceReferenceId: string;
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
  className: string;
  configuration: string;
  year: string;
  fuel: string;
  category: string;
  subCategory: string;
  compatibilityList: CompatibilityItem[];
  createdAt: string;
  updatedAt: string;
}

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
const PRODUCTS_API_URL = import.meta.env.VITE_PRODUCTS_API_URL;

interface ZohoItemFields {
  "Item ID"?: string;
  "Item Name"?: string;
  "Reference Id"?: string;
  "Part Number"?: string;
  "Sales Description"?: string;
  Description?: string;
  SKU?: string;
  MRP?: string;
  "Market Price"?: string;
  "Sale Price"?: string;
  "Sales Price"?: string;
  Group?: string;
  Class?: string;
  "Sub Class"?: string;
  Condition?: string;
  Quantity?: string;
  "Stock Quantity"?: string;
  "Source Chassis Number"?: string;
  "Chassis Number"?: string;
  Year?: string;
  "Created Time"?: string;
  "Last Modified Time"?: string;
  Maker?: string;
  Line?: string;
  Configuration?: string;
  Fuel?: string;
}

interface ZohoCompatibilityItem {
  Maker?: string;
  Line?: string;
  Model?: string;
  Configuration?: string;
  "Start Date"?: string;
  "End Date"?: string;
  "Fuel Type"?: string;
  "Engine Volume"?: string;
  "Body Type"?: string;
}

interface ZohoProductRecord {
  item_id?: string;
  module_record_id?: string;
  item?: ZohoItemFields;
  comp_list?: ZohoCompatibilityItem[];
}

interface ZohoExportResponse {
  status?: string;
  data?: ZohoProductRecord[];
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

const extractYear = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return "";
  }

  const yearMatch = normalizedValue.match(/\b(\d{4})\b/);
  return yearMatch?.[1] ?? normalizedValue;
};

const formatMonthYear = (value: unknown, fallbackYear: string): string => {
  if (typeof value !== "string") {
    return `01-${fallbackYear}`;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return `01-${fallbackYear}`;
  }

  const parsedDate = new Date(normalizedValue.replace(" ", "T"));
  if (!Number.isNaN(parsedDate.getTime())) {
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = String(parsedDate.getFullYear());
    return `${month}-${year}`;
  }

  const yearOnly = extractYear(normalizedValue);
  if (yearOnly) {
    return `01-${yearOnly}`;
  }

  return `01-${fallbackYear}`;
};

const formatCompatibilityYear = (
  startDate: unknown,
  endDate: unknown,
  fallbackYear: string,
): string => {
  const startMonthYear = formatMonthYear(startDate, fallbackYear);
  const endMonthYear = formatMonthYear(endDate, fallbackYear);

  return `${startMonthYear} to ${endMonthYear}`;
};

const normalizeCompatibilityList = (
  compatibilityItems: ZohoCompatibilityItem[] | undefined,
  year: string,
): CompatibilityItem[] => {
  if (!Array.isArray(compatibilityItems)) {
    return [];
  }

  return compatibilityItems.map((entry) => ({
    maker: normalizeText(entry.Maker, ""),
    line: normalizeText(entry.Line, ""),
    model: normalizeText(entry.Model, ""),
    configuration: normalizeText(entry.Configuration, ""),
    year: formatCompatibilityYear(entry["Start Date"], entry["End Date"], year),
    fuel: normalizeText(entry["Fuel Type"], ""),
    engineVolume: normalizeText(entry["Engine Volume"], ""),
    bodyType: normalizeText(entry["Body Type"], ""),
  }));
};

const normalizeProducts = (
  rawProducts: ZohoProductRecord[],
): ProductItem[] => {
  return rawProducts.map((record, index) => {
    const item = record.item ?? {};
    const year = normalizeText(item.Year, String(new Date().getFullYear()));
    const compatibilityList = normalizeCompatibilityList(record.comp_list, year);
    const primaryCompatibility = compatibilityList[0];
    const itemId = normalizeText(
      record.item_id ?? item["Item ID"],
      String(index + 1),
    );
    const name = normalizeText(item["Item Name"], `Product ${index + 1}`);
    const sourceReferenceId = normalizeText(item["Reference Id"], "N/A");
    const partNumber = normalizeText(item["Part Number"], "N/A");
    const sku = normalizeText(item.SKU, "N/A");
    const maker =
      primaryCompatibility?.maker || normalizeText(item.Maker, "Oxygen Auto");
    const model =
      primaryCompatibility?.model || normalizeText(item.Line, `Model ${index + 1}`);
    const group = normalizeText(item.Group, "General");
    const className = normalizeText(item.Class, "Standard");
    const subClass = normalizeText(item["Sub Class"], "");
    const condition = normalizeText(
      item.Condition,
      "No condition details available.",
    );
    const apiDescription = normalizeText(
      item["Sales Description"] ?? item.Description,
      "",
    );
    const chassisNumber = normalizeText(
      item["Source Chassis Number"] ?? item["Chassis Number"],
      "N/A",
    );
    const stockQuantity = parseNumber(item.Quantity ?? item["Stock Quantity"]);
    const marketPrice = parseInrCurrency(item.MRP ?? item["Market Price"]);
    const salePrice = parseInrCurrency(
      item["Sale Price"] ?? item["Sales Price"],
    );
    const finalPrice = salePrice > 0 ? salePrice : marketPrice;
    const finalMrp = marketPrice > 0 ? marketPrice : finalPrice;

    return {
      // Keep an integer-compatible id for cart keys while preserving order fallback.
      id: String(index + 1),
      itemId,
      sourceReferenceId,
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
      className,
      configuration:
        primaryCompatibility?.configuration || normalizeText(item.Configuration, className),
      year,
      fuel: primaryCompatibility?.fuel || normalizeText(item.Fuel, "Universal"),
      category: group,
      subCategory: subClass,
      compatibilityList,
      createdAt: normalizeText(item["Created Time"], new Date().toISOString()),
      updatedAt: normalizeText(
        item["Last Modified Time"],
        new Date().toISOString(),
      ),
    } satisfies ProductItem;
  });
};

export const fetchProducts = async (
  query: ProductQuery = {},
): Promise<ProductResponse> => {
  try {
    if (!PRODUCTS_API_URL) {
      throw new Error("VITE_PRODUCTS_API_URL is not configured.");
    }

    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch products");

    const payload = (await response.json()) as ZohoExportResponse;
    const rawProducts = payload.data ?? [];

    const normalizedProducts = normalizeProducts(rawProducts);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? query.limit : normalizedProducts.length;
    const paginatedProducts =
      query.page || query.limit
        ? normalizedProducts.slice((page - 1) * limit, page * limit)
        : normalizedProducts;

    console.info("Products API connection successful", {
      url: PRODUCTS_API_URL,
      status: response.status,
      statusText: response.statusText,
      query,
      rawCount: rawProducts.length,
      normalizedCount: normalizedProducts.length,
      returnedCount: paginatedProducts.length,
      page,
      limit,
      apiStatus: payload.status,
    });

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
