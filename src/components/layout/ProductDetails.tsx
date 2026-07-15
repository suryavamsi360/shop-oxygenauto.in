import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Truck, CreditCard, User } from "lucide-react";

import Counter from "./Counter";
import { useCartStore } from "../../store/cartStore";

const PLACEHOLDER_IMAGE = "/placeholder-image.svg";

const getImageSrc = (images: string[] = []) => {
  const firstImage = images.find(
    (image) => typeof image === "string" && image.trim().length > 0,
  );

  if (!firstImage) {
    return PLACEHOLDER_IMAGE;
  }

  return firstImage;
};

interface Product {
  id: number;
  name: string;
  price: number;
  mrp: number;
  images: string[];
}

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const navigate = useNavigate();

  const currency = "₹";

  const [mainImage, setMainImage] = useState(getImageSrc(product.images));

  const cart = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);

  const productId = product.id;

  const addToCartHandler = () => {
    addToCart(productId);
  };

  return (
    <div className="flex gap-12 max-lg:flex-col">
      {/* Images */}
      <div className="flex gap-3 max-sm:flex-col-reverse">
        <div className="flex gap-3 sm:flex-col">
          {product.images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(getImageSrc([image]))}
              className="group flex size-24 cursor-pointer items-center justify-center rounded-lg bg-slate-100"
            >
              <img
                src={getImageSrc([image])}
                alt={product.name}
                className="max-h-20 transition group-hover:scale-105 group-active:scale-95"
              />
            </div>
          ))}
        </div>

        <div className="flex h-96 items-center justify-center rounded-lg bg-slate-100 sm:h-[450px] sm:w-[450px]">
          <img
            src={mainImage}
            alt={product.name}
            className="max-h-72 object-contain"
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">
          {product.name}
        </h1>

        {/* Price */}
        <div className="my-6 flex items-start gap-3 text-2xl font-semibold text-slate-800">
          <p>
            {currency}
            {product.price}
          </p>

          <p className="text-xl text-slate-500 line-through">
            {currency}
            {product.mrp}
          </p>
        </div>

        {/* Discount */}
        <div className="flex items-center gap-2 text-slate-500">
          <Tag size={16} />

          <p>
            Save{" "}
            {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
            right now
          </p>
        </div>

        {/* Cart */}
        <div className="mt-10 flex items-end gap-5">
          {cart[productId] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg font-semibold text-slate-800">Quantity</p>

              <Counter productId={productId} />
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              !cart[productId] ? addToCartHandler() : navigate("/cart")
            }
            className="rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:scale-95"
          >
            {!cart[productId] ? "Add to Cart" : "View Cart"}
          </button>
        </div>

        <hr className="my-5 border-gray-300" />

        {/* Features */}
        <div className="flex flex-col gap-4 text-slate-500">
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
