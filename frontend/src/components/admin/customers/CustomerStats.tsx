"use client";

import { CustomerStats as Stats } from "@/hooks/useCustomers";
import { formatNumberVN } from "@/utils/format";

interface CustomerStatsProps {
  stats: Stats;
  loading?: boolean;
}

export default function CustomerStats({ stats, loading }: CustomerStatsProps) {
  const items = [
    {
      label: "Tổng Khách Hàng",
      value: stats.total,
      icon: "group",
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Hoạt Động",
      value: stats.active,
      icon: "check_circle",
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Đã Khóa",
      value: stats.blocked,
      icon: "block",
      color: "bg-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4 shadow-sm"
        >
          <div className={`p-3 rounded-xl ${item.bgColor}`}>
            <span className={`material-symbols-outlined text-${item.color.replace("bg-", "")}`} style={{ fontSize: "24px" }}>
              {item.icon}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumberVN(item.value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
