import { Search, ShoppingCart } from "lucide-react";
import type { FormEvent } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

const Navbar = () => {
  const cartCount = useCartStore((state) => state.total);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

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
          className="flex shrink-0 items-center gap-2 text-[#202522]"
          aria-label="Oxygen Auto home"
        >
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-md bg-white">
            <img
              src="/favicon.ico"
              alt=""
              aria-hidden="true"
              className="size-9 object-contain"
            />
          </span>
          <span className="font-display text-2xl font-bold uppercase leading-none sm:text-3xl">
            Oxygen <span className="text-[#0D542B]">Auto</span>
          </span>
        </Link>

        <form
          key={`desktop-${currentSearch}`}
          onSubmit={handleSearch}
          className="relative ml-auto hidden max-w-2xl flex-1 md:block"
        >
          <label htmlFor="catalog-search" className="sr-only">
            Search parts or item ID
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
            placeholder="Search maker or part name"
            className="h-11 w-full rounded-md border border-[#C9D0C8] bg-[#F8F9F6] pl-10 pr-24 text-sm text-[#202522] outline-none transition placeholder:text-[#8A918B] focus:border-[#0D542B] focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 h-9 rounded-md bg-[#0D542B] px-4 text-xs font-bold uppercase text-white transition hover:bg-[#093F20]"
          >
            Search
          </button>
        </form>

        <div className="ml-auto flex items-center md:ml-0">
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
            className="absolute right-1 top-1 flex size-8 items-center justify-center rounded bg-[#0D542B] text-white transition hover:bg-[#093F20]"
          >
            <Search size={16} />
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
