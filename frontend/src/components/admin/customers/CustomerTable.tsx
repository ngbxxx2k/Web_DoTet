"use client";

import { useState } from "react";
import { Customer } from "@/hooks/useCustomers";
import { formatVND, formatDateVN } from "@/utils/format";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onToggleStatus: (id: number) => void;
}

export default function CustomerTable({
  customers,
  loading,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
}: CustomerTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const formatDate = (dateStr: string) => {
    return formatDateVN(dateStr);
  };

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getRoleBadgeClass = (roleCode: string) => {
    switch (roleCode?.toLowerCase()) {
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "editor":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-b-xl border-x border-b border-slate-200 dark:border-border-dark p-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-500 mt-4">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-b-xl border-x border-b border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-border-dark">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[50px]">
                <input
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                  type="checkbox"
                  checked={selectedIds.length === customers.length && customers.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[250px]">
                Khách Hàng
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                SĐT
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Đơn Hàng
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Chi Tiêu
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Vai Trò
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ngày Tham Gia
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-500">
                  Không tìm thấy khách hàng nào
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4">
                    <input
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      type="checkbox"
                      checked={selectedIds.includes(customer.id)}
                      onChange={() => toggleSelect(customer.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-none overflow-hidden">
                        {customer.avatarUrl ? (
                          <img
                            src={customer.avatarUrl}
                            alt={customer.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold text-sm">
                            {customer.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {customer.fullName}
                        </span>
                        <span className="text-xs text-slate-500">{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {customer.phoneNumber || "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {customer.orderCount}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                        customer.roleCode
                      )}`}
                    >
                      {customer.roleName}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          customer.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {customer.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{formatDate(customer.createdAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-slate-400 hover:text-primary transition-colors"
                        title="Xem chi tiết"
                        onClick={() => onView(customer)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          visibility
                        </span>
                      </button>
                      <button
                        className="text-slate-400 hover:text-primary transition-colors"
                        title="Sửa"
                        onClick={() => onEdit(customer)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          edit
                        </span>
                      </button>
                      <button
                        className={`transition-colors ${
                          customer.isActive
                            ? "text-slate-400 hover:text-red-500"
                            : "text-red-500 hover:text-green-500"
                        }`}
                        title={customer.isActive ? "Khóa" : "Mở khóa"}
                        onClick={() => onToggleStatus(customer.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          {customer.isActive ? "block" : "check_circle"}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-between">
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            arrow_back
          </span>
          <span>Trước</span>
        </button>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Trang {page + 1} / {totalPages || 1}
        </span>
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <span>Sau</span>
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
