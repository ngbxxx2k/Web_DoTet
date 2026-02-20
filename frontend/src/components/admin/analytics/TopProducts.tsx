import { useState } from "react";
import { useTopProducts } from "@/hooks/useAnalytics";
import { formatVND } from "@/utils/format";

interface TopProductsProps {
  startDate: string;
  endDate: string;
}

export default function TopProducts({ startDate, endDate }: TopProductsProps) {
  const [page, setPage] = useState(0);
  const size = 5;
  const { products, totalPages, loading } = useTopProducts(startDate, endDate, page, size);

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  return (
    <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm @container">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Sản Phẩm Bán Chạy Nhất
        </h3>
        <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Trang {page + 1} / {totalPages || 1}</span>
            <div className="flex gap-1">
                <button 
                    disabled={page === 0 || loading}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button 
                    disabled={page >= totalPages - 1 || loading}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark min-h-[420px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 text-center">
                Xếp Hạng
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sản Phẩm
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                Doanh Thu
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-24">
                Đã Bán
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {loading ? (
                Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                         <td colSpan={4} className="px-6 py-6"><div className="h-4 bg-slate-50 dark:bg-slate-800 rounded w-full"></div></td>
                    </tr>
                ))
            ) : products.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic text-sm">Không có dữ liệu bán hàng cho giai đoạn này</td>
                </tr>
            ) : products.map((product, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-primary text-center">
                  <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xs">
                    {page * size + index + 1}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 bg-center bg-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      style={{
                        backgroundImage: `url(${product.productImage || 'https://via.placeholder.com/40'})`,
                      }}
                    ></div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                      {product.productName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 text-right font-medium">
                  {formatCurrency(product.totalRevenue)}
                </td>
                <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white text-right">
                  {product.quantitySold}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
