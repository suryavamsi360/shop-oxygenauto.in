import { Link } from "react-router-dom";

import { useCartStore } from "../../store/cartStore";
import type { ProductListItem } from "../../types/product";
import { formatMoney, getCurrencySymbol } from "../../utils/currency";
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

interface ProductCardProps {
  product: ProductListItem;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const currency = getCurrencySymbol();
  const addToCart = useCartStore((state) => state.addToCart);
  const quantity = useCartStore(
    (state) => state.cartItems[product.itemId] ?? 0,
  );
  const discountPercent = Math.round(product.discountPercent ?? 0);
  const primaryName =
    product.partTitle?.trim() || product.partName?.trim() || product.name;
  const partName = product.partName?.trim() || "";
  const showPartName =
    partName.length > 0 && partName.toLowerCase() !== primaryName.toLowerCase();

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (product.stockQuantity <= 0 || quantity >= product.stockQuantity) {
      return;
    }

    addToCart(product.itemId, product.stockQuantity);
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="group mx-auto flex h-full w-full max-w-[14rem] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.itemId}`} className="block">
        <div>
          <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F5] sm:h-60 sm:w-56">
            {discountPercent > 0 && discountPercent <= 100 && (
              <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={getImageSrc(product.images)}
              alt={primaryName}
              className="absolute inset-0 z-0 m-auto h-full max-h-[88%] w-full max-w-[88%] object-contain object-center transition duration-300 group-hover:scale-105"
            />
          </div>

          <div className="mt-2 space-y-1.5 p-3 text-slate-800">
            <div className="min-h-[3.25rem] min-w-0">
              <p className="line-clamp-2 break-words text-sm font-semibold leading-snug text-slate-900 overflow-wrap-anywhere">
                {primaryName}
              </p>
              {showPartName && (
                <p className="mt-0.5 line-clamp-1 break-words text-xs text-slate-500">
                  {partName}
                </p>
              )}
            </div>

            <div className="flex min-h-[5.5rem] flex-col justify-center rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Price
              </p>
              <p className="mt-0.5 whitespace-nowrap text-lg font-bold text-slate-900">
                {currency}
                {formatMoney(product.price)}
              </p>
              {Number.isFinite(product.mrp) && product.mrp > 0 && (
                <p className="text-[11px] font-medium whitespace-nowrap text-slate-400 line-through">
                  {currency}
                  {formatMoney(product.mrp)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>

      {quantity > 0 ? (
        <div className="mt-2 flex justify-center p-1">
          <Counter
            itemId={product.itemId}
            maxStock={product.stockQuantity}
            className="w-full justify-between"
          />
        </div>
      ) : (
        <div className="mt-2 flex justify-center p-1">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="h-9 w-full rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-3 text-[11px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
