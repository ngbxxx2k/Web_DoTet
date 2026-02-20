import { AnalyticsStats as StatsType } from "@/hooks/useAnalytics";
import { formatVND } from "@/utils/format";

interface AnalyticsStatsProps {
  stats: StatsType | null;
  loading: boolean;
}

export default function AnalyticsStats({ stats, loading }: AnalyticsStatsProps) {
  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  const skeleton = (
    <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-primary">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>trending_up</span>
            Trực Tiếp
          </span>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tổng Doanh Thu</p>
          {loading ? skeleton : (
            <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mt-1">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h3>
          )}
        </div>
      </div>

      {/* New Orders */}
      <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Đơn Hàng Mới</p>
          {loading ? skeleton : (
            <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mt-1">
              {stats?.newOrders || 0}
            </h3>
          )}
        </div>
      </div>

      {/* Avg Order Value */}
      <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Giá Trị ĐH Trung Bình</p>
          {loading ? skeleton : (
            <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mt-1">
              {formatCurrency(stats?.avgOrderValue || 0)}
            </h3>
          )}
        </div>
      </div>

      {/* Total Customers */}
      <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tổng Khách Hàng</p>
          {loading ? skeleton : (
            <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mt-1">
              {stats?.totalCustomers || 0}
            </h3>
          )}
        </div>
      </div>
    </div>
  );
}
