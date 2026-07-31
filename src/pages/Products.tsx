import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoveLeft,
  PackageSearch,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Loading from "../components/layout/Loading";
import ProductCard from "../components/layout/ProductCard";
import ProductFilters from "../components/layout/ProductFilters";
import { useProductStore } from "../store/productStore";
import { REQUIREMENT_CTA_URL } from "../utils/requirementCta";

interface FilterState {
  maker: string;
  lineConfiguration: string;
  year: string;
  partCategory: string;
}

const INITIAL_FILTERS: FilterState = {
  maker: "",
  lineConfiguration: "",
  year: "",
  partCategory: "",
};

const FILTER_KEYS: Array<keyof FilterState> = [
  "maker",
  "lineConfiguration",
  "year",
  "partCategory",
];

const ITEMS_PER_PAGE = 30;

const normalizeFilters = (filters: FilterState): FilterState => ({
  maker: filters.maker.trim(),
  lineConfiguration: filters.lineConfiguration.trim(),
  year: filters.year.trim(),
  partCategory: filters.partCategory.trim(),
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
      makers: (facets.maker ?? []).map((item) => item.value),
      lineConfigurations: (facets.lineConfiguration ?? []).map(
        (item) => item.value,
      ),
      years: (facets.year ?? []).map((item) => item.value),
      partCategories: (facets.partCategory ?? []).map((item) => item.value),
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
        sanitizedFilters.lineConfiguration &&
        !filterOptions.lineConfigurations.includes(
          sanitizedFilters.lineConfiguration,
        )
      ) {
        sanitizedFilters.lineConfiguration = "";
      }
      if (
        sanitizedFilters.year &&
        !filterOptions.years.includes(sanitizedFilters.year)
      ) {
        sanitizedFilters.year = "";
      }
      if (
        sanitizedFilters.partCategory &&
        !filterOptions.partCategories.includes(sanitizedFilters.partCategory)
      ) {
        sanitizedFilters.partCategory = "";
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

  const handlePostRequirement = () => {
    window.open(REQUIREMENT_CTA_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-[70vh] pb-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 py-8 sm:py-10">
          <div>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#0D542B] transition hover:text-[#093F20]"
            >
              {search && <MoveLeft size={15} />}
              Parts catalogue
            </button>
            <h1 className="font-display text-4xl font-bold uppercase leading-none text-[#202522] sm:text-5xl">
              {search ? `Results for “${search}”` : "Find the right part"}
            </h1>
            <p className="mt-2 text-sm text-[#68706A]">
              {isLoading
                ? "Checking current inventory"
                : `${total.toLocaleString()} stocked ${total === 1 ? "part" : "parts"}`}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleRefreshSearch}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            title="Refresh catalogue results"
          >
            <RefreshCw size={16} />
            Refresh inventory
          </Button>
        </header>

        <ProductFilters
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />

        {isLoading ? (
          <Loading variant="catalog" />
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Catalogue unavailable"
            description="We could not load the current inventory. Refresh the catalogue or send us the part you need."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button type="button" onClick={handleRefreshSearch} size="sm">
                  <RefreshCw size={15} />
                  Try again
                </Button>
                <Button
                  type="button"
                  onClick={handlePostRequirement}
                  variant="secondary"
                  size="sm"
                >
                  Post requirement
                </Button>
              </div>
            }
          />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-[#D7DCD5] pt-6"
                aria-label="Product pagination"
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="flex size-10 items-center justify-center rounded-md border border-[#C9D0C8] bg-white text-[#515852] transition enabled:hover:border-[#0D542B] enabled:hover:text-[#0D542B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex h-10 items-center gap-2 rounded-md border border-[#C9D0C8] bg-white px-3 text-xs font-semibold text-[#68706A]">
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
                    className="h-7 w-12 rounded border border-[#D7DCD5] bg-[#F4F5F1] px-1 text-center font-bold text-[#202522] outline-none focus:border-[#0D542B]"
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
                  className="flex size-10 items-center justify-center rounded-md border border-[#C9D0C8] bg-white text-[#515852] transition enabled:hover:border-[#0D542B] enabled:hover:text-[#0D542B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </>
        ) : (search ?? "").trim().length > 0 ||
          FILTER_KEYS.some((key) => filters[key].trim().length > 0) ? (
          <EmptyState
            icon={PackageSearch}
            title="No matching parts"
            description="Adjust the fitment filters or send us your requirement and our team will help source it."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  onClick={handleFilterReset}
                  variant="secondary"
                >
                  Clear filters
                </Button>
                <Button type="button" onClick={handlePostRequirement}>
                  Post requirement
                </Button>
              </div>
            }
          />
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No stocked parts"
            description="Current inventory is unavailable. Refresh the catalogue or send us the part you need."
            action={
              <Button type="button" onClick={handleRefreshSearch}>
                <RefreshCw size={16} />
                Refresh inventory
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default Shop;
