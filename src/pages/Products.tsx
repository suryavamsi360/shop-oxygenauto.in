import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoveLeft, RefreshCw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Loading from "../components/layout/Loading";
import ProductCard from "../components/layout/ProductCard";
import ProductFilters from "../components/layout/ProductFilters";
import { useProductStore } from "../store/productStore";

interface FilterState {
  maker: string;
  model: string;
  configuration: string;
  year: string;
  fuelType: string;
  group: string;
  className: string;
  subClass: string;
}

const INITIAL_FILTERS: FilterState = {
  maker: "",
  model: "",
  configuration: "",
  year: "",
  fuelType: "",
  group: "",
  className: "",
  subClass: "",
};

const FILTER_KEYS: Array<keyof FilterState> = [
  "maker",
  "model",
  "configuration",
  "year",
  "fuelType",
  "group",
  "className",
  "subClass",
];

const ITEMS_PER_PAGE = 30;

const normalizeFilters = (filters: FilterState): FilterState => ({
  maker: filters.maker.trim(),
  model: filters.model.trim(),
  configuration: filters.configuration.trim(),
  year: filters.year.trim(),
  fuelType: filters.fuelType.trim(),
  group: filters.group.trim(),
  className: filters.className.trim(),
  subClass: filters.subClass.trim(),
});

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const search = searchParams.get("search");

  const products = useProductStore((state) => state.products);
  const total = useProductStore((state) => state.total);
  const limit = useProductStore((state) => state.limit);
  const facets = useProductStore((state) => state.facets);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const loadProducts = useProductStore((state) => state.loadProducts);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  const filterOptions = useMemo(() => {
    return {
      makers: facets.maker.map((item) => item.value),
      models: facets.model.map((item) => item.value),
      configurations: facets.configuration.map((item) => item.value),
      years: facets.year.map((item) => item.value),
      fuelTypes: facets.fuelType.map((item) => item.value),
      groups: facets.group.map((item) => item.value),
      classNames: facets.className.map((item) => item.value),
      subClasses: facets.subClass.map((item) => item.value),
    };
  }, [facets]);

  const requestQuery = useMemo(() => {
    const normalizedFilters = normalizeFilters(filters);

    return {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: (search ?? "").trim(),
      ...normalizedFilters,
    };
  }, [currentPage, filters, search]);

  useEffect(() => {
    void loadProducts(requestQuery);
  }, [loadProducts, requestQuery]);

  useEffect(() => {
    setCurrentPage(1);
    setPageInput("1");
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
        sanitizedFilters.configuration &&
        !filterOptions.configurations.includes(sanitizedFilters.configuration)
      ) {
        sanitizedFilters.configuration = "";
      }
      if (
        sanitizedFilters.year &&
        !filterOptions.years.includes(sanitizedFilters.year)
      ) {
        sanitizedFilters.year = "";
      }
      if (
        sanitizedFilters.fuelType &&
        !filterOptions.fuelTypes.includes(sanitizedFilters.fuelType)
      ) {
        sanitizedFilters.fuelType = "";
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

  const handleRefreshSearch = () => {
    void loadProducts(requestQuery);
  };

  return (
    <div className="mx-6 min-h-[70vh]">
      <div className="mx-auto max-w-7xl">
        <div className="my-6 flex flex-wrap items-center justify-between gap-3">
          <h1
            onClick={() => navigate("/products")}
            className="flex cursor-pointer items-center gap-2 text-2xl text-slate-500"
          >
            {search && <MoveLeft size={20} />}
            All <span className="font-medium text-slate-700">Products</span>
          </h1>

          <button
            type="button"
            onClick={handleRefreshSearch}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh and search again
          </button>
        </div>

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
              onClick={handleRefreshSearch}
              className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Refresh and search again
            </button>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mx-auto grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-8">
              {products.map((product) => (
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
