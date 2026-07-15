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

const PLACEHOLDER_IMAGE = "/placeholder-image.svg";
const PRODUCTS_API_URL = "https://dummyjson.com/products?limit=10";

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

export const fetchProducts = async (): Promise<ProductItem[]> => {
  try {
    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch products");

    const payload = (await response.json()) as { products?: Array<Record<string, unknown>> };

    const normalizedProducts = (payload.products ?? []).map((item, index) => {
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

    return normalizedProducts.length > 0 ? normalizedProducts : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
};
