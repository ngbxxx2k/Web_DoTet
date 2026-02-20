"use client";

import { useState, useEffect } from "react";

interface PaymentFilterProps {
  onFilterChange: (filters: {
    search?: string;
    paymentMethod?: number | null;
    startDate?: string | null;
    endDate?: string | null;
  }) => void;
}

export default function PaymentFilter({ onFilterChange }: PaymentFilterProps) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleMethodChange = (newMethod: number | null) => {
    setMethod(newMethod);
    onFilterChange({ paymentMethod: newMethod });
  };

  const handleDateChange = () => {
    onFilterChange({ 
      startDate: startDate ? `${startDate}T00:00:00` : null,
      endDate: endDate ? `${endDate}T23:59:59` : null
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Search */}
        <div className="relative w-full xl:w-64">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            style={{ fontSize: "18px" }}
          >
            search
          </span>
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all placeholder:text-slate-400"
            placeholder="Search by Code, Name..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Method Filter */}
        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button 
              onClick={() => handleMethodChange(null)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${method === null ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              All Methods
            </button>
            <button 
              onClick={() => handleMethodChange(1)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${method === 1 ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Banking
            </button>
            <button 
              onClick={() => handleMethodChange(0)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${method === 0 ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              COD
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</span>
           <input 
             type="date" 
             className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
             value={startDate}
             onChange={(e) => setStartDate(e.target.value)}
             onBlur={handleDateChange}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To</span>
           <input 
             type="date" 
             className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
             value={endDate}
             onChange={(e) => setEndDate(e.target.value)}
             onBlur={handleDateChange}
           />
        </div>
        <button 
          onClick={() => { setStartDate(""); setEndDate(""); onFilterChange({ startDate: null, endDate: null }); }}
          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider ml-auto"
        >
          Reset Dates
        </button>
      </div>
    </div>
  );
}
