"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { formatVND, formatNumberVN } from "@/utils/format";
import { useState } from "react";

export default function DashboardStats() {
  // Use a wide date range for "All Time" stats for now, or default to current month
  // For total counts (customers, products), the backend ignores dates.
  // For revenue/orders, this will show stats for the specified range.
  const startDate = "2023-01-01T00:00:00"; 
  const [endDate] = useState(new Date().toISOString());

  const { stats, loading } = useAnalytics(startDate, endDate);

  if (loading && !stats) {
     return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        ))}
     </div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Tổng Doanh Thu
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">
            {formatVND(stats?.totalRevenue)}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
            <span className="material-symbols-outlined">shopping_basket</span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Tổng Đơn Hàng
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">
            {formatNumberVN(stats?.newOrders)}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Tổng Sản Phẩm
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">
            {formatNumberVN(stats?.totalProducts)}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-600">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Tổng Khách Hàng
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">
            {formatNumberVN(stats?.totalCustomers)}
          </p>
        </div>
      </div>
    </div>
  );
}
