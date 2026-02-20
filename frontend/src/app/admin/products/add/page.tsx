import Link from "next/link";
import ProductForm from "@/components/admin/products/ProductForm";

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <Link className="hover:text-primary transition-colors" href="/admin/products">
          Products
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Add New Product</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Add New Product
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
             href="/admin/products"
             className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">
            Cancel
          </Link>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm />
    </div>
  );
}
