import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchProducts,
  type ProductCatalogQuery,
} from "../../services/productService";
import type { ProductItem, ProductListItem } from "../../types/product";
import ProductCard from "./ProductCard";

interface SimilarProductsProps {
  product: ProductItem;
}

interface SimilarProductsState {
  products: ProductListItem[];
  query: ProductCatalogQuery;
  isLoading: boolean;
}

const getSimilarityQueries = (product: ProductItem): ProductCatalogQuery[] => {
  const compatibility = product.compatibilityList[0];
  const maker = product.maker || compatibility?.maker || "";
  const lineConfiguration =
    product.lineConfiguration || compatibility?.lineConfiguration || "";
  const year = product.year || compatibility?.year || "";
  const partCategory = product.partCategory;
  const shared = { limit: 10, excludeItemId: product.itemId };

  const queries: ProductCatalogQuery[] = [
    { ...shared, maker, lineConfiguration, year, partCategory },
    { ...shared, maker, lineConfiguration, partCategory },
    { ...shared, maker, partCategory },
    { ...shared, partCategory },
  ];

  return queries.filter(
    (query, index, queries) =>
      Boolean(query.partCategory || query.maker) &&
      queries.findIndex(
        (candidate) => JSON.stringify(candidate) === JSON.stringify(query),
      ) === index,
  );
};

const getSeeAllUrl = (query: ProductCatalogQuery) => {
  const params = new URLSearchParams();

  for (const key of [
    "maker",
    "lineConfiguration",
    "year",
    "partCategory",
    "excludeItemId",
  ] as const) {
    const value = query[key];
    if (value?.trim()) {
      params.set(key, value.trim());
    }
  }

  return `/products?${params.toString()}`;
};

const SimilarProducts = ({ product }: SimilarProductsProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SimilarProductsState>({
    products: [],
    query: {},
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSimilarProducts = async () => {
      setState({ products: [], query: {}, isLoading: true });

      for (const query of getSimilarityQueries(product)) {
        try {
          const response = await fetchProducts(query);
          if (cancelled) return;

          if (response.products.length > 0) {
            setState({ products: response.products, query, isLoading: false });
            return;
          }
        } catch {
          if (cancelled) return;
        }
      }

      if (!cancelled) {
        setState({ products: [], query: {}, isLoading: false });
      }
    };

    void loadSimilarProducts();

    return () => {
      cancelled = true;
    };
  }, [product]);

  const scroll = (direction: number) => {
    carouselRef.current?.scrollBy({
      left: direction * carouselRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (!state.isLoading && state.products.length === 0) {
    return null;
  }

  const appliedFilters = [
    { label: "Maker", value: state.query.maker },
    { label: "Model", value: state.query.lineConfiguration },
    { label: "Year", value: state.query.year },
    { label: "Category", value: state.query.partCategory },
  ].filter((filter) => filter.value?.trim());

  return (
    <section
      className="mt-14 border-y border-[#D7DCD5] py-8"
      aria-labelledby="similar-products-heading"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2
            id="similar-products-heading"
            className="font-display text-2xl font-semibold text-[#202522] sm:text-3xl"
          >
            Similar products
          </h2>
          <p className="mt-1 text-sm text-[#68706A]">
            Matching this vehicle fitment and part category
          </p>
          {!state.isLoading && appliedFilters.length > 0 && (
            <div
              className="mt-3 flex flex-wrap gap-2"
              aria-label="Applied similar product filters"
            >
              {appliedFilters.map((filter) => (
                <span
                  key={filter.label}
                  className="rounded-md border border-[#C9D0C8] bg-[#F4F5F1] px-2 py-1 text-xs text-[#59615B]"
                >
                  <span className="font-semibold text-[#202522]">
                    {filter.label}:
                  </span>{" "}
                  {filter.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {!state.isLoading && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous similar products"
              className="hidden size-9 items-center justify-center rounded-md border border-[#C9D0C8] bg-white text-[#3E453F] transition hover:border-[#187A45] hover:text-[#187A45] sm:flex"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next similar products"
              className="hidden size-9 items-center justify-center rounded-md border border-[#C9D0C8] bg-white text-[#3E453F] transition hover:border-[#187A45] hover:text-[#187A45] sm:flex"
            >
              <ChevronRight size={18} />
            </button>
            <Link
              to={getSeeAllUrl(state.query)}
              className="inline-flex min-h-9 items-center rounded-md bg-[#187A45] px-3 text-xs font-semibold text-white transition hover:bg-[#126638]"
            >
              See all
            </Link>
          </div>
        )}
      </div>

      {state.isLoading ? (
        <div
          className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"
          aria-label="Loading similar products"
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="aspect-[3/4] animate-pulse rounded-md bg-[#E9ECE6]"
            />
          ))}
        </div>
      ) : (
        <div
          ref={carouselRef}
          className="grid snap-x snap-mandatory auto-cols-[calc((100%-0.75rem)/2)] grid-flow-col gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[calc((100%-2rem)/3)] sm:gap-4 lg:auto-cols-[calc((100%-3.75rem)/4)] lg:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {state.products.map((similarProduct) => (
            <div key={similarProduct.itemId} className="min-w-0 snap-start">
              <ProductCard product={similarProduct} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SimilarProducts;
