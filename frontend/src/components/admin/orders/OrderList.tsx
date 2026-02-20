"use client";

import { Order, ORDER_STATUSES, PAYMENT_STATUSES, OrderStats } from "@/hooks/useOrders";
import { formatVND, formatDateVN } from "@/utils/format";

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  totalPages: number;
  totalElements: number;
  stats: OrderStats;
  page: number;
  setPage: (page: number) => void;
  onCreateOrder: () => void;
  onEditOrder: (order: Order) => void;
  onViewOrder: (order: Order) => void;
  onDeleteOrder: (id: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  status: number | null;
  onStatusChange: (value: number | null) => void;
}

export default function OrderList({
  orders,
  loading,
  totalPages,
  totalElements,
  stats,
  page,
  setPage,
  onCreateOrder,
  onEditOrder,
  onViewOrder,
  onDeleteOrder,
  search,
  onSearchChange,
  status,
  onStatusChange,
}: OrderListProps) {

  const getStatusStyle = (statusValue: number) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === statusValue);
    const color = statusObj?.color || "gray";
    const styles: Record<string, string> = {
      yellow: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400",
      blue: "bg-primary/5 text-primary border-primary/20 dark:bg-primary/10",
      purple: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400",
      green: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400",
      red: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400",
      gray: "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400",
    };
    return styles[color] || styles.gray;
  };

  const getPaymentStatusStyle = (paymentStatus: number) => {
    const statusObj = PAYMENT_STATUSES.find((s) => s.value === paymentStatus);
    const color = statusObj?.color || "gray";
    const styles: Record<string, string> = {
      red: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400",
      green: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400",
      gray: "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400",
    };
    return styles[color] || styles.gray;
  };

  const getDotStyle = (statusValue: number) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === statusValue);
    const color = statusObj?.color || "gray";
    const styles: Record<string, string> = {
      yellow: "bg-amber-500 shadow-sm shadow-amber-500/50",
      blue: "bg-blue-500 shadow-sm shadow-blue-500/50",
      purple: "bg-purple-500 shadow-sm shadow-purple-500/50",
      green: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
      red: "bg-rose-500 shadow-sm shadow-rose-500/50",
      gray: "bg-slate-500 shadow-sm shadow-slate-500/50",
    };
    return styles[color] || styles.gray;
  };

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  const formatDate = (dateStr: string) => {
    return formatDateVN(dateStr);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 w-full h-full overflow-hidden">
      {/* List Header with modern dashboard look */}
      <div className="flex flex-col gap-6 p-8 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Quản Lý Đơn Hàng
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Quản lý đơn hàng và trạng thái giao hàng
            </p>
          </div>
          <button
            onClick={onCreateOrder}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined font-bold">add</span>
            Thêm Đơn
          </button>
        </div>

        {/* Stats Grid - Premium look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
               <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng Đơn</div>
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
               <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">Chờ Xử Lý</div>
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
               <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{stats.completed}</div>
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Hoàn Thành</div>
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
               <span className="material-symbols-outlined">cancel</span>
            </div>
            <div>
              <div className="text-2xl font-black text-rose-600">{stats.cancelled}</div>
              <div className="text-xs font-bold text-rose-500 uppercase tracking-widest">Đã Hủy</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>search</span>
            </div>
            <input
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
              placeholder="Tìm theo mã đơn, tên khách, sđt..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full lg:w-auto">
            <button
              onClick={() => onStatusChange(null)}
              className={`flex h-11 shrink-0 items-center justify-center px-6 rounded-2xl text-sm font-bold transition-all border ${
                status === null
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              Tất Cả
            </button>
            {ORDER_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => onStatusChange(s.value)}
                className={`flex h-11 shrink-0 items-center justify-center px-6 rounded-2xl text-sm font-bold transition-all border ${
                  status === s.value
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Table Design */}
      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <div className="min-w-[1000px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-slate-500 font-bold">Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-5xl">inbox</span>
              </div>
              <p className="font-bold text-lg text-slate-900 dark:text-white">Không tìm thấy đơn hàng</p>
              <p className="text-sm">Hãy thử bộ lọc hoặc từ khóa khác</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="pl-8 pr-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông Tin Đơn</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách Hàng</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng Tiền</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng Thái</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thanh Toán</th>
                  <th className="pl-4 pr-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200"
                  >
                    <td className="pl-8 pr-4 py-5">
                      <div className="text-sm font-black text-slate-900 dark:text-white mb-0.5">#{order.orderCode}</div>
                      <div className="text-[11px] font-bold text-slate-400 leading-none">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-black text-xs border border-slate-200 dark:border-slate-700">
                          {order.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">{order.customerName}</div>
                          <div className="text-xs font-bold text-slate-500">{order.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(order.finalAmount)}
                       <div className="text-[10px] font-bold text-slate-400">{order.itemCount} sản phẩm</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase border tracking-wider ${getStatusStyle(order.status)} animate-in fade-in duration-500`}>
                        <span className={`h-2 w-2 rounded-full ${getDotStyle(order.status)}`}></span>
                        {order.statusText}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase border tracking-widest ${getPaymentStatusStyle(order.paymentStatus)}`}>
                        {order.paymentStatusText}
                      </div>
                    </td>
                    <td className="pl-4 pr-8 py-5">
                      <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => onViewOrder(order)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-primary hover:text-white dark:bg-blue-900/20 transition-all active:scale-90"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[20px] font-bold">visibility</span>
                        </button>
                        <button
                          onClick={() => onEditOrder(order)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-900/20 transition-all active:scale-90"
                          title="Sửa đơn"
                        >
                          <span className="material-symbols-outlined text-[20px] font-bold">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition-all active:scale-90"
                          title="Xóa đơn"
                        >
                          <span className="material-symbols-outlined text-[20px] font-bold">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalPages > 0 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              arrow_back
            </span>
            <span>Trước</span>
          </button>
          
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Trang {page + 1} / {totalPages || 1}
          </span>

          <button
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            <span>Sau</span>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              arrow_forward
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
