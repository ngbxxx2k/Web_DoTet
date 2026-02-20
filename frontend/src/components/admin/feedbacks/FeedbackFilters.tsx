interface FeedbackFiltersProps {
  tab: number;
  setTab: (tab: number) => void;
  rating: number | undefined;
  setRating: (rating: number | undefined) => void;
  search: string;
  setSearch: (search: string) => void;
  pendingCount: number;
}

export default function FeedbackFilters({
  tab,
  setTab,
  rating,
  setRating,
  search,
  setSearch,
  pendingCount,
}: FeedbackFiltersProps) {
  return (
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-1 lg:pb-0 border-b border-slate-200 dark:border-slate-800 w-full lg:w-auto">
        <button 
          onClick={() => setTab(0)}
          className={`flex items-center justify-center px-4 py-3 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
            tab === 0 ? "border-primary text-primary dark:text-white" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Tất Cả Đánh Giá
        </button>
        <button 
          onClick={() => setTab(1)}
          className={`flex items-center justify-center px-4 py-3 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
            tab === 1 ? "border-primary text-primary dark:text-white" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Chờ Duyệt
          {pendingCount > 0 && (
            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setTab(2)}
          className={`flex items-center justify-center px-4 py-3 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
            tab === 2 ? "border-primary text-primary dark:text-white" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Đã Ẩn
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <div className="relative">
          <select 
            value={rating || ""}
            onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) : undefined)}
            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-2.5 pl-4 pr-10 rounded-lg focus:ring-primary focus:border-primary text-sm font-medium h-11 cursor-pointer"
          >
            <option value="">Tất Cả Sao</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            expand_more
          </span>
        </div>
        <div className="relative flex-1 lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">
              search
            </span>
          </div>
          <input
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary placeholder-slate-400 text-sm h-11"
            placeholder="Tìm theo khách hàng, sản phẩm..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
