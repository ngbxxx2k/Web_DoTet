"use client";

import { useRecentOrders } from "@/hooks/useAnalytics";
import { formatVND, formatDateVN } from "@/utils/format";
import { useState } from "react";

export default function RecentOrdersTable() {
    // Widget Data (Top 5)
    const { orders, loading } = useRecentOrders(0, 5);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPage, setModalPage] = useState(0);
    const modalSize = 10;
    
    // Modal Data
    const { 
        orders: modalOrders, 
        totalPages, 
        loading: modalLoading 
    } = useRecentOrders(modalPage, modalSize);

    const getStatusBadge = (status: number) => {
        const statuses = ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Hoàn thành", "Đã hủy", "Trả hàng"];
        const colors = [
          "bg-yellow-50 text-yellow-600 border-yellow-100",
          "bg-blue-50 text-blue-600 border-blue-100",
          "bg-purple-50 text-purple-600 border-purple-100",
          "bg-green-50 text-green-600 border-green-100",
          "bg-red-50 text-red-600 border-red-100",
          "bg-slate-50 text-slate-600 border-slate-100",
        ];
    
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors[status] || colors[0]}`}
          >
            {statuses[status] || "Không xác định"}
          </span>
        );
      };

    return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Đơn Hàng Gần Đây
          </h3>
          <button 
           onClick={() => setIsModalOpen(true)}
           className="text-primary text-sm font-medium hover:underline"
          >
            Xem Tất Cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Ngày Đặt</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
                {orders.map((order, index) => (
                        <tr
                        key={`${order.orderId}-${index}`}
                        className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                                #{order.orderCode}
                            </td>
                            <td className="py-3 px-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {order.customerName.charAt(0)}
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                {order.customerName}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-500">
                                {formatDateVN(order.createdAt)}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                                {formatVND(order.totalAmount)}
                            </td>
                            <td className="py-3 px-4">
                                {getStatusBadge(order.status)}
                            </td>
                        </tr>
                    ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <div className="text-center text-slate-500 py-6 text-sm">Không tìm thấy đơn hàng nào.</div>
          )}
        </div>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Toàn Bộ Đơn Hàng</h2>
                <p className="text-sm text-slate-500 mt-1">Xem và quản lý các giao dịch gần nhất</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                            <th className="py-4 px-6">Mã Đơn</th>
                            <th className="py-4 px-6">Khách Hàng</th>
                            <th className="py-4 px-6">Ngày Đặt</th>
                            <th className="py-4 px-6 text-right">Tổng Tiền</th>
                            <th className="py-4 px-6 text-center">Thanh Toán</th>
                            <th className="py-4 px-6 text-center">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800 transition-opacity duration-200 ${modalLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {modalOrders.map((order, index) => (
                            <tr key={`${order.orderId}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="py-4 px-6 font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">#{order.orderCode}</td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {order.customerName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{order.customerName}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-500">{formatDateVN(order.createdAt)}</td>
                                <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">{formatVND(order.totalAmount)}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {order.paymentStatus === 1 ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">{getStatusBadge(order.status)}</td>
                            </tr>
                        ))}
                        {modalOrders.length === 0 && modalLoading && (
                            <tr><td colSpan={6} className="text-center py-12 text-slate-500">Đang tải dữ liệu...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <button 
                    disabled={modalPage === 0}
                    onClick={() => setModalPage(p => p - 1)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Trước
                </button>
                <div className="text-sm font-medium text-slate-600">
                    Trang <span className="text-slate-900">{modalPage + 1}</span> / <span className="text-slate-900">{totalPages}</span>
                </div>
                <button 
                    disabled={modalPage >= totalPages - 1}
                    onClick={() => setModalPage(p => p + 1)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Sau <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
