import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Loading from "../components/layout/Loading";
import ProductCompatibilityList from "../components/layout/ProductCompatibilityList";
import ProductDescription from "../components/layout/ProductDescription";
import ProductDetails from "../components/layout/ProductDetails";
import SimilarProducts from "../components/layout/SimilarProducts";
import ProductTestingInfo from "../components/layout/ProductTestingInfo";

import { useProductStore } from "../store/productStore";
import type { ProductItem } from "../types/product";

const Product = () => {
  const { itemId } = useParams();

  const products = useProductStore((state) => state.products);
  const loadProductDetail = useProductStore((state) => state.loadProductDetail);
  const isDetailsLoading = useProductStore((state) => state.isDetailsLoading);

  const [loadedProduct, setLoadedProduct] = useState<{
    itemId: string;
    product: ProductItem;
  } | null>(null);
  const [detailsError, setDetailsError] = useState<{
    itemId: string;
    message: string;
  } | null>(null);
  const product =
    loadedProduct && loadedProduct.itemId === itemId
      ? loadedProduct.product
      : null;
  const currentError =
    detailsError && detailsError.itemId === itemId ? detailsError.message : "";

  useEffect(() => {
    if (!itemId) return;

    let isMounted = true;

    void loadProductDetail(itemId)
      .then((response) => {
        if (!isMounted) return;
        setLoadedProduct({ itemId, product: response });
        setDetailsError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setDetailsError({
          itemId,
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while loading product details.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [itemId, loadProductDetail]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [itemId]);

  const listProduct = itemId
    ? products.find((item) => item.itemId === itemId)
    : undefined;

  if (isDetailsLoading && !product) {
    return <Loading />;
  }

  if (currentError) {
    return (
      <div className="mx-6 py-12 text-center text-slate-500">
        <p>{currentError}</p>
      </div>
    );
  }

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
          {(product?.category || listProduct?.category) && (
            <>
              <span>/</span>
              <span className="text-slate-700">
                {product?.category || listProduct?.category}
              </span>
            </>
          )}
        </div>

        {/* Product Details */}
        {product && <ProductDetails key={product.itemId} product={product} />}

        {/* Description */}
        {product && <ProductDescription product={product} />}

        {/* Similar Products */}
        {product && <SimilarProducts key={product.itemId} product={product} />}

        {/* Testing Data */}
        {product && <ProductTestingInfo product={product} />}

        {/* Compatibility List */}
        {product && <ProductCompatibilityList product={product} />}
      </div>
    </div>
  );
};

export default Product;
