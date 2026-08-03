import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

import { useCartStore } from "../../store/cartStore";
import type { ProductListItem } from "../../types/product";
import { formatMoney, getCurrencySymbol } from "../../utils/currency";
import { getProductImage } from "../../utils/productImage";
import Counter from "./Counter";

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
  const hasValidDiscount = discountPercent > 0 && discountPercent <= 100;
  const partTitle = product.partTitle?.trim() || "";
  const partName = product.partName?.trim() || "";
  const primaryName = partTitle || partName || product.name;
  const showPartName = partTitle.length > 0 && partName.length > 0;

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
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-[#D7DCD5] bg-white shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:border-[#AEB8AF] hover:shadow-[var(--shadow-md)]">
      <Link to={`/products/${product.itemId}`} className="block">
        <div className="relative aspect-square overflow-hidden border-b border-[#E1E5DF] bg-[#F0F2ED]">
          {hasValidDiscount && (
            <span className="absolute left-1 top-1 z-20 rounded-sm bg-[#00A63E] px-1 py-0.5 text-[8px] font-bold leading-none text-white shadow-sm sm:left-2 sm:top-2 sm:px-1.5 sm:py-1 sm:text-[9px]">
              {discountPercent}%<span className="hidden sm:inline"> off</span>
            </span>
          )}
          <span
            className={`absolute right-1 top-1 z-20 size-2 rounded-full border border-white sm:right-2 sm:top-2 ${isOutOfStock ? "bg-[#B42318]" : "bg-[#0D542B]"}`}
            title={
              isOutOfStock
                ? "Out of stock"
                : `${product.stockQuantity} in stock`
            }
          />
          <img
            src={getProductImage(product.images)}
            alt={primaryName}
            className="absolute inset-0 m-auto h-full max-h-[82%] w-full max-w-[82%] object-contain transition duration-300 group-hover:scale-[1.04]"
          />
        </div>

        <div className="p-1.5 sm:p-3 sm:pb-2">
          <div className="mb-1 hidden items-center justify-between gap-1 text-[8px] font-bold uppercase text-[#778078] sm:flex">
            <span className="truncate">{product.category || "Auto part"}</span>
            <span
              className={isOutOfStock ? "text-[#B42318]" : "text-[#0D542B]"}
            >
              {isOutOfStock
                ? "Out of stock"
                : `${product.stockQuantity} in stock`}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 break-words text-xs font-semibold leading-4 text-[#202522] sm:text-sm sm:leading-5">
              {primaryName}
            </h3>
            {showPartName && (
              <p className="mt-0.5 line-clamp-1 text-[10px] leading-4 text-[#68706A] sm:text-xs">
                {partName}
              </p>
            )}
          </div>

          <div className="mt-2 flex items-end gap-1.5">
            <p className="font-display whitespace-nowrap text-lg font-bold leading-none text-[#202522] sm:text-xl">
              {currency}
              {formatMoney(product.price)}
            </p>
            {hasValidDiscount && product.mrp > 0 && (
              <p className="hidden whitespace-nowrap text-[9px] font-medium text-[#8A918B] line-through md:block">
                {currency}
                {formatMoney(product.mrp)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {quantity > 0 ? (
        <div className="mt-auto p-1.5 pt-0 sm:p-2 sm:pt-0">
          <Counter
            itemId={product.itemId}
            maxStock={product.stockQuantity}
            className="w-full"
            compact
          />
        </div>
      ) : (
        <div className="mt-auto p-1.5 pt-0 sm:p-2 sm:pt-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={
              isOutOfStock ? "Out of stock" : `Add ${primaryName} to cart`
            }
            className="flex h-8 w-full items-center justify-center gap-1 rounded-md bg-[#0D542B] px-1 text-[9px] font-bold uppercase text-white transition hover:bg-[#093F20] disabled:cursor-not-allowed disabled:bg-[#8A918B]"
          >
            {!isOutOfStock && <ShoppingCart size={13} />}
            <span>{isOutOfStock ? "Out of stock" : "Add to cart"}</span>
          </button>
        </div>
      )}
    </article>
  );
};

export default ProductCard;
