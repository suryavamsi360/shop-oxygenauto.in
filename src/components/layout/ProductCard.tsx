import { Link } from "react-router-dom";

import { useCartStore } from "../../store/cartStore";
import Counter from "./Counter";

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
  id: string | number;
  name: string;
  mrp?: number;
  price: number;
  images: string[];
  maker: string;
  model: string;
  year: string;
  configuration: string;
  stockQuantity: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const currency = "₹";
  const addToCart = useCartStore((state) => state.addToCart);
  const quantity = useCartStore(
    (state) => state.cartItems[Number(product.id)] ?? 0,
  );
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (product.stockQuantity <= 0 || quantity >= product.stockQuantity) {
      return;
    }

    addToCart(Number(product.id), product.stockQuantity);
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="group mx-auto flex h-full w-full max-w-[14rem] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <div>
          <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F5] sm:h-60 sm:w-56">
            {discountPercent > 0 && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={getImageSrc(product.images)}
              alt={product.name}
              className="absolute inset-0 m-auto h-full max-h-[88%] w-full max-w-[88%] object-contain object-center transition duration-300 group-hover:scale-105"
            />
          </div>

          <div className="mt-2 space-y-1.5 p-3 text-slate-800">
            <div className="min-w-0">
              <p className="line-clamp-2 break-words text-sm font-semibold leading-snug text-slate-900 overflow-wrap-anywhere">
                {product.name}
              </p>
            </div>

            <div className="flex items-end justify-between gap-2 rounded-lg bg-slate-50 p-3 ">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Sale price
                </p>
                <p className="text-base font-bold whitespace-nowrap text-slate-900">
                  {currency}
                  {product.price}
                </p>
              </div>

              {product.mrp && product.mrp > product.price && (
                <p className="text-[11px] font-medium whitespace-nowrap text-slate-400 line-through">
                  {currency}
                  {product.mrp}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>

      {quantity > 0 ? (
        <div className="mt-2 flex justify-center">
          <Counter
            productId={Number(product.id)}
            maxStock={product.stockQuantity}
          />
        </div>
      ) : (
        <div className="mt-2 flex justify-center p-1">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
