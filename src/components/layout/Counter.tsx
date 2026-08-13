import { useCartStore } from "../../store/cartStore";

interface CounterProps {
  itemId: string;
  maxStock?: number;
  className?: string;
  compact?: boolean;
}

const Counter = ({
  itemId,
  maxStock,
  className = "",
  compact = false,
}: CounterProps) => {
  const quantity = useCartStore((state) => state.cartItems[itemId] ?? 0);

  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const isAtStockLimit =
    typeof maxStock === "number" ? quantity >= maxStock : false;

  return (
    <div
      className={`inline-flex items-center justify-between rounded-md border border-[#BFC7BE] bg-white text-[#202522] shadow-sm ${compact ? "h-8 gap-0 px-0.5" : "h-11 gap-2 px-1.5"} ${className}`}
    >
      <button
        type="button"
        onClick={() => removeFromCart(itemId)}
        aria-label="Decrease quantity"
        className={`flex items-center justify-center rounded font-semibold text-[#515852] transition hover:bg-[#E9ECE6] active:translate-y-px ${compact ? "size-6 text-sm" : "size-8 text-lg"}`}
      >
        −
      </button>

      <span
        className={`${compact ? "min-w-4 text-[10px]" : "min-w-7 text-sm"} text-center font-bold text-[#202522]`}
      >
        {quantity}
      </span>

      {!isAtStockLimit ? (
        <button
          type="button"
          onClick={() => addToCart(itemId, maxStock)}
          aria-label="Increase quantity"
          className={`flex items-center justify-center rounded bg-[#187A45] font-semibold text-white transition hover:bg-[#126638] active:translate-y-px ${compact ? "size-6 text-sm" : "size-8 text-lg"}`}
        >
          +
        </button>
      ) : (
        <span className={compact ? "size-6" : "size-8"} aria-hidden="true" />
      )}
    </div>
  );
};

export default Counter;
