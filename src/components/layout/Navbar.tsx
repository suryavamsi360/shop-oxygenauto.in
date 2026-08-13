import { Heart, LogIn, Search, ShieldCheck, ShoppingCart } from "lucide-react";
import type { FormEvent } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import ProfileMenu from "./ProfileMenu";
import { useWishlistStore } from "../../store/wishlistStore";

const Navbar = () => {
  const cartCount = useCartStore((state) => state.total);
  const wishlistCount = useWishlistStore((state) => state.itemIds.length);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const isAdmin =
    String(user?.app_metadata?.role || "")
      .trim()
      .toLowerCase() === "admin";

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(
      new FormData(event.currentTarget).get("search") || "",
    ).trim();
    navigate(
      query ? `/products?search=${encodeURIComponent(query)}` : "/products",
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#D7DCD5] bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:gap-4 md:py-0 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="Oxygen Auto home"
        >
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>

        <form
          key={`desktop-${currentSearch}`}
          onSubmit={handleSearch}
          className="relative ml-auto hidden max-w-2xl flex-1 md:block"
        >
          <label htmlFor="catalog-search" className="sr-only">
            Search Maker or Part Name
          </label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68706A]"
            size={18}
          />
          <input
            id="catalog-search"
            name="search"
            defaultValue={currentSearch}
            placeholder="Search Maker or Part Name"
            className="h-11 w-full rounded-md border border-[#C9D0C8] bg-[#F8F9F6] pl-10 pr-24 text-sm text-[#202522] outline-none transition placeholder:text-[#8A918B] focus:border-[#0D542B] focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 h-9 rounded-md bg-[#187A45] px-4 text-xs font-bold uppercase text-white transition hover:bg-[#126638]"
          >
            Search
          </button>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isAdmin && (
            <NavLink
              to="/admin"
              aria-label="Admin panel"
              title="Admin panel"
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-2 rounded-md border px-3 transition ${
                  isActive
                    ? "border-[#187A45] bg-[#187A45] text-white"
                    : "border-[#B8D8C2] bg-[#E5F3EA] text-[#0D542B] hover:bg-[#D8EDDF]"
                }`
              }
            >
              <ShieldCheck size={19} />
              <span className="hidden text-sm font-semibold xl:inline">
                Admin
              </span>
            </NavLink>
          )}
          {isInitialized &&
            (user ? (
              <ProfileMenu user={user} onSignOut={signOut} />
            ) : (
              <Link
                to="/login"
                className="flex min-h-11 items-center gap-2 rounded-md border border-[#0D542B] bg-white px-3 text-[#0D542B] transition hover:bg-[#E5F3EA]"
              >
                <LogIn size={18} />
                <span className="hidden text-sm font-semibold lg:inline">
                  Login
                </span>
              </Link>
            ))}
          <NavLink
            to="/wishlist"
            aria-label="Wishlist"
            title="Wishlist"
            className={({ isActive }) =>
              `relative flex size-11 items-center justify-center rounded-md border transition ${
                isActive
                  ? "border-[#0D542B] bg-[#E5F3EA] text-[#0D542B]"
                  : "border-[#C9D0C8] bg-white text-[#3E453F] hover:border-[#0D542B] hover:text-[#0D542B]"
              }`
            }
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#0D542B] px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative flex min-h-11 items-center gap-2 rounded-md border px-3 transition ${
                isActive
                  ? "border-[#0D542B] bg-[#E5F3EA] text-[#0D542B]"
                  : "border-[#C9D0C8] bg-white text-[#3E453F] hover:border-[#0D542B] hover:text-[#0D542B]"
              }`
            }
          >
            <ShoppingCart size={20} />
            <span className="hidden text-sm font-semibold sm:inline">Cart</span>
            <span className="flex min-w-5 items-center justify-center rounded-full bg-[#0D542B] px-1.5 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </NavLink>
        </div>

        <form
          key={`mobile-${currentSearch}`}
          onSubmit={handleSearch}
          className="relative basis-full md:hidden"
        >
          <label htmlFor="mobile-catalog-search" className="sr-only">
            Search parts or item ID
          </label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68706A]"
            size={17}
          />
          <input
            id="mobile-catalog-search"
            name="search"
            defaultValue={currentSearch}
            placeholder="Search parts or item ID"
            className="h-10 w-full rounded-md border border-[#C9D0C8] bg-[#F8F9F6] pl-10 pr-12 text-sm text-[#202522] outline-none placeholder:text-[#8A918B] focus:border-[#0D542B] focus:bg-white"
          />
          <button
            type="submit"
            aria-label="Search catalogue"
            className="absolute right-1 top-1 flex size-8 items-center justify-center rounded bg-[#187A45] text-white transition hover:bg-[#126638]"
          >
            <Search size={16} />
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
