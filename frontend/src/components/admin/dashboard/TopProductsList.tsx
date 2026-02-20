"use client";

import { useTopProducts } from "@/hooks/useAnalytics";
import { formatVND } from "@/utils/format";
import Image from "next/image";
import { useState } from "react";

export default function TopProductsList() {
    const startDate = "2023-01-01T00:00:00"; 
    const [endDate] = useState(new Date().toISOString()); 
    
    // Widget data (top 5)
    const { products, loading } = useTopProducts(startDate, endDate, 0, 5);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPage, setModalPage] = useState(0);
    const modalSize = 10;
    
    // Modal data
    const { 
        products: modalProducts, 
        totalPages, 
        loading: modalLoading 
    } = useTopProducts(startDate, endDate, modalPage, modalSize);

    return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm col-span-1">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Sản Phẩm Bán Chạy
          </h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-primary text-sm font-medium hover:underline"
          >
            Xem Tất Cả
          </button>
        </div>

        <div className="flex flex-col gap-5">
            {products.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                  <Image
                    src={product.productImage || "https://placehold.co/100x100?text=No+Image"}
                    alt={product.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {product.productName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {product.quantitySold} đã bán
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatVND(product.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
            {products.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-4">Chưa có dữ liệu</div>
            )}
          </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Sản Phẩm Bán Chạy Nhất
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                            <th className="py-4 px-6">Sản Phẩm</th>
                            <th className="py-4 px-6 text-center">Đã Bán</th>
                            <th className="py-4 px-6 text-right">Doanh Thu</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800 transition-opacity duration-200 ${modalLoading ? "opacity-50 pointer-events-none" : ""}`}>
                        {modalProducts.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="py-4 px-6 flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                                        <Image src={p.productImage || "https://placehold.co/100x100?text=No+Image"} alt={p.productName} fill className="object-cover" />
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">{p.productName}</span>
                                </td>
                                <td className="py-4 px-6 text-center font-medium text-slate-700 dark:text-slate-300">{p.quantitySold}</td>
                                <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">{formatVND(p.totalRevenue)}</td>
                            </tr>
                        ))}
                        {modalProducts.length === 0 && modalLoading && (
                             <tr><td colSpan={3} className="text-center py-12 text-slate-500">Đang tải...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <button 
                    disabled={modalPage === 0}
                    onClick={() => setModalPage(p => p - 1)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Trước
                </button>
                <span className="text-sm text-slate-600">
                    Trang {modalPage + 1} / {totalPages}
                </span>
                <button 
                    disabled={modalPage >= totalPages - 1}
                    onClick={() => setModalPage(p => p + 1)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sau
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
