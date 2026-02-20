"use client";

import { useState } from "react";
import Link from "next/link";
import AnalyticsStats from "@/components/admin/analytics/AnalyticsStats";
import RevenueChart from "@/components/admin/analytics/RevenueChart";
import TopProducts from "@/components/admin/analytics/TopProducts";
import OrderStatusDist from "@/components/admin/analytics/OrderStatusDist";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00'
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0] + 'T23:59:59'
  );

  const { stats, revenueChart, loading } = useAnalytics(startDate, endDate);

  const handleRangeChange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0] + 'T00:00:00');
    setEndDate(end.toISOString().split('T')[0] + 'T23:59:59');
  };

  return (
    <div className="space-y-8">
       {/* Breadcrumbs */}
       <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Tổng quan
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Thống Kê</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                 Báo Cáo Kinh Doanh
             </h1>
             <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                 Hiệu suất bán hàng và thông tin chi tiết theo thời gian thực
             </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-1 px-2">
                  <input 
                    type="date" 
                    value={startDate.split('T')[0]} 
                    onChange={(e) => setStartDate(e.target.value + 'T00:00:00')}
                    className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer p-1"
                  />
                  <span className="text-slate-300 dark:text-slate-600 text-[10px] font-bold">ĐẾN</span>
                  <input 
                    type="date" 
                    value={endDate.split('T')[0]} 
                    onChange={(e) => setEndDate(e.target.value + 'T23:59:59')}
                    className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer p-1"
                  />
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <div className="flex gap-1">
                  <button 
                    onClick={() => handleRangeChange(7)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                        startDate.startsWith(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'
                    }`}
                  >7D</button>
                  <button 
                    onClick={() => handleRangeChange(30)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                        startDate.startsWith(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'
                    }`}
                  >30D</button>
              </div>
          </div>
      </div>

      {/* Stats Section */}
      <AnalyticsStats stats={stats} loading={loading} />

      {/* Main Chart Section */}
      <RevenueChart data={revenueChart} loading={loading} />

      {/* Split Section: Top Products & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <TopProducts startDate={startDate} endDate={endDate} />
        </div>
        <div className="h-full">
            <OrderStatusDist />
        </div>
      </div>
    </div>
  );
}
