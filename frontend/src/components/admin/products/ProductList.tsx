"use client";

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { formatVND } from "@/utils/format";
import Link from "next/link";
import { useState } from "react";

const Icon = ({ name }: { name: string }) => <span className="material-symbols-outlined text-[20px]">{name}</span>;

import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ProductList() {
  const { products, loading, pagination, setPagination, filters, setFilters, refresh, deleteProduct: deleteProductApi } = useProducts();
  const { options: categoryOptions } = useCategories();
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters(prev => ({ ...prev, search: e.target.value }));
      setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({ ...prev, categoryId: e.target.value }));
      setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleDeleteClick = (id: number) => {
      setProductToDelete(id);
      setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (productToDelete !== null) {
          await deleteProductApi(productToDelete);
          setDeleteModalOpen(false);
          setProductToDelete(null);
      }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* HEADER & FILTERS */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 space-y-4">
        {/* ... (Header content unchanged) ... */}
        <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tất cả sản phẩm</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Search */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="search" />
                </span>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm sản phẩm..." 
                    value={filters.search}
                    onChange={handleSearch}
                    className="pl-10 block w-full rounded-lg border-0 py-2.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-primary dark:bg-slate-700 sm:text-sm"
                />
            </div>

            {/* 2. Category */}
            <div>
                <select 
                    value={filters.categoryId}
                    onChange={handleCategoryChange}
                    className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-primary dark:bg-slate-700 sm:text-sm"
                >
                    <option value="">Tất cả danh mục</option>
                    {categoryOptions.map(opt => (
                        <option key={opt.id} value={opt.id} dangerouslySetInnerHTML={{__html: opt.label.replace(/ /g, '&nbsp;')}} />
                    ))}
                </select>
            </div>

            {/* 3. Attributes Button */}
            <Link 
                href="/admin/products/attributes" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
                <Icon name="category" />
                Thuộc tính
            </Link>

            {/* 4. Add Product Button */}
            <Link 
                href="/admin/products/add" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-sm"
            >
                <Icon name="add" />
                Thêm sản phẩm
            </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="px-5 py-3 font-semibold text-slate-500">Sản phẩm</th>
                    <th className="px-5 py-3 font-semibold text-slate-500">Danh mục</th>
                    <th className="px-5 py-3 font-semibold text-slate-500">Tồn kho</th>
                    <th className="px-5 py-3 font-semibold text-slate-500">Giá</th>
                    <th className="px-5 py-3 font-semibold text-slate-500">Trạng thái</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                    <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-500">Đang tải dữ liệu...</td>
                    </tr>
                ) : products.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-500">Không tìm thấy sản phẩm.</td>
                    </tr>
                ) : (
                    products.map(product => (
                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white">
                                        {product.images && product.images[0] && (
                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">{product.title}</div>
                                        <div className="text-xs text-slate-500">{product.variants?.length || 0} biến thể</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-slate-500">{product.category?.title || "-"}</td>
                            <td className="px-5 py-4 text-slate-900 dark:text-white font-medium">
                                {product.variants?.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) || 0}
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{formatVND(product.basePrice)}</td>
                            <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    product.isActive 
                                    ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" 
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                                }`}>
                                    {product.isActive ? "Đang bán" : "Nháp"}
                                </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link 
                                        href={`/admin/products/${product.id}/edit`}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/20"
                                    >
                                        <Icon name="edit" />
                                    </Link>
                                    <button 
                                        onClick={() => handleDeleteClick(product.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                                    >
                                        <Icon name="delete" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <button 
                disabled={pagination.page === 0}
                onClick={() => {
                    const newPage = pagination.page - 1;
                    setPagination(prev => ({ ...prev, page: newPage }));
                    refresh(newPage);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm disabled:opacity-50"
            >
                Trước
            </button>
            <span className="text-sm text-slate-500">Trang {pagination.page + 1} / {pagination.totalPages}</span>
            <button 
                disabled={pagination.page + 1 >= pagination.totalPages}
                onClick={() => {
                    const newPage = pagination.page + 1;
                    setPagination(prev => ({ ...prev, page: newPage }));
                    refresh(newPage);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm disabled:opacity-50"
            >
                Sau
            </button>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
