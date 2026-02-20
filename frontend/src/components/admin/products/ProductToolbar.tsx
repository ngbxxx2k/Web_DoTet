export default function ProductToolbar() {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-symbols-outlined text-slate-400">
              search
            </span>
          </div>
          <input
            className="block w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-primary focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search by name, SKU..."
            type="text"
          />
        </div>
        {/* Filter Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <select className="rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Clothing</option>
            <option>Home & Garden</option>
          </select>
          <select className="rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary">
            <option>All Status</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              className="w-20 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Min"
              type="number"
            />
            <span className="text-slate-400">-</span>
            <input
              className="w-20 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Max"
              type="number"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
