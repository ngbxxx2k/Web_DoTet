
import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface AnalyticsStats {
  totalRevenue: number;
  newOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface TopProduct {
  productName: string;
  quantitySold: number;
  totalRevenue: number;
  productImage: string;
}

export interface OrderStatusDist {
  status: string;
  count: number;
  color: string;
}

export interface OrderRGB {
    orderId: number;
    orderCode: string;
    customerName: string;
    totalAmount: number;
    status: number;
    paymentStatus: number;
    createdAt: string;
}

export const useAnalytics = (startDate: string, endDate: string) => {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    newOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [revenueChart, setRevenueChart] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/summary?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics summary", error);
    }
  }, [startDate, endDate]);

  const fetchRevenueChart = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/revenue-chart?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setRevenueChart(data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue chart", error);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSummary(), fetchRevenueChart()]).finally(() => setLoading(false));
  }, [startDate, endDate, fetchSummary, fetchRevenueChart]);

  return { stats, revenueChart, loading };
};

export const useTopProducts = (startDate: string, endDate: string, page: number = 0, size: number = 5) => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/analytics/top-products?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.content);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch top products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, [startDate, endDate, page, size]);

  return { products, totalPages, loading };
};

export const useRecentOrders = (page: number = 0, size: number = 5) => {
    const [orders, setOrders] = useState<OrderRGB[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/orders?page=${page}&size=${size}&sortBy=createdAt&sortDir=desc`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.content);
                    setTotalPages(data.totalPages);
                }
            } catch (error) {
                console.error("Failed to fetch recent orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page, size]);

    return { orders, totalPages, loading };
};

export const useOrderStatusDist = () => {
  const [dist, setDist] = useState<OrderStatusDist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/analytics/order-status`);
        if (res.ok) {
          const data = await res.json();
          setDist(data);
        }
      } catch (error) {
        console.error("Failed to fetch order status dist", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDist();
  }, []);

  return { dist, loading };
};
