import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-16 border-t border-[#303832] bg-[#202522] text-[#C7CEC8]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-xl font-bold uppercase text-white">
            Oxygen <span className="text-[#7ED99A]">Auto</span>
          </p>
          <p className="mt-1 text-xs text-[#9EA69F]">
            Automotive parts, matched with precision.
          </p>
        </div>

        <nav
          className="flex items-center gap-5 text-xs font-semibold"
          aria-label="Footer"
        >
          <Link className="transition hover:text-white" to="/products">
            Parts catalogue
          </Link>
          <Link className="transition hover:text-white" to="/cart">
            Cart
          </Link>
        </nav>

        <p className="text-xs text-[#858E87]">&copy; 2026 Oxygen Auto Store</p>
      </div>
    </footer>
  );
}
export default Footer;
