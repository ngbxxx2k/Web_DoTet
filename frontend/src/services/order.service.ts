const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export interface Order {
  id: number;
  orderId: string; // Display ID (e.g., UUID or short code)
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
}

function mapOrder(data: any): Order {
  return {
    id: data.id,
    orderId: data.orderCode || `#${data.id}`,
    createdAt: data.createdAt,
    status: mapOrderStatus(data.statusText || String(data.status)),
    total: data.finalAmount || data.totalAmount || 0,
    items: (data.items || []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.unitPrice,
      thumbnail: item.productImage
    })),
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethodText || String(data.paymentMethod)
  };
}

function mapOrderStatus(status: string): string {
  const s = status.toUpperCase();
  if (s === "PENDING" || s === "0") return "Pending";
  if (s === "PROCESSING" || s === "1") return "Processing";
  if (s === "SHIPPING" || s === "2") return "Shipping";
  if (s === "DELIVERED" || s === "COMPLETED" || s === "3") return "Completed";
  if (s === "CANCELLED" || s === "4") return "Cancelled";
  if (s === "RETURNED" || s === "5") return "Returned";
  return status;
}

export const OrderService = {
  async getMyOrders(token: string): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch orders failed:", errorText);
        throw new Error(errorText || "Failed to fetch orders");
    }
    const data = await res.json();
    // Map backend array to frontend interface
    return Array.isArray(data) ? data.map(mapOrder) : [];
  },

  async cancelOrder(orderId: number, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to cancel order");
    }
  },
};
