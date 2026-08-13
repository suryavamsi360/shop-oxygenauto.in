import { authenticatedFetch } from "./authenticatedApi";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "failed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface AdminOrder {
  id: string;
  orderReference: string;
  userId: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  identityType: "customer" | "guest";
  status: OrderStatus;
  webhookStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  itemCount: number;
  destinationPincode: string | null;
  placedAt: string;
  statusUpdatedAt: string;
}

export interface AdminCart {
  id: string;
  identityType: "customer" | "guest";
  userId: string | null;
  customerEmail: string;
  status: string;
  checkoutStage: string;
  subtotalSnapshot: number | null;
  shippingSnapshot: number | null;
  lastActivityAt: string;
  abandonedAt: string | null;
  convertedAt: string | null;
  convertedOrderReference: string | null;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    priceSnapshot: number | null;
  }>;
}

export interface AdminWishlist {
  userId: string;
  customerEmail: string;
  updatedAt: string | null;
  items: Array<{ itemId: string; itemName: string; createdAt: string }>;
}

export interface AdminCustomer {
  id: string;
  email: string;
  phone: string;
  role: string;
  name: string;
  city: string;
  state: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  wishlistCount: number;
}

export interface AdminDashboardResponse {
  generatedAt: string;
  summary: {
    customers: number;
    activeCarts: number;
    abandonedCarts: number;
    liveOrders: number;
    activityLast24Hours: number;
  };
  orders: AdminOrder[];
  carts: AdminCart[];
  wishlists: AdminWishlist[];
  customers: AdminCustomer[];
}

const fetchAdminDashboard = async () => {
  const response = await authenticatedFetch("/admin/commerce/dashboard");
  return (await response.json()) as AdminDashboardResponse;
};

const updateAdminOrderStatus = async (
  orderReference: string,
  status: OrderStatus,
) => {
  const response = await authenticatedFetch(
    `/admin/commerce/orders/${encodeURIComponent(orderReference)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return (await response.json()) as { order: AdminOrder };
};

export { fetchAdminDashboard, updateAdminOrderStatus };