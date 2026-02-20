"use client";

import { useEffect, useState } from "react";
import { Order, OrderItem, useOrderById, ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS } from "@/hooks/useOrders";
import toast from "react-hot-toast";
import { formatVND, formatDateVN } from "@/utils/format";

interface OrderDetailProps {
  orderId: number | null;
  onEdit: (order: Order) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: number) => void;
  onUpdatePaymentStatus: (id: number, paymentStatus: number) => void;
}

export default function OrderDetail({
  orderId,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdatePaymentStatus,
}: OrderDetailProps) {
  const { order, loading, refresh } = useOrderById(orderId);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  useEffect(() => {
    if (orderId) {
      refresh();
    }
  }, [orderId, refresh]);

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  const formatDate = (dateStr: string) => {
    return formatDateVN(dateStr);
  };

  const getStatusStyle = (statusValue: number) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === statusValue);
    const color = statusObj?.color || "gray";
    const styles: Record<string, string> = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[color] || styles.gray;
  };

  const getPaymentStyle = (statusValue: number) => {
    const statusObj = PAYMENT_STATUSES.find((s) => s.value === statusValue);
    const color = statusObj?.color || "gray";
    const styles: Record<string, string> = {
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      gray: "bg-gray-100 text-gray-800",
    };
    return styles[color] || styles.gray;
  };

  const handleDeleteConfirm = () => {
    if (order && confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      onDelete(order.id);
    }
  };

  if (!orderId) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center text-slate-400">
          <span className="material-symbols-outlined text-6xl mb-4">receipt_long</span>
          <p className="text-lg">Chọn một đơn hàng để xem chi tiết</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900/50">
        <p className="text-slate-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col flex-1 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              #{order.orderCode}
            </h2>
            <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(order)}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Sửa Đơn Hàng"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Xóa Đơn Hàng"
            >
              <span className="material-symbols-outlined text-red-500">delete</span>
            </button>
          </div>
        </div>

        {/* Status & Payment Row */}
        <div className="flex flex-wrap gap-4">
          {/* Order Status */}
          <div className="relative">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
              Trạng Thái
            </label>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${getStatusStyle(order.status)}`}
            >
              {order.statusText}
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[140px]">
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      onUpdateStatus(order.id, s.value);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                      s.value === order.status ? "font-semibold text-primary" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="relative">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
              Thanh Toán
            </label>
            <button
              onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${getPaymentStyle(order.paymentStatus)}`}
            >
              {order.paymentStatusText}
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {showPaymentDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[120px]">
                {PAYMENT_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      onUpdatePaymentStatus(order.id, s.value);
                      setShowPaymentDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                      s.value === order.paymentStatus ? "font-semibold text-primary" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
              Phương Thức
            </label>
            <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
              {order.paymentMethodText}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Thông Tin Khách Hàng
        </h3>
        <div className="flex items-start gap-4">
          {order.customerAvatar ? (
            <img
              src={order.customerAvatar}
              alt={order.customerName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400">person</span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">{order.customerName}</p>
            <p className="text-sm text-slate-500">{order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-sm text-slate-500">{order.customerEmail}</p>
            )}
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Địa Chỉ Giao Hàng</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{order.shippingAddress}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6 bg-white dark:bg-slate-900 flex-1">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Sản Phẩm ({order.items?.length || 0})
        </h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
            >
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                  {item.productName}
                </p>
                {item.variantName && (
                  <p className="text-xs text-slate-500 truncate">{item.variantName}</p>
                )}
                <p className="text-sm text-slate-500">
                  {formatCurrency(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(item.totalPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tạm Tính</span>
            <span className="text-slate-700 dark:text-slate-300">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Phí Vận Chuyển</span>
            <span className="text-slate-700 dark:text-slate-300">{formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-900 dark:text-white">Tổng Cộng</span>
            <span className="text-primary">{formatCurrency(order.finalAmount)}</span>
          </div>
        </div>

        {/* Note */}
        {order.note && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400 uppercase mb-1">Ghi Chú</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{order.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}