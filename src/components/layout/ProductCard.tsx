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

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(Number(product.id));
  };

  return (
    <div className="group mx-auto block w-full max-w-[15rem] min-w-0 overflow-hidden">
      <Link to={`/products/${product.id}`} className="block">
        <div>
          <div className="flex h-40 items-center justify-center rounded-lg bg-[#F5F5F5] sm:h-68 sm:w-60">
            <img
              src={getImageSrc(product.images)}
              alt={product.name}
              className="max-h-30 w-auto transition duration-300 group-hover:scale-110 sm:max-h-40"
            />
          </div>

          <div className="flex justify-between gap-3 pt-2 text-sm text-slate-800">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 break-words overflow-wrap-anywhere">
                {product.name}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                {product.maker} | {product.model} | {product.year}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                {product.configuration} | Stock: {product.stockQuantity}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 rounded-md bg-green-50 px-2 py-1">
              <p className="text-base font-bold whitespace-nowrap text-slate-900">
                {currency}
                {product.price}
              </p>
              {product.mrp && product.mrp > product.price && (
                <p className="text-xs font-medium text-slate-400 line-through">
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
          <Counter productId={Number(product.id)} />
        </div>
      ) : (
        <div className="mt-2 flex py-2 justify-center">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-1/2 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-2.5 py-2.5 text-[11px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
