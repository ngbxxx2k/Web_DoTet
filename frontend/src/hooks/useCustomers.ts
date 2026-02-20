import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  isActive: boolean;
  adminNotes: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  addressDetail: string | null;
  roleId: number;
  roleCode: string;
  roleName: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  blocked: number;
}

export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
}

interface UseCustomersOptions {
  search?: string;
  roleId?: number | null;
  isActive?: boolean | null;
  page?: number;
  size?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const useCustomers = (options: UseCustomersOptions = {}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState<CustomerStats>({ total: 0, active: 0, blocked: 0 });
  const [roles, setRoles] = useState<Role[]>([]);

  const { search = "", roleId = null, isActive = null, page = 0, size = 3 } = options;

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleId !== null) params.append("roleId", String(roleId));
      if (isActive !== null) params.append("isActive", String(isActive));
      params.append("page", String(page));
      params.append("size", String(size));

      const res = await fetch(`${API_URL}/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        // Only log to console, don't show toast for empty list scenario
        console.warn("API returned non-ok status:", res.status);
        setCustomers([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
      // Network error - still don't show toast, just set empty state
      setCustomers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [search, roleId, isActive, page, size]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/users/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/users/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchStats();
    fetchRoles();
  }, [fetchStats, fetchRoles]);

  const toggleStatus = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/toggle-status`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success("Cập nhật trạng thái thành công");
        fetchCustomers();
        fetchStats();
      } else {
        toast.error("Lỗi khi cập nhật trạng thái");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Xóa khách hàng thành công");
        fetchCustomers();
        fetchStats();
      } else {
        toast.error("Lỗi khi xóa khách hàng");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa khách hàng");
    }
  };

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleId !== null) params.append("roleId", String(roleId));
      if (isActive !== null) params.append("isActive", String(isActive));

      const res = await fetch(`${API_URL}/users/export-csv?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "customers.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Xuất CSV thành công");
      } else {
        toast.error("Lỗi khi xuất CSV");
      }
    } catch (error) {
      toast.error("Lỗi khi xuất CSV");
    }
  };

  return {
    customers,
    loading,
    totalPages,
    totalElements,
    stats,
    roles,
    refresh: fetchCustomers,
    refreshStats: fetchStats,
    toggleStatus,
    deleteCustomer,
    exportCsv,
  };
};

export const useCustomerById = (id: number | null) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === null) {
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCustomer(data);
        } else {
          toast.error("Không tìm thấy khách hàng");
        }
      } catch (error) {
        toast.error("Lỗi khi tải thông tin khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  return { customer, loading };
};

export const saveCustomer = async (data: any): Promise<Customer> => {
  const url = data.id ? `${API_URL}/users/${data.id}` : `${API_URL}/users`;
  const method = data.id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Lỗi khi lưu khách hàng");
  }

  return res.json();
};

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${API_URL}/users/roles`);
        if (res.ok) {
          setRoles(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return { roles, loading };
};
