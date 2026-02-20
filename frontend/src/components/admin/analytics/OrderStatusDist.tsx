import { useOrderStatusDist } from "@/hooks/useAnalytics";
import { formatNumberVN } from "@/utils/format";

export default function OrderStatusDist() {
  const { dist, loading } = useOrderStatusDist();
  const totalOrders = dist.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm h-full">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Trạng Thái Đơn Hàng
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Phân bổ tất cả đơn hàng
        </p>
      </div>
      <div className="flex flex-col justify-center flex-1 gap-6">
        {loading ? (
             <div className="flex items-center justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
        ) : dist.length === 0 ? (
            <div className="text-center text-slate-400 py-10 italic text-sm">
                Không tìm thấy đơn hàng
            </div>
        ) : (
            dist.map((item, idx) => {
                const percentage = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
                return (
                    <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <p className="text-slate-900 dark:text-white text-sm font-semibold">
                                    {item.status}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-900 dark:text-white text-sm font-bold">
                                    {percentage}%
                                </p>
                            </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%`, backgroundColor: item.color }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 text-right">
                            {formatNumberVN(item.count)} đơn hàng
                        </p>
                    </div>
                );
            })
        )}
      </div>
      {/* Mini Insight */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-border-dark">
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="material-symbols-outlined text-primary text-xl mt-0.5">
            info
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Theo dõi phân bổ giúp quản lý tồn kho và hiệu quả thực hiện qua tất cả các giai đoạn đơn hàng.
          </p>
        </div>
      </div>
    </div>
  );
}
