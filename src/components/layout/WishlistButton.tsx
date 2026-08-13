import { Heart } from "lucide-react";

import {
  addWishlistItem,
  removeWishlistItem,
} from "../../services/wishlistService";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";

interface WishlistButtonProps {
  itemId: string;
  itemName: string;
  className?: string;
}

const WishlistButton = ({ itemId, itemName, className = "" }: WishlistButtonProps) => {
  const isSaved = useWishlistStore((state) => state.itemIds.includes(itemId));
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const user = useAuthStore((state) => state.user);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const isAdded = toggleItem(itemId);
    if (!user) return;

    const request = isAdded ? addWishlistItem(itemId) : removeWishlistItem(itemId);
    void request.catch(() => toggleItem(itemId));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      aria-label={`${isSaved ? "Remove" : "Save"} ${itemName} ${isSaved ? "from" : "to"} wishlist`}
      aria-pressed={isSaved}
      className={`flex size-9 items-center justify-center rounded-md border border-[#D7DCD5] bg-white/95 text-[#0D542B] shadow-sm transition hover:border-[#0D542B] ${className}`}
    >
      <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
};

export default WishlistButton;