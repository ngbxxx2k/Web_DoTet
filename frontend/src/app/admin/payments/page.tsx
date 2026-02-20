"use client";

import { useState } from "react";
import PaymentFilter from "@/components/admin/payments/PaymentFilter";
import PaymentStats from "@/components/admin/payments/PaymentStats";
import TransactionDetail from "@/components/admin/payments/TransactionDetail";
import TransactionList from "@/components/admin/payments/TransactionList";

export default function PaymentsPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    paymentMethod: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh)] -m-4 md:-m-8">
      {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Giao Dịch Thanh Toán</h2>
        </header>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column */}
        <div className="w-full lg:w-[60%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-6">
              <PaymentStats />
              <PaymentFilter onFilterChange={handleFilterChange} />
              <TransactionList 
                key={refreshKey}
                selectedId={selectedOrderId} 
                onSelect={setSelectedOrderId} 
                filters={filters}
              />
            </div>
          </div>
        </div>

        {/* Right Column (Detail) */}
        <TransactionDetail 
          orderId={selectedOrderId} 
          onStatusUpdated={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </div>
  );
}
