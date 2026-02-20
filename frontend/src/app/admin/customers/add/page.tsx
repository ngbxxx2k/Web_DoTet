import Link from "next/link";
import CustomerForm from "@/components/admin/customers/CustomerForm";

export default function AddCustomerPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <Link className="hover:text-primary transition-colors" href="/admin/customers">
          Customers
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Add New</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Add New Customer
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <span>Cancel</span>
          </Link>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/30">
            <span className="material-symbols-outlined text-[20px]">check</span>
            <span>Save Customer</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <CustomerForm />
    </div>
  );
}
