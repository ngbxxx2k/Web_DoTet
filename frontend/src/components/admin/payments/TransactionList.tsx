"use client";

import { useOrders, PAYMENT_STATUSES, PAYMENT_METHODS } from "@/hooks/useOrders";
import { formatVND, formatDateVN } from "@/utils/format";
import { useState } from "react";

interface TransactionListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  filters: {
    search: string;
    paymentMethod: number | null;
    startDate: string | null;
    endDate: string | null;
  };
}

export default function TransactionList({ selectedId, onSelect, filters }: TransactionListProps) {
  const [page, setPage] = useState(0);
  const { orders, totalPages, totalElements, loading } = useOrders({ page, size: 3, ...filters });

  const formatDate = (dateStr: string) => {
    return formatDateVN(dateStr);
  };

  const getPaymentStatusInfo = (status: number) => {
    return PAYMENT_STATUSES.find(s => s.value === status) || PAYMENT_STATUSES[0];
  };

  const getMethodIcon = (method: number) => {
    switch (method) {
      case 1: return "account_balance"; // Banking
      default: return "payments"; // COD
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              <th className="pl-4 pr-2 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Giao Dịch
              </th>
              <th className="px-2 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Khách Hàng
              </th>
              <th className="px-2 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Phương Thức
              </th>
              <th className="px-2 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                Số Tiền
              </th>
              <th className="pl-2 pr-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                Trạng Thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Đang tải giao dịch...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Không tìm thấy giao dịch nào
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusInfo = getPaymentStatusInfo(order.paymentStatus);
                const isSelected = selectedId === order.id;
                
                return (
                  <tr 
                    key={order.id}
                    onClick={() => onSelect(order.id)}
                    className={`group transition-colors cursor-pointer border-l-4 ${
                      isSelected 
                        ? "bg-primary/5 dark:bg-primary/10 border-primary" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <td className="pl-4 pr-2 py-3">
                      <div className="flex flex-col">
                        <span className={`text-sm ${isSelected ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-900 dark:text-white"}`}>
                          #{order.orderCode}
                        </span>
                        <span className="text-[11px] text-slate-500">{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-full bg-slate-200 bg-cover shrink-0"
                          style={{
                            backgroundImage: order.customerAvatar ? `url(${order.customerAvatar})` : 'none',
                            backgroundColor: order.customerAvatar ? 'transparent' : '#e2e8f0'
                          }}
                        >
                          {!order.customerAvatar && (
                            <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-slate-500">
                              {order.customerName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {order.customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <span
                          className="material-symbols-outlined text-slate-500"
                          style={{ fontSize: "14px" }}
                        >
                          {getMethodIcon(order.paymentMethod)}
                        </span>{" "}
                        {order.paymentMethodText}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">
                      {formatVND(order.finalAmount)}
                    </td>
                    <td className="pl-2 pr-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        statusInfo.color === "green" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        statusInfo.color === "red" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" :
                        statusInfo.color === "yellow" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {order.paymentStatusText}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="relative inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
            className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Hiển thị <span className="font-medium">{page * 10 + 1}</span> đến{" "}
              <span className="font-medium">{Math.min((page + 1) * 10, totalElements)}</span> trên tổng số{" "}
              <span className="font-medium">{totalElements}</span> kết quả
            </p>
          </div>
          <div>
            <nav
              aria-label="Pagination"
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            >
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-30"
              >
                <span className="sr-only">Previous</span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_left
                </span>
              </button>
              
              {[...Array(totalPages)].slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all ${
                    page === i 
                      ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" 
                      : "text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
               {totalPages > 5 && (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:outline-offset-0">
                  ...
                </span>
              )}

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-30"
              >
                <span className="sr-only">Next</span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
