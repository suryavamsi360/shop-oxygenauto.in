import { MoveLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Loading from "../components/layout/Loading";
import ProductCard from "../components/layout/ProductCard";
import { useProductStore } from "../store/productStore";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get("search");

  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);

  const filteredProducts = search
    ? products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

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

        {isLoading ? (
          <Loading />
        ) : filteredProducts.length > 0 ? (
          <div className="mx-auto mb-32 grid grid-cols-2 gap-6 sm:flex sm:flex-wrap xl:gap-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
