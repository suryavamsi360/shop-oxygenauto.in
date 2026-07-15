import { useEffect, useMemo, useState } from "react";
import { MoveLeft } from "lucide-react";
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
  fuel: string;
}

const INITIAL_FILTERS: FilterState = {
  maker: "",
  model: "",
  configuration: "",
  year: "",
  fuel: "",
};

const ITEMS_PER_PAGE = 12;

const normalizeFilters = (filters: FilterState): FilterState => ({
  maker: filters.maker.trim(),
  model: filters.model.trim(),
  configuration: filters.configuration.trim(),
  year: filters.year.trim(),
  fuel: filters.fuel.trim(),
});

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const search = searchParams.get("search");

  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);

  const filteredProducts = useMemo(() => {
    const sourceProducts = isFilterApplied ? products : products;
    const normalizedSearch = (search ?? "").trim().toLowerCase();

    return sourceProducts.filter((product) => {
      const matchesSearch = normalizedSearch
        ? product.name.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesMaker = activeFilters.maker
        ? product.maker
            .toLowerCase()
            .includes(activeFilters.maker.toLowerCase())
        : true;
      const matchesModel = activeFilters.model
        ? product.model
            .toLowerCase()
            .includes(activeFilters.model.toLowerCase())
        : true;
      const matchesConfiguration = activeFilters.configuration
        ? product.configuration
            .toLowerCase()
            .includes(activeFilters.configuration.toLowerCase())
        : true;
      const matchesYear = activeFilters.year
        ? product.year.toLowerCase().includes(activeFilters.year.toLowerCase())
        : true;
      const matchesFuel = activeFilters.fuel
        ? product.fuel.toLowerCase().includes(activeFilters.fuel.toLowerCase())
        : true;

      return (
        matchesSearch &&
        matchesMaker &&
        matchesModel &&
        matchesConfiguration &&
        matchesYear &&
        matchesFuel
      );
    });
  }, [products, search, activeFilters, isFilterApplied]);

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

  useEffect(() => {
    setCurrentPage(1);
    setActiveFilters(INITIAL_FILTERS);
    setIsFilterApplied(false);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const handleFilterReset = () => {
    setFilters(INITIAL_FILTERS);
    setActiveFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    setIsFilterApplied(false);
  };

  const handleSearch = () => {
    const normalizedFilters = normalizeFilters(filters);

    setCurrentPage(1);
    setActiveFilters(normalizedFilters);
    setIsFilterApplied(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleFilterReset}
          isLoading={isLoading}
        />

        {isLoading ? (
          <Loading />
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="mx-auto grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mb-24 mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition ${
                      page === currentPage
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-300 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : isFilterApplied || (search ?? "").trim().length > 0 ? (
          <div className="py-12 text-center text-slate-500">
            No products found.
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            Use filters and click Search to narrow results.
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
