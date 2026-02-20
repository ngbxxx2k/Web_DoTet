import { useOrders } from "@/hooks/useOrders";
import { formatVND } from "@/utils/format";

export default function PaymentStats() {
  const { stats, loading } = useOrders();

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Revenue */}
      <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
            Tổng Doanh Thu
          </p>
          <span className="material-symbols-outlined text-primary text-[20px]">
            monetization_on
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : formatCurrency(stats.totalRevenue || 0)}
          </p>
        </div>
      </div>
      {/* Pending */}
      <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
            Đơn Hàng Chờ Xử Lý
          </p>
          <span className="material-symbols-outlined text-orange-600 text-[20px]">
            pending_actions
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : stats.pending}
          </p>
          <span className="text-orange-600 text-xs font-medium">
            Cần Xử Lý
          </span>
        </div>
      </div>
      {/* Today */}
      <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
            Doanh Thu Hôm Nay
          </p>
          <span className="material-symbols-outlined text-blue-600 text-[20px]">
            bar_chart
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : formatCurrency(stats.todayRevenue || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
