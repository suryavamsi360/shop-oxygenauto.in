import { ShoppingCart } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

const Navbar = () => {
  const cartCount = useCartStore((state) => state.total);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mx-auto px-6 h-16">
        <Link to="/" className="text-slate-700 font-bold text-3xl">
          <span className="text-green-600">Oxygen</span>
          <span className="text-green-900">auto.in</span>
        </Link>
        <div className="items-center gap-8 px-4 md:flex">
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm transition ${
                isActive
                  ? "font-semibold text-green-600"
                  : "text-slate-600 hover:border-green-300 hover:text-green-600"
              }`
            }
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={22} />
              <span className="text-sm font-medium">Cart</span>
            </div>

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[11px] font-semibold text-white">
              {cartCount}
            </span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
