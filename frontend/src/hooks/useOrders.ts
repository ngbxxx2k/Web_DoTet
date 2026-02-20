import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface OrderItem {
  id: number;
  productVariantId: number;
  productId: number;
  productName: string;
  variantName: string | null;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerId: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAvatar: string | null;
  shippingAddress: string;
  shippingFee: number;
  totalAmount: number;
  finalAmount: number;
  status: number;
  statusText: string;
  paymentStatus: number;
  paymentStatusText: string;
  paymentMethod: number;
  paymentMethodText: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  itemCount: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  todayRevenue: number;
}

export interface OrderItemInput {
  productVariantId: number;
  quantity: number;
}

export interface OrderInput {
  id?: number;
  customerId?: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingFee?: number;
  status?: number;
  paymentStatus?: number;
  paymentMethod: number;
  note?: string;
  items: OrderItemInput[];
}

interface UseOrdersOptions {
  search?: string;
  status?: number | null;
  paymentStatus?: number | null;
  paymentMethod?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  size?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const useOrders = (options: UseOrdersOptions = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, completed: 0, cancelled: 0, totalRevenue: 0, todayRevenue: 0 });

  const { 
    search = "", 
    status = null, 
    paymentStatus = null, 
    paymentMethod = null,
    startDate = null,
    endDate = null,
    page = 0, 
    size = 10 
  } = options;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status !== null) params.append("status", String(status));
      if (paymentStatus !== null) params.append("paymentStatus", String(paymentStatus));
      if (paymentMethod !== null) params.append("paymentMethod", String(paymentMethod));
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", String(page));
      params.append("size", String(size));

      const res = await fetch(`${API_URL}/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        console.warn("API returned non-ok status:", res.status);
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, paymentStatus, page, size]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateStatus = async (id: number, newStatus: number) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status?status=${newStatus}`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success("Cập nhật trạng thái đơn hàng thành công");
        fetchOrders();
        fetchStats();
      } else {
        toast.error("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const updatePaymentStatus = async (id: number, newStatus: number) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/payment-status?paymentStatus=${newStatus}`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success("Cập nhật trạng thái thanh toán thành công");
        fetchOrders();
      } else {
        toast.error("Cập nhật trạng thái thanh toán thất bại");
      }
    } catch (error) {
      toast.error("Cập nhật trạng thái thanh toán thất bại");
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Xóa đơn hàng thành công");
        fetchOrders();
        fetchStats();
      } else {
        toast.error("Xóa đơn hàng thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa đơn hàng");
    }
  };

  return {
    orders,
    loading,
    totalPages,
    totalElements,
    stats,
    refresh: fetchOrders,
    refreshStats: fetchStats,
    updateStatus,
    updatePaymentStatus,
    deleteOrder,
  };
};

export const useOrderById = (id: number | null | undefined) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    // Only fetch if we have a valid numeric ID
    if (id === null || id === undefined || isNaN(Number(id))) {
      setLoading(false);
      setOrder(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        // Only show error if we're actually trying to fetch a real ID
        if (id) {
          console.error(`Status ${res.status}: Order with ID ${id} not found on server or error occurred`);
        }
      }
    } catch (error) {
      console.error("Failed to load order detail from server:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, refresh: fetchOrder };
};

export const saveOrder = async (data: OrderInput): Promise<Order> => {
  const url = data.id ? `${API_URL}/orders/${data.id}` : `${API_URL}/orders`;
  const method = data.id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to save order");
  }

  return res.json();
};

// Status mapping utilities
export const ORDER_STATUSES = [
  { value: 0, label: "Chờ xác nhận", color: "yellow" },
  { value: 1, label: "Đã xác nhận", color: "blue" },
  { value: 2, label: "Đang giao", color: "purple" },
  { value: 3, label: "Hoàn thành", color: "green" },
  { value: 4, label: "Đã hủy", color: "red" },
  { value: 5, label: "Trả hàng", color: "gray" },
];

export const PAYMENT_STATUSES = [
  { value: 0, label: "Chưa thanh toán", color: "red" },
  { value: 1, label: "Đã thanh toán", color: "green" },
  { value: 2, label: "Hoàn tiền", color: "gray" },
];

export const PAYMENT_METHODS = [
  { value: 0, label: "Tiền mặt (COD)" },
  { value: 1, label: "Chuyển khoản" },
];
