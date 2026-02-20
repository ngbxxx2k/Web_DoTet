"use client";

import { useState, useEffect } from "react";
import OrderList from "@/components/admin/orders/OrderList";
import OrderForm from "@/components/admin/orders/OrderForm";
import { Order, useOrders } from "@/hooks/useOrders";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add");
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { orders, loading, totalPages, totalElements, stats, deleteOrder, refresh, refreshStats } = useOrders({
    search: debouncedSearch,
    status,
    page,
    size: 10,
  });

  const handleCreateOrder = () => {
    setFormMode("add");
    setTargetOrder(null);
    setShowForm(true);
  };

  const handleEditOrder = (order: Order) => {
    setFormMode("edit");
    setTargetOrder(order);
    setShowForm(true);
  };

  const handleViewOrder = (order: Order) => {
    setFormMode("view");
    setTargetOrder(order);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setTargetOrder(null);
    refresh();
    refreshStats();
  };

  const handleDeleteOrder = (id: number) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteOrder(deleteId);
      refresh();
      refreshStats();
    }
    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col h-screen -m-4 md:-m-8">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        <OrderList
          orders={orders}
          loading={loading}
          totalPages={totalPages}
          totalElements={totalElements}
          stats={stats}
          page={page}
          setPage={setPage}
          onCreateOrder={handleCreateOrder}
          onEditOrder={handleEditOrder}
          onViewOrder={handleViewOrder}
          onDeleteOrder={handleDeleteOrder}
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
      </main>

      {/* Unified Order Form Modal (Add, Edit, View) */}
      {showForm && (
        <OrderForm
          initialData={targetOrder}
          mode={formMode}
          onClose={handleCloseForm}
        />
      )}

      <ConfirmModal
        isOpen={isDeleting}
        title="Xóa Đơn Hàng"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleting(false)}
        confirmText="Xóa Ngay"
        cancelText="Giữ Lại"
        type="danger"
      />
    </div>
  );
}