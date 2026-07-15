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

interface ProductResponse {
  products: ProductItem[];
  total: number;
  page: number;
  limit: number;
}

const PLACEHOLDER_IMAGE = "/placeholder-image.svg";
const PRODUCTS_API_URL = "https://dummyjson.com/products";
const API_PAGE_SIZE = 100;

const fallbackProducts: ProductItem[] = [
  {
    id: "prod_1",
    name: "Oxygen Auto Essentials",
    description: "Fallback product created while the API is unavailable.",
    mrp: 100,
    price: 80,
    images: [PLACEHOLDER_IMAGE],
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

const normalizeProducts = (
  rawProducts: Array<Record<string, unknown>>,
): ProductItem[] => {
  return rawProducts.map((item, index) => {
    const product = item as Record<string, unknown>;
    const maker = normalizeText(product.brand, "Oxygen Auto");
    const model = normalizeText(product.model, `Model ${index + 1}`);
    const configuration = normalizeText(
      product.configuration,
      normalizeText(product.category, "Standard"),
    );
    const year =
      typeof product.year === "number" || typeof product.year === "string"
        ? String(product.year)
        : String(new Date().getFullYear());
    const fuel = normalizeText(product.fuel, "Universal");

    return {
      id: String(product.id ?? `prod_${index + 1}`),
      name: String(product.title ?? product.name ?? `Product ${index + 1}`),
      description: String(product.description ?? "No description available."),
      mrp: Number(product.price ?? 0) * 2,
      price: Number(product.price ?? 0),
      images: normalizeImages(product.images),
      maker,
      model,
      configuration,
      year,
      fuel,
      category: String(product.category ?? "General"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies ProductItem;
  });
};

export const fetchProducts = async (
  query: ProductQuery = {},
): Promise<ProductResponse> => {
  try {
    const firstResponse = await fetch(
      `${PRODUCTS_API_URL}?limit=${API_PAGE_SIZE}&skip=0`,
    );
    if (!firstResponse.ok) throw new Error("Failed to fetch products");

    const firstPayload = (await firstResponse.json()) as {
      products?: Array<Record<string, unknown>>;
      total?: number;
    };

    const totalFromApi =
      typeof firstPayload.total === "number" ? firstPayload.total : 0;
    const rawProducts = [...(firstPayload.products ?? [])];

    for (let skip = API_PAGE_SIZE; skip < totalFromApi; skip += API_PAGE_SIZE) {
      const pagedResponse = await fetch(
        `${PRODUCTS_API_URL}?limit=${API_PAGE_SIZE}&skip=${skip}`,
      );

      if (!pagedResponse.ok) {
        throw new Error("Failed to fetch products");
      }

      const pagedPayload = (await pagedResponse.json()) as {
        products?: Array<Record<string, unknown>>;
      };

      rawProducts.push(...(pagedPayload.products ?? []));
    }

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
  } catch {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;

    return {
      products: page === 1 ? fallbackProducts : [],
      total: page === 1 ? fallbackProducts.length : 0,
      page,
      limit,
    };
  }
};
