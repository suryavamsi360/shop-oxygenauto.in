import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ProductDescription from "../../src/components/layout/ProductDescription";
import ProductDetails from "../../src/components/layout/ProductDetails";

import { useProductStore } from "../../src/store/productStore";

const Product = () => {
  const { id } = useParams();

  const products = useProductStore((state) => state.products);

  const [product, setProduct] = useState<any>(null);
  console.log("🚀 ~ file: ProductDetails.tsx:13 ~ Product ~ product:", product);

  useEffect(() => {
    if (!products.length || !id) return;

    const selectedProduct = products.find((item: any) => item.id === id);

    setProduct(selectedProduct ?? null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [id, products]);

  return (
    <div className="mx-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="my-8 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="transition hover:text-slate-900">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="transition hover:text-slate-900">
            Products
          </Link>
          {product?.category && (
            <>
              <span>/</span>
              <span className="text-slate-700">{product.category}</span>
            </>
          )}
        </div>

        {/* Product Details */}
        {product && <ProductDetails product={product} />}

        {/* Description */}
        {product && <ProductDescription product={product} />}
      </div>
    </div>
  );
};

export default Product;
