import { useCartStore } from "../../store/cartStore";

interface CounterProps {
  productId: number;
  maxStock?: number;
}

const Counter = ({ productId, maxStock }: CounterProps) => {
  const quantity = useCartStore((state) => state.cartItems[productId] ?? 0);

  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const isAtStockLimit =
    typeof maxStock === "number" ? quantity >= maxStock : false;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-2 py-1 text-slate-700 shadow-sm sm:gap-3 max-sm:text-sm">
      <button
        type="button"
        onClick={() => removeFromCart(productId)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
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
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-white transition hover:bg-slate-900 active:scale-95"
        >
          +
        </button>
      ) : (
        <span className="h-8 w-8" aria-hidden="true" />
      )}
    </div>
  );
};

export default Counter;
