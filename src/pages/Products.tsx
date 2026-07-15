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

const ITEMS_PER_PAGE = 5;

const getUniqueValues = (values: string[]) => {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort(
    (a, b) => a.localeCompare(b),
  );
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const search = searchParams.get("search");

  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);

  const filterOptions = useMemo(
    () => ({
      makers: getUniqueValues(products.map((product) => product.maker)),
      models: getUniqueValues(products.map((product) => product.model)),
      configurations: getUniqueValues(
        products.map((product) => product.configuration),
      ),
      years: getUniqueValues(products.map((product) => product.year)).sort(
        (a, b) => Number(b) - Number(a),
      ),
      fuels: getUniqueValues(products.map((product) => product.fuel)),
    }),
    [products],
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = search
      ? product.name.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesMaker = filters.maker ? product.maker === filters.maker : true;
    const matchesModel = filters.model ? product.model === filters.model : true;
    const matchesConfiguration = filters.configuration
      ? product.configuration === filters.configuration
      : true;
    const matchesYear = filters.year ? product.year === filters.year : true;
    const matchesFuel = filters.fuel ? product.fuel === filters.fuel : true;

    return (
      matchesSearch &&
      matchesMaker &&
      matchesModel &&
      matchesConfiguration &&
      matchesYear &&
      matchesFuel
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);

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
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
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
                    onClick={() => setCurrentPage(page)}
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
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-slate-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
