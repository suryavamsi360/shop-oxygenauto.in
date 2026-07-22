import { useCartStore } from "../../store/cartStore";

interface CounterProps {
  productId: number;
  maxStock?: number;
  className?: string;
}

const Counter = ({ productId, maxStock, className = "" }: CounterProps) => {
  const quantity = useCartStore((state) => state.cartItems[productId] ?? 0);

  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const isAtStockLimit =
    typeof maxStock === "number" ? quantity >= maxStock : false;

  return (
    <div
      className={`inline-flex h-9 items-center gap-2 rounded-full border border-slate-300 bg-white px-2 text-slate-700 shadow-sm sm:gap-3 max-sm:text-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => removeFromCart(productId)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
      >
        −
      </button>

      <span className="min-w-6 text-center text-sm font-semibold text-slate-800">
        {quantity}
      </span>

      {!isAtStockLimit ? (
        <button
          type="button"
          onClick={() => addToCart(productId, maxStock)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-white transition hover:bg-slate-900 active:scale-95"
        >
          +
        </button>
      ) : (
        <span className="h-7 w-7" aria-hidden="true" />
      )}
    </div>
  );
};

export default Counter;
