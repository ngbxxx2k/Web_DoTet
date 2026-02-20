import { RevenueData } from "@/hooks/useAnalytics";
import { formatVND } from "@/utils/format";

interface RevenueChartProps {
  data: RevenueData[];
  loading: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 1000000;
  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  return (
    <section className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Tổng Quan Doanh Thu
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Biểu đồ xu hướng thu nhập theo thời gian
          </p>
        </div>
        <div className="flex items-end gap-2 text-right">
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Giai Đoạn Đang Chọn
            </p>
          </div>
        </div>
      </div>

      <div className="relative h-64 w-full mt-4 group">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0"></div>
          <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0"></div>
          <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0"></div>
          <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0"></div>
          <div className="border-b border-slate-200 dark:border-slate-700 w-full h-0"></div>
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-between px-2 sm:px-8 gap-1 sm:gap-2 z-10">
          {loading ? (
             <div className="w-full flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          ) : data.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                Không có dữ liệu doanh thu cho khoảng thời gian này
            </div>
          ) : (
            data.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 group/bar h-full justify-end">
                <div 
                  className="w-full max-w-[40px] bg-primary/30 dark:bg-primary/40 rounded-t-sm relative transition-all duration-300 hover:bg-primary hover:shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                  style={{ height: `${(item.revenue / maxRevenue) * 90}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap z-50 pointer-events-none">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate w-full text-center">
                  {item.date.split('-').slice(1).reverse().join('/')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
