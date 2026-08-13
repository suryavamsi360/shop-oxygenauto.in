import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Heart,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchAdminDashboard,
  updateAdminOrderStatus,
  type AdminDashboardResponse,
  type AdminCustomer,
  type OrderStatus,
} from "../services/adminCommerceService";
import { useAuthStore } from "../store/authStore";
import { formatMoney, getCurrencySymbol } from "../utils/currency";

const TABS = ["orders", "carts", "wishlists", "customers", "admins"] as const;
const ROWS_PER_PAGE = 15;
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

const descendingByDate = <T,>(
  items: T[],
  getDate: (item: T) => string | null,
) =>
  [...items].sort(
    (left, right) =>
      new Date(getDate(right) || 0).getTime() -
      new Date(getDate(left) || 0).getTime(),
  );

const ProductLink = ({ itemId, name }: { itemId: string; name: string }) => (
  <a
    href={`/products/${encodeURIComponent(itemId)}`}
    target="_blank"
    rel="noreferrer"
    className="font-medium text-[#0D542B] underline decoration-[#AFC8B7] underline-offset-2 hover:decoration-[#0D542B]"
  >
    {name}
  </a>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <label className="flex min-w-36 flex-col gap-1 text-xs font-semibold text-[#68706A]">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-md border border-[#C9D0C8] bg-white px-2 text-sm font-normal capitalize text-[#202522] outline-none focus:border-[#0D542B]"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  </label>
);

const CollapsibleItemList = ({
  listId,
  items,
}: {
  listId: string;
  items: Array<{ itemId: string; name: string; quantity?: number }>;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = items.length > 4;

  return (
    <div>
      <div
        id={listId}
        className={`space-y-1 ${canExpand && !isExpanded ? "max-h-24 overflow-hidden" : ""}`}
      >
        {items.map((item) => (
          <p key={item.itemId}>
            {item.quantity ? `${item.quantity}x ` : ""}
            <ProductLink itemId={item.itemId} name={item.name} />
          </p>
        ))}
      </div>
      {canExpand && (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className="mt-2 text-xs font-semibold text-[#187A45] underline underline-offset-2"
        >
          {isExpanded ? "Show less" : `Show ${items.length - 4} more`}
        </button>
      )}
    </div>
  );
};

const Pagination = ({
  page,
  totalRows,
  onPageChange,
}: {
  page: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));
  const firstRow = totalRows === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const lastRow = Math.min(page * ROWS_PER_PAGE, totalRows);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D7DCD5] px-3 py-3 text-xs text-[#68706A]">
      <span>
        Showing {firstRow}-{lastRow} of {totalRows}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          title="Previous page"
          aria-label="Previous page"
          className="flex size-8 items-center justify-center rounded-md border border-[#C9D0C8] text-[#0D542B] hover:bg-[#E5F3EA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-20 text-center font-semibold text-[#202522]">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          title="Next page"
          aria-label="Next page"
          className="flex size-8 items-center justify-center rounded-md border border-[#C9D0C8] text-[#0D542B] hover:bg-[#E5F3EA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
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
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState({
    orderStatus: "",
    webhookStatus: "",
    cartIdentity: "",
    cartStage: "",
    cartStatus: "",
    location: "",
    customerEmail: "",
    customerPhone: "",
    hideWithoutContact: true,
  });
  const setColumnFilter = <Name extends keyof typeof columnFilters>(
    name: Name,
    value: (typeof columnFilters)[Name],
  ) => setColumnFilters((current) => ({ ...current, [name]: value }));

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
      descendingByDate(
        (dashboard?.orders || []).filter(
          (order) =>
            [order.orderReference, order.customerEmail, order.status]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch) &&
            (!columnFilters.orderStatus ||
              order.status === columnFilters.orderStatus) &&
            (!columnFilters.webhookStatus ||
              order.webhookStatus === columnFilters.webhookStatus),
        ),
        (order) => order.updatedAt,
      ),
    [
      columnFilters.orderStatus,
      columnFilters.webhookStatus,
      dashboard?.orders,
      normalizedSearch,
    ],
  );
  const filteredCarts = useMemo(
    () =>
      descendingByDate(
        (dashboard?.carts || []).filter(
          (cart) =>
            [
              cart.id,
              cart.customerEmail,
              cart.customerPhone,
              cart.identityType,
              cart.status,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch) &&
            (!columnFilters.cartIdentity ||
              cart.identityType === columnFilters.cartIdentity) &&
            (!columnFilters.cartStage ||
              cart.checkoutStage === columnFilters.cartStage) &&
            (!columnFilters.cartStatus ||
              cart.status === columnFilters.cartStatus),
        ),
        (cart) => cart.lastActivityAt,
      ),
    [
      columnFilters.cartIdentity,
      columnFilters.cartStage,
      columnFilters.cartStatus,
      dashboard?.carts,
      normalizedSearch,
    ],
  );
  const filteredWishlists = useMemo(
    () =>
      descendingByDate(
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
        (wishlist) => wishlist.updatedAt,
      ),
    [dashboard?.wishlists, normalizedSearch],
  );
  const filteredCustomers = useMemo(
    () =>
      descendingByDate(
        (dashboard?.customers || []).filter(
          (customer) =>
            [
              customer.email,
              customer.phone,
              customer.name,
              customer.city,
              customer.role,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch) &&
            [customer.city, customer.state]
              .join(" ")
              .toLowerCase()
              .includes(columnFilters.location.toLowerCase()) &&
            customer.email
              .toLowerCase()
              .includes(columnFilters.customerEmail.trim().toLowerCase()) &&
            customer.phone
              .toLowerCase()
              .includes(columnFilters.customerPhone.trim().toLowerCase()) &&
            (!columnFilters.hideWithoutContact ||
              Boolean(customer.email.trim() || customer.phone.trim())),
        ),
        (customer) => customer.lastUpdatedAt,
      ),
    [
      columnFilters.location,
      columnFilters.customerEmail,
      columnFilters.customerPhone,
      columnFilters.hideWithoutContact,
      dashboard?.customers,
      normalizedSearch,
    ],
  );
  const filteredAdmins = useMemo(
    () =>
      descendingByDate(
        (dashboard?.admins || []).filter((admin) =>
          [admin.email, admin.phone, admin.name, admin.city]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch),
        ),
        (admin) => admin.lastUpdatedAt,
      ),
    [dashboard?.admins, normalizedSearch],
  );
  const filteredRowsByTab = {
    orders: filteredOrders,
    carts: filteredCarts,
    wishlists: filteredWishlists,
    customers: filteredCustomers,
    admins: filteredAdmins,
  };
  const activeRowCount = filteredRowsByTab[activeTab].length;
  const totalPages = Math.max(1, Math.ceil(activeRowCount / ROWS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * ROWS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(
    pageStart,
    pageStart + ROWS_PER_PAGE,
  );
  const paginatedCarts = filteredCarts.slice(
    pageStart,
    pageStart + ROWS_PER_PAGE,
  );
  const paginatedWishlists = filteredWishlists.slice(
    pageStart,
    pageStart + ROWS_PER_PAGE,
  );
  const paginatedCustomers = filteredCustomers.slice(
    pageStart,
    pageStart + ROWS_PER_PAGE,
  );
  const paginatedAdmins = filteredAdmins.slice(
    pageStart,
    pageStart + ROWS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, columnFilters, search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  const selectedCustomer = [
    ...(dashboard?.customers || []),
    ...(dashboard?.admins || []),
  ].find((customer) => customer.id === selectedCustomerId);
  const openCustomer = (customerId: string | null) => {
    if (customerId) setSelectedCustomerId(customerId);
  };

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
      label: "Wishlist items",
      value: dashboard.summary.wishlistItems,
      icon: Heart,
    },
    {
      label: "Abandoned",
      value: dashboard.summary.abandonedCarts,
      icon: CircleAlert,
    },
  ];
  const tabCounts: Record<(typeof TABS)[number], number> = {
    orders: dashboard.orders.length,
    carts: dashboard.carts.reduce((total, cart) => total + cart.itemCount, 0),
    wishlists: dashboard.wishlists.reduce(
      (total, wishlist) => total + wishlist.itemCount,
      0,
    ),
    customers: dashboard.summary.customers,
    admins: dashboard.summary.admins,
  };

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

      <section className="grid grid-cols-2 border-b border-[#D7DCD5] sm:grid-cols-3 lg:grid-cols-5">
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
              <span
                className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                  activeTab === tab
                    ? "bg-[#E5F3EA] text-[#0D542B]"
                    : "bg-[#EEF0EC] text-[#68706A]"
                }`}
              >
                {tabCounts[tab]}
              </span>
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

      {(activeTab === "orders" ||
        activeTab === "carts" ||
        activeTab === "customers") && (
        <div className="mt-3 flex flex-wrap items-end gap-3 border-b border-[#E1E5DF] pb-3">
          {activeTab === "orders" && (
            <>
              <FilterSelect
                label="Status"
                value={columnFilters.orderStatus}
                options={[...ORDER_STATUSES]}
                onChange={(value) => setColumnFilter("orderStatus", value)}
              />
              <FilterSelect
                label="Webhook"
                value={columnFilters.webhookStatus}
                options={["pending", "delivered", "failed"]}
                onChange={(value) => setColumnFilter("webhookStatus", value)}
              />
            </>
          )}
          {activeTab === "carts" && (
            <>
              <FilterSelect
                label="Identity"
                value={columnFilters.cartIdentity}
                options={["admin", "customer", "guest"]}
                onChange={(value) => setColumnFilter("cartIdentity", value)}
              />
              <FilterSelect
                label="Stage"
                value={columnFilters.cartStage}
                options={[
                  "cart",
                  "address",
                  "shipping_quoted",
                  "placing_order",
                ]}
                onChange={(value) => setColumnFilter("cartStage", value)}
              />
              <FilterSelect
                label="Status"
                value={columnFilters.cartStatus}
                options={["active", "abandoned", "converted", "cleared"]}
                onChange={(value) => setColumnFilter("cartStatus", value)}
              />
            </>
          )}
          {activeTab === "customers" && (
            <>
              <label className="flex min-w-52 flex-col gap-1 text-xs font-semibold text-[#68706A]">
                Email
                <input
                  type="email"
                  value={columnFilters.customerEmail}
                  onChange={(event) =>
                    setColumnFilter("customerEmail", event.target.value)
                  }
                  placeholder="Filter by email"
                  className="h-9 rounded-md border border-[#C9D0C8] bg-white px-2 text-sm font-normal text-[#202522] outline-none focus:border-[#0D542B]"
                />
              </label>
              <label className="flex min-w-44 flex-col gap-1 text-xs font-semibold text-[#68706A]">
                Phone
                <input
                  type="tel"
                  value={columnFilters.customerPhone}
                  onChange={(event) =>
                    setColumnFilter("customerPhone", event.target.value)
                  }
                  placeholder="Filter by phone"
                  className="h-9 rounded-md border border-[#C9D0C8] bg-white px-2 text-sm font-normal text-[#202522] outline-none focus:border-[#0D542B]"
                />
              </label>
              <label className="flex min-w-52 flex-col gap-1 text-xs font-semibold text-[#68706A]">
                Location
                <input
                  value={columnFilters.location}
                  onChange={(event) =>
                    setColumnFilter("location", event.target.value)
                  }
                  placeholder="City or state"
                  className="h-9 rounded-md border border-[#C9D0C8] bg-white px-2 text-sm font-normal text-[#202522] outline-none focus:border-[#0D542B]"
                />
              </label>
              <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-[#C9D0C8] bg-white px-3 text-xs font-semibold text-[#202522]">
                <input
                  type="checkbox"
                  checked={columnFilters.hideWithoutContact}
                  onChange={(event) =>
                    setColumnFilter("hideWithoutContact", event.target.checked)
                  }
                  className="size-4 accent-[#187A45]"
                />
                Hide customers without email and phone
              </label>
            </>
          )}
          {Object.values(columnFilters).some(Boolean) && (
            <button
              type="button"
              onClick={() =>
                setColumnFilters({
                  orderStatus: "",
                  webhookStatus: "",
                  cartIdentity: "",
                  cartStage: "",
                  cartStatus: "",
                  location: "",
                  customerEmail: "",
                  customerPhone: "",
                  hideWithoutContact: true,
                })
              }
              className="min-h-9 px-2 text-xs font-semibold text-[#B42318] underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

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
                <th className="p-3">Last updated</th>
                <th className="p-3">Webhook</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#E1E5DF]">
                  <td className="p-3 font-mono text-xs">
                    {order.orderReference}
                  </td>
                  <td className="p-3">
                    {order.userId ? (
                      <button
                        type="button"
                        onClick={() => openCustomer(order.userId)}
                        className="font-medium text-[#0D542B] underline underline-offset-2"
                      >
                        {order.customerEmail || "Customer"}
                      </button>
                    ) : (
                      <p className="font-medium">Guest</p>
                    )}
                    <p className="text-xs text-[#68706A]">
                      {order.destinationPincode || "-"}
                    </p>
                  </td>
                  <td className="p-3">{order.itemCount}</td>
                  <td className="p-3 font-semibold">
                    {currency}
                    {formatMoney(order.totalAmount)}
                  </td>
                  <td className="p-3 text-xs">{formatDate(order.updatedAt)}</td>
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
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Identity</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Items ({tabCounts.carts})</th>
                <th className="p-3">Value</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCarts.map((cart) => (
                <tr
                  key={cart.id}
                  className="border-t border-[#E1E5DF] align-top"
                >
                  <td className="p-3 text-xs font-bold uppercase text-[#0D542B]">
                    {cart.identityType}
                  </td>
                  <td className="p-3">
                    {cart.identityType !== "guest" && cart.userId ? (
                      <button
                        type="button"
                        onClick={() => openCustomer(cart.userId)}
                        className="block text-left text-xs text-[#0D542B] underline underline-offset-2"
                      >
                        {cart.customerEmail || "-"}
                      </button>
                    ) : (
                      <span className="block text-xs text-[#68706A]">-</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-[#68706A]">
                    {cart.customerPhone || "-"}
                  </td>
                  <td className="max-w-md p-3">
                    {cart.items.length ? (
                      <CollapsibleItemList
                        listId={`cart-items-${cart.id}`}
                        items={cart.items}
                      />
                    ) : (
                      "Empty"
                    )}
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
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Identity</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Saved items ({tabCounts.wishlists})</th>
                <th className="p-3">Count</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWishlists.map((wishlist) => (
                <tr
                  key={wishlist.userId}
                  className="border-t border-[#E1E5DF] align-top"
                >
                  <td className="p-3 text-xs font-bold uppercase text-[#0D542B]">
                    {wishlist.identityType}
                  </td>
                  <td className="p-3">
                    {wishlist.identityType === "guest" ? (
                      <span className="block text-xs text-[#68706A]">-</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openCustomer(wishlist.userId)}
                        className="block text-left text-xs text-[#0D542B] underline underline-offset-2"
                      >
                        {wishlist.customerEmail || "-"}
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-xs text-[#68706A]">
                    {wishlist.customerPhone || "-"}
                  </td>
                  <td className="max-w-2xl p-3">
                    <CollapsibleItemList
                      listId={`wishlist-items-${wishlist.userId}`}
                      items={wishlist.items.map((item) => ({
                        itemId: item.itemId,
                        name: item.itemName,
                      }))}
                    />
                  </td>
                  <td className="p-3">{wishlist.itemCount}</td>
                  <td className="p-3 text-xs">
                    {formatDate(wishlist.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "customers" && (
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3">Wishlist</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-[#E1E5DF]">
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => openCustomer(customer.id)}
                      className="text-left"
                    >
                      <span className="block font-medium text-[#0D542B] underline underline-offset-2">
                        {customer.name ||
                          (customer.role === "guest" ? "Guest" : "Customer")}
                      </span>
                    </button>
                  </td>
                  <td className="p-3 text-xs">{customer.email || "-"}</td>
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
                    {formatDate(customer.lastUpdatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "admins" && (
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#F5F7F3] text-xs uppercase text-[#68706A]">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3">Carts</th>
                <th className="p-3">Wishlist</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Last sign-in</th>
                <th className="p-3">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.map((admin) => (
                <tr key={admin.id} className="border-t border-[#E1E5DF]">
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => openCustomer(admin.id)}
                      className="text-left text-xs text-[#0D542B] underline underline-offset-2"
                    >
                      {admin.email || "-"}
                    </button>
                  </td>
                  <td className="p-3">{admin.phone || "-"}</td>
                  <td className="p-3">
                    {[admin.city, admin.state].filter(Boolean).join(", ") ||
                      "-"}
                  </td>
                  <td className="p-3">{admin.cartCount}</td>
                  <td className="p-3">{admin.wishlistCount}</td>
                  <td className="p-3 text-xs">{formatDate(admin.createdAt)}</td>
                  <td className="p-3 text-xs">
                    {formatDate(admin.lastSignInAt)}
                  </td>
                  <td className="p-3 text-xs">
                    {formatDate(admin.lastUpdatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={visiblePage}
          totalRows={activeRowCount}
          onPageChange={setCurrentPage}
        />
      </section>

      <p className="mt-3 text-right text-xs text-[#8A918B]">
        Updated {formatDate(dashboard.generatedAt)} · refreshes every 15 seconds
      </p>

      {selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          onClose={() => setSelectedCustomerId("")}
        />
      )}
    </main>
  );
};

const CustomerDetails = ({
  customer,
  onClose,
}: {
  customer: AdminCustomer;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-details-title"
      className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white shadow-xl"
    >
      <header className="flex items-start justify-between border-b border-[#D7DCD5] p-5">
        <div>
          <p className="text-xs font-bold uppercase text-[#0D542B]">
            {customer.role}
          </p>
          <h2
            id="customer-details-title"
            className="font-display text-2xl font-bold text-[#202522]"
          >
            {customer.name ||
              (customer.role === "guest"
                ? "Guest details"
                : "Customer details")}
          </h2>
          <p className="text-sm text-[#68706A]">
            {customer.email || "No email"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-md text-[#68706A] hover:bg-[#EEF0EC]"
          aria-label="Close customer details"
          title="Close customer details"
        >
          <X size={19} />
        </button>
      </header>

      <div className="grid grid-cols-3 border-b border-[#D7DCD5]">
        {[
          ["Orders", customer.orderCount],
          ["Cart records", customer.cartCount],
          ["Wishlist", customer.wishlistCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border-r border-[#D7DCD5] p-4 last:border-r-0"
          >
            <p className="text-xs font-bold uppercase text-[#68706A]">
              {label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[#202522]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-[#202522]">Account</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-[#68706A]">Phone</dt>
              <dd>{customer.phone || "-"}</dd>
            </div>
            <div>
              <dt className="text-[#68706A]">Role</dt>
              <dd className="capitalize">{customer.role}</dd>
            </div>
            <div>
              <dt className="text-[#68706A]">Joined</dt>
              <dd>{formatDate(customer.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[#68706A]">Last sign-in</dt>
              <dd>{formatDate(customer.lastSignInAt)}</dd>
            </div>
            <div>
              <dt className="text-[#68706A]">Last updated</dt>
              <dd>{formatDate(customer.lastUpdatedAt)}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#202522]">Addresses</h3>
          <div className="mt-3 space-y-3">
            {customer.addresses.length ? (
              customer.addresses.map((address, index) => (
                <address
                  key={`${address.address1}-${index}`}
                  className="not-italic text-sm leading-6 text-[#404741]"
                >
                  <p className="font-semibold text-[#202522]">
                    {address.name || "Address"}
                    {address.isDefault ? " · Default" : ""}
                  </p>
                  <p>
                    {[address.address1, address.address2, address.landmark]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>
                    {[address.city, address.state, address.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>{address.mobile}</p>
                </address>
              ))
            ) : (
              <p className="text-sm text-[#68706A]">No saved addresses.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default AdminCommerce;
