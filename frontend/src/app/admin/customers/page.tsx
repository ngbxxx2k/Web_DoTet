"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import CustomerStats from "@/components/admin/customers/CustomerStats";
import CustomerToolbar from "@/components/admin/customers/CustomerToolbar";
import CustomerTable from "@/components/admin/customers/CustomerTable";
import CustomerForm from "@/components/admin/customers/CustomerForm";
import { useCustomers, Customer } from "@/hooks/useCustomers";

export default function CustomersPage() {
  // Filter State
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [page, setPage] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    // Simple debounce
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const {
    customers,
    loading,
    totalPages,
    stats,
    roles,
    toggleStatus,
    exportCsv,
    refresh,
    refreshStats,
  } = useCustomers({
    search: debouncedSearch,
    roleId,
    isActive,
    page,
  });

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode("view");
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode("edit");
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setModalMode("add");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedCustomer(null);
    refresh();
    refreshStats();
  };

  const handleRoleChange = (value: number | null) => {
    setRoleId(value);
    setPage(0);
  };

  const handleStatusChange = (value: boolean | null) => {
    setIsActive(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Khách Hàng</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Khách Hàng
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/30"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <CustomerStats stats={stats} loading={loading} />

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <CustomerToolbar
          search={search}
          onSearchChange={handleSearchChange}
          roleId={roleId}
          onRoleChange={handleRoleChange}
          isActive={isActive}
          onStatusChange={handleStatusChange}
          roles={roles}
        />
        <CustomerTable
          customers={customers}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* Modal for Add/Edit/View */}
      {modalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/50 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-slate-50 dark:bg-slate-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              {/* Header */}
              <div className="bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {modalMode === "add"
                    ? "Thêm Khách Hàng Mới"
                    : modalMode === "edit"
                    ? "Sửa Khách Hàng"
                    : "Chi Tiết Khách Hàng"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                    close
                  </span>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <CustomerForm
                  initialData={selectedCustomer}
                  mode={modalMode}
                  onClose={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
