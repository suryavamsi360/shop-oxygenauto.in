import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoveLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Loading from "../components/layout/Loading";
import ProductCard from "../components/layout/ProductCard";
import ProductFilters from "../components/layout/ProductFilters";
import { useProductStore } from "../store/productStore";

interface FilterState {
  maker: string;
  model: string;
  year: string;
  group: string;
  className: string;
  subClass: string;
}

const INITIAL_FILTERS: FilterState = {
  maker: "",
  model: "",
  year: "",
  group: "",
  className: "",
  subClass: "",
};

const FILTER_KEYS: Array<keyof FilterState> = [
  "maker",
  "model",
  "year",
  "group",
  "className",
  "subClass",
];

const ITEMS_PER_PAGE = 30;

const normalizeFilters = (filters: FilterState): FilterState => ({
  maker: filters.maker.trim(),
  model: filters.model.trim(),
  year: filters.year.trim(),
  group: filters.group.trim(),
  className: filters.className.trim(),
  subClass: filters.subClass.trim(),
});

const getUniqueValues = (values: string[]) => {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort(
    (a, b) => a.localeCompare(b),
  );
};

const matchesFilterValue = (productValue: string, filterValue: string) =>
  filterValue
    ? productValue.toLowerCase().includes(filterValue.toLowerCase())
    : true;

const matchesCompatibilityValue = (values: string[], filterValue: string) => {
  if (!filterValue) {
    return true;
  }

  const normalizedFilterValue = filterValue.toLowerCase();

  return values.some((value) =>
    value.toLowerCase().includes(normalizedFilterValue),
  );
};

interface CompatibilityFilterProduct {
  compatibilityList: Array<{
    maker: string;
    model: string;
    configuration: string;
    year: string;
    fuel: string;
  }>;
}

const getCompatibilityValues = (
  product: CompatibilityFilterProduct,
  key: "maker" | "model" | "configuration" | "year" | "fuel",
) => {
  const values = product.compatibilityList.map((entry) => entry[key]);
  return getUniqueValues(values);
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const search = searchParams.get("search");

  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const loadProducts = useProductStore((state) => state.loadProducts);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = (search ?? "").trim().toLowerCase();
    const normalizedFilters = normalizeFilters(filters);

    return products.filter((product) => {
      const matchesSearch = normalizedSearch
        ? product.name.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesMaker = matchesCompatibilityValue(
        getCompatibilityValues(product, "maker"),
        normalizedFilters.maker,
      );
      const matchesModel = matchesCompatibilityValue(
        getCompatibilityValues(product, "model"),
        normalizedFilters.model,
      );
      const matchesYear = matchesCompatibilityValue(
        getCompatibilityValues(product, "year"),
        normalizedFilters.year,
      );
      const matchesGroup = normalizedFilters.group
        ? product.category
            .toLowerCase()
            .includes(normalizedFilters.group.toLowerCase())
        : true;
      const matchesClass = normalizedFilters.className
        ? product.configuration
            .toLowerCase()
            .includes(normalizedFilters.className.toLowerCase())
        : true;
      const matchesSubClass = normalizedFilters.subClass
        ? product.subCategory
            .toLowerCase()
            .includes(normalizedFilters.subClass.toLowerCase())
        : true;

      return (
        matchesSearch &&
        matchesMaker &&
        matchesModel &&
        matchesYear &&
        matchesGroup &&
        matchesClass &&
        matchesSubClass
      );
    });
  }, [products, search, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [filteredProducts, currentPage],
  );

  const filterOptions = useMemo(() => {
    const getRelevantProducts = (excludeKey: keyof FilterState) => {
      return products.filter((product) => {
        return FILTER_KEYS.every((key) => {
          if (key === excludeKey) {
            return true;
          }

          if (key === "maker") {
            return matchesCompatibilityValue(
              getCompatibilityValues(product, "maker"),
              filters.maker,
            );
          }
          if (key === "model") {
            return matchesCompatibilityValue(
              getCompatibilityValues(product, "model"),
              filters.model,
            );
          }
          if (key === "year") {
            return matchesCompatibilityValue(
              getCompatibilityValues(product, "year"),
              filters.year,
            );
          }
          if (key === "group") {
            return matchesFilterValue(product.category, filters.group);
          }
          if (key === "className") {
            return matchesFilterValue(product.configuration, filters.className);
          }
          if (key === "subClass") {
            return matchesFilterValue(product.subCategory, filters.subClass);
          }

          return matchesFilterValue(product[key], filters[key]);
        });
      });
    };

    const compatibilityProductsForMakers = getRelevantProducts("maker");
    const compatibilityProductsForModels = getRelevantProducts("model");
    const compatibilityProductsForYears = getRelevantProducts("year");
    return {
      makers: getUniqueValues(
        compatibilityProductsForMakers.flatMap((product) =>
          getCompatibilityValues(product, "maker"),
        ),
      ),
      models: getUniqueValues(
        compatibilityProductsForModels.flatMap((product) =>
          getCompatibilityValues(product, "model"),
        ),
      ),
      years: getUniqueValues(
        compatibilityProductsForYears.flatMap((product) =>
          getCompatibilityValues(product, "year"),
        ),
      ).sort((a, b) => Number(b) - Number(a)),
      groups: getUniqueValues(
        getRelevantProducts("group").map((product) => product.category),
      ),
      classNames: getUniqueValues(
        getRelevantProducts("className").map(
          (product) => product.configuration,
        ),
      ),
      subClasses: getUniqueValues(
        getRelevantProducts("subClass").map((product) => product.subCategory),
      ),
    };
  }, [products, filters]);

  useEffect(() => {
    setCurrentPage(1);
    setFilters(INITIAL_FILTERS);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    setFilters((currentFilters) => {
      const sanitizedFilters: FilterState = { ...currentFilters };

      if (
        sanitizedFilters.maker &&
        !filterOptions.makers.includes(sanitizedFilters.maker)
      ) {
        sanitizedFilters.maker = "";
      }
      if (
        sanitizedFilters.model &&
        !filterOptions.models.includes(sanitizedFilters.model)
      ) {
        sanitizedFilters.model = "";
      }
      if (
        sanitizedFilters.year &&
        !filterOptions.years.includes(sanitizedFilters.year)
      ) {
        sanitizedFilters.year = "";
      }
      if (
        sanitizedFilters.group &&
        !filterOptions.groups.includes(sanitizedFilters.group)
      ) {
        sanitizedFilters.group = "";
      }
      if (
        sanitizedFilters.className &&
        !filterOptions.classNames.includes(sanitizedFilters.className)
      ) {
        sanitizedFilters.className = "";
      }
      if (
        sanitizedFilters.subClass &&
        !filterOptions.subClasses.includes(sanitizedFilters.subClass)
      ) {
        sanitizedFilters.subClass = "";
      }

      const hasChanged = FILTER_KEYS.some(
        (key) => currentFilters[key] !== sanitizedFilters[key],
      );

      return hasChanged ? sanitizedFilters : currentFilters;
    });
  }, [filterOptions]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const handleFilterReset = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const boundedPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(boundedPage);
  };

  const handlePageJump = () => {
    const requestedPage = Number(pageInput);
    if (!Number.isFinite(requestedPage)) {
      setPageInput(String(currentPage));
      return;
    }

    handlePageChange(Math.trunc(requestedPage));
  };

  const handleRetrySearch = () => {
    void loadProducts();
  };

  return (
    <div className="mx-6 min-h-[70vh]">
      <div className="mx-auto max-w-7xl">
        <h1
          onClick={() => navigate("/products")}
          className="my-6 flex cursor-pointer items-center gap-2 text-2xl text-slate-500"
        >
          {search && <MoveLeft size={20} />}
          All <span className="font-medium text-slate-700">Products</span>
        </h1>

        <ProductFilters
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />

        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="py-12 text-center text-slate-500">
            <p>Something went wrong while loading products.</p>
            <button
              type="button"
              onClick={handleRetrySearch}
              className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Retry Search
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="mx-auto grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mb-24 mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="rounded-md border border-slate-300 p-2 text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600">
                  <span>Page</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value)}
                    onBlur={handlePageJump}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handlePageJump();
                      }
                    }}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-center text-slate-700 outline-none transition focus:border-slate-500"
                    aria-label="Go to page"
                  />
                  <span>of {totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="rounded-md border border-slate-300 p-2 text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (search ?? "").trim().length > 0 ||
          FILTER_KEYS.some((key) => filters[key].trim().length > 0) ? (
          <div className="py-12 text-center text-slate-500">
            No products found.
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            Use filters to narrow results.
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
