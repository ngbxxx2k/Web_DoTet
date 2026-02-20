import Link from "next/link";
import ProductList from "@/components/admin/products/ProductList";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Sản Phẩm</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Sản Phẩm
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Quản lý danh mục sản phẩm, kho hàng và giá cả.
          </p>
        </div>
      </div>

      {/* Main Content (Table + Filters) */}
      <ProductList />
    </div>
  );
}
