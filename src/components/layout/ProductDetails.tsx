import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Truck, CreditCard, User } from "lucide-react";

import Counter from "./Counter";
import { useCartStore } from "../../store/cartStore";
import type { ProductItem } from "../../types/product";
import { formatMoney, getCurrencySymbol } from "../../utils/currency";
import { getProductImage } from "../../utils/productImage";

interface ProductDetailsProps {
  product: ProductItem;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const navigate = useNavigate();

  const currency = getCurrencySymbol();

  const [mainImage, setMainImage] = useState(getProductImage(product.images));

  const cart = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);

  const itemId = product.itemId;
  const quantity = cart[itemId] ?? 0;
  const isOutOfStock = product.stockQuantity <= 0;
  const hasValidDiscount =
    product.discountPercent > 0 && product.discountPercent <= 100;
  const primaryName =
    product.partTitle?.trim() || product.partName?.trim() || product.name;
  const partName = product.partName?.trim() || "";
  const showPartName =
    partName.length > 0 && partName.toLowerCase() !== primaryName.toLowerCase();

  const addToCartHandler = () => {
    if (isOutOfStock || quantity >= product.stockQuantity) {
      return;
    }

    addToCart(itemId, product.stockQuantity);
  };

  return (
    <div className="flex gap-12 max-lg:flex-col">
      {/* Images */}
      <div className="flex gap-3 max-sm:flex-col-reverse">
        <div className="flex gap-3 sm:flex-col">
          {product.images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(getProductImage([image]))}
              className="group flex size-24 cursor-pointer items-center justify-center rounded-lg bg-slate-100"
            >
              <img
                src={getProductImage([image])}
                alt={primaryName}
                className="max-h-20 transition group-hover:scale-105 group-active:scale-95"
              />
            </div>
          ))}
        </div>

        <div className="flex h-96 items-center justify-center rounded-lg bg-slate-100 sm:h-[450px] sm:w-[450px]">
          <img
            src={mainImage}
            alt={primaryName}
            className="max-h-72 object-contain"
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">{primaryName}</h1>
        {showPartName && (
          <p className="mt-1 text-sm text-slate-500">{partName}</p>
        )}

        {/* Price */}
        <div className="my-6 flex items-start gap-3 text-2xl font-semibold text-slate-800">
          <p>
            {currency}
            {formatMoney(product.price)}
          </p>

          {hasValidDiscount && (
            <p className="text-xl text-slate-500 line-through">
              {currency}
              {formatMoney(product.mrp)}
            </p>
          )}
        </div>

        {/* Discount */}
        {hasValidDiscount && (
          <div className="flex items-center gap-2 text-slate-500">
            <Tag size={16} />

            <p>Save {Math.round(product.discountPercent)}% right now</p>
          </div>
        )}

        {/* Cart */}
        <div className="mt-10 flex items-end gap-5">
          {cart[itemId] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg font-semibold text-slate-800">Quantity</p>

              <Counter itemId={itemId} maxStock={product.stockQuantity} />
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              !cart[itemId] ? addToCartHandler() : navigate("/cart")
            }
            disabled={!cart[itemId] && isOutOfStock}
            className="rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:scale-95"
          >
            {!cart[itemId]
              ? isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"
              : "View Cart"}
          </button>
        </div>

        <hr className="my-5 border-gray-300" />

        <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 lg:grid-cols-3">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Vehicle Info
            </h3>
            <p>
              <span className="font-medium text-slate-700">Maker:</span>{" "}
              {product.maker}
            </p>
            <p>
              <span className="font-medium text-slate-700">Model:</span>{" "}
              {product.model}
            </p>
            <p>
              <span className="font-medium text-slate-700">Configuration:</span>{" "}
              {product.configuration}
            </p>
            <p>
              <span className="font-medium text-slate-700">Year:</span>{" "}
              {product.year}
            </p>
            <p>
              <span className="font-medium text-slate-700">Fuel:</span>{" "}
              {product.fuel || "-"}
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Product Category
            </h3>
            <p>
              <span className="font-medium text-slate-700">Group:</span>{" "}
              {product.category}
            </p>
            <p>
              <span className="font-medium text-slate-700">Class:</span>{" "}
              {product.className}
            </p>
            <p>
              <span className="font-medium text-slate-700">Sub Class:</span>{" "}
              {product.subCategory || "-"}
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Stock And Condition
            </h3>
            <p>
              <span className="font-medium text-slate-700">Part Number:</span>{" "}
              {product.partNumber}
            </p>
            <p>
              <span className="font-medium text-slate-700">Stock:</span>{" "}
              {product.stockQuantity}
            </p>
            <p>
              <span className="font-medium text-slate-700">Condition:</span>{" "}
              {product.condition}
            </p>
          </section>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-4 pt-5 text-slate-500">
          <p className="flex gap-3">
            <Truck className="text-slate-400" />
            Lowest Shipping Charges
          </p>

          <p className="flex gap-3">
            <CreditCard className="text-slate-400" />
            100% Secure Payment
          </p>

          <p className="flex gap-3">
            <User className="text-slate-400" />
            Trusted by Oxygen Auto customers
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
