import {
  Heart,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchAdminDashboard,
  updateAdminOrderStatus,
  type AdminDashboardResponse,
  type OrderStatus,
} from "../services/adminCommerceService";
import { useAuthStore } from "../store/authStore";
import { formatMoney, getCurrencySymbol } from "../utils/currency";

const TABS = ["orders", "carts", "wishlists", "customers"] as const;
const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
  "failed",
  "cancelled",
];

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

const statusClass = (status: string) => {
  if (["delivered", "converted", "active", "accepted"].includes(status)) {
    return "bg-[#E5F3EA] text-[#0D542B]";
  }
  if (["failed", "cancelled", "abandoned"].includes(status)) {
    return "bg-[#FDECEA] text-[#B42318]";
  }
  return "bg-[#FFF4D6] text-[#7A4D00]";
};

const AdminCommerce = () => {
  const navigate = useNavigate();
  const currency = getCurrencySymbol();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("orders");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState("");

  const loadDashboard = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      setDashboard(await fetchAdminDashboard());
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load admin dashboard.",
      );
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!user) {
      navigate("/login?returnTo=%2Fadmin", { replace: true });
      return;
    }
    void loadDashboard();
    const intervalId = window.setInterval(
      () => void loadDashboard(true),
      15_000,
    );
    return () => window.clearInterval(intervalId);
  }, [isAuthInitialized, navigate, user]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOrders = useMemo(
    () =>
      (dashboard?.orders || []).filter((order) =>
        [order.orderReference, order.customerEmail, order.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    [dashboard?.orders, normalizedSearch],
  );
  const filteredCarts = useMemo(
    () =>
      (dashboard?.carts || []).filter((cart) =>
        [cart.id, cart.customerEmail, cart.identityType, cart.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    [dashboard?.carts, normalizedSearch],
  );
  const filteredWishlists = useMemo(
    () =>
      (dashboard?.wishlists || []).filter((wishlist) =>
        [
          wishlist.customerEmail,
          wishlist.userId,
          ...wishlist.items.map((item) => item.itemName),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    [dashboard?.wishlists, normalizedSearch],
  );
  const filteredCustomers = useMemo(
    () =>
      (dashboard?.customers || []).filter((customer) =>
        [customer.email, customer.phone, customer.name, customer.city]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    [dashboard?.customers, normalizedSearch],
  );

  const handleOrderStatus = async (
    orderReference: string,
    status: OrderStatus,
  ) => {
    setUpdatingOrder(orderReference);
    try {
      const { order } = await updateAdminOrderStatus(orderReference, status);
      setDashboard((current) =>
        current
          ? {
              ...current,
              orders: current.orders.map((entry) =>
                entry.orderReference === orderReference ? order : entry,
              ),
            }
          : current,
      );
      setError("");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update order.",
      );
    } finally {
      setUpdatingOrder("");
    }
  };

  if (!isAuthInitialized || (isLoading && !dashboard)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-[#0D542B]">
        <LoaderCircle className="animate-spin" size={30} />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-[#202522]">
          Admin access unavailable
        </h1>
        <p className="mt-3 text-[#68706A]">{error}</p>
      </main>
    );
  }

  const metrics = [
    { label: "Customers", value: dashboard.summary.customers, icon: Users },
    {
      label: "Live orders",
      value: dashboard.summary.liveOrders,
      icon: PackageCheck,
    },
    {
      label: "Active carts",
      value: dashboard.summary.activeCarts,
      icon: ShoppingCart,
    },
    {
      label: "Abandoned",
      value: dashboard.summary.abandonedCarts,
      icon: Heart,
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#D7DCD5] pb-5">
        <div>
          <p className="text-xs font-bold uppercase text-[#0D542B]">
            Operations
          </p>
          <h1 className="font-display text-3xl font-bold text-[#202522]">
            Commerce control room
          </h1>
          <p className="mt-1 text-sm text-[#68706A]">
            Live customer, guest cart, wishlist and order activity
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
          className="flex size-10 items-center justify-center rounded-md border border-[#C9D0C8] text-[#0D542B] hover:bg-[#E5F3EA] disabled:opacity-50"
          title="Refresh dashboard"
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      <section className="grid grid-cols-2 border-b border-[#D7DCD5] md:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border-r border-[#D7DCD5] px-3 py-5 last:border-r-0 sm:px-5"
          >
            <div className="flex items-center gap-2 text-[#68706A]">
              <Icon size={17} />
              <span className="text-xs font-bold uppercase">{label}</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-[#202522]">
              {value}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-x-auto border-b border-[#D7DCD5]">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-semibold capitalize ${
                activeTab === tab
                  ? "border-[#0D542B] text-[#0D542B]"
                  : "border-transparent text-[#68706A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${activeTab}`}
          className="h-10 w-full rounded-md border border-[#C9D0C8] bg-white px-3 text-sm outline-none focus:border-[#0D542B] sm:w-72"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 border-l-4 border-[#B42318] bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]"
        >
          {error}
        </p>
      )}

      <section className="mt-4 overflow-x-auto border-y border-[#D7DCD5] bg-white">
        {activeTab === "orders" && (
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Placed</th>
                <th className="p-3">Webhook</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#E1E5DF]">
                  <td className="p-3 font-mono text-xs">
                    {order.orderReference}
                  </td>
                  <td className="p-3">
                    <p className="font-medium">
                      {order.customerEmail || "Guest"}
                    </p>
                    <p className="text-xs text-[#68706A]">
                      {order.destinationPincode || "-"}
                    </p>
                  </td>
                  <td className="p-3">{order.itemCount}</td>
                  <td className="p-3 font-semibold">
                    {currency}
                    {formatMoney(order.totalAmount)}
                  </td>
                  <td className="p-3 text-xs">{formatDate(order.placedAt)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(order.webhookStatus)}`}
                    >
                      {order.webhookStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      disabled={updatingOrder === order.orderReference}
                      onChange={(event) =>
                        void handleOrderStatus(
                          order.orderReference,
                          event.target.value as OrderStatus,
                        )
                      }
                      className={`h-9 rounded-md border-0 px-2 text-xs font-semibold ${statusClass(order.status)}`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "carts" && (
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Identity</th>
                <th className="p-3">Items</th>
                <th className="p-3">Value</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.map((cart) => (
                <tr
                  key={cart.id}
                  className="border-t border-[#E1E5DF] align-top"
                >
                  <td className="p-3">
                    <span className="text-xs font-bold uppercase text-[#0D542B]">
                      {cart.identityType}
                    </span>
                    <p className="mt-1 text-xs">
                      {cart.customerEmail || cart.id.slice(0, 12)}
                    </p>
                  </td>
                  <td className="max-w-md p-3">
                    {cart.items.length
                      ? cart.items
                          .map((item) => `${item.quantity}x ${item.name}`)
                          .join(", ")
                      : "Empty"}
                  </td>
                  <td className="p-3">
                    {cart.subtotalSnapshot === null
                      ? "-"
                      : `${currency}${formatMoney(cart.subtotalSnapshot)}`}
                  </td>
                  <td className="p-3 capitalize">
                    {cart.checkoutStage.replaceAll("_", " ")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(cart.status)}`}
                    >
                      {cart.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    {formatDate(cart.lastActivityAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "wishlists" && (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Saved items</th>
                <th className="p-3">Count</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredWishlists.map((wishlist) => (
                <tr
                  key={wishlist.userId}
                  className="border-t border-[#E1E5DF] align-top"
                >
                  <td className="p-3">
                    {wishlist.customerEmail || wishlist.userId}
                  </td>
                  <td className="max-w-2xl p-3">
                    {wishlist.items.map((item) => item.itemName).join(", ")}
                  </td>
                  <td className="p-3">{wishlist.items.length}</td>
                  <td className="p-3 text-xs">
                    {formatDate(wishlist.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "customers" && (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3">Wishlist</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-[#E1E5DF]">
                  <td className="p-3">
                    <p className="font-medium">{customer.name || "Customer"}</p>
                    <p className="text-xs text-[#68706A]">{customer.email}</p>
                  </td>
                  <td className="p-3">{customer.phone || "-"}</td>
                  <td className="p-3">
                    {[customer.city, customer.state]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>
                  <td className="p-3">{customer.wishlistCount}</td>
                  <td className="p-3 text-xs">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="p-3 text-xs">
                    {formatDate(customer.lastSignInAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="mt-3 text-right text-xs text-[#8A918B]">
        Updated {formatDate(dashboard.generatedAt)} · refreshes every 15 seconds
      </p>
    </main>
  );
};

export default AdminCommerce;
