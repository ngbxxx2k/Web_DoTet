export default function TrafficSourceChart() {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-border-dark shadow-sm p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#111318] dark:text-white text-lg font-bold leading-tight">
          Nguồn Truy Cập
        </h3>
        <button className="text-primary hover:text-blue-700 text-sm font-medium">
          Xem Báo Cáo
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center py-4">
        {/* Donut Chart Representation */}
        <div className="relative w-48 h-48">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            {/* Background Circle */}
            <path
              className="text-gray-100 dark:text-gray-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.8"
            ></path>
            {/* Segment 1 (Blue) */}
            <path
              className="text-primary"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="40, 100"
              strokeWidth="3.8"
            ></path>
            {/* Segment 2 (Purple) */}
            <path
              className="text-purple-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="25, 100"
              strokeDashoffset="-40"
              strokeWidth="3.8"
            ></path>
            {/* Segment 3 (Emerald) */}
            <path
              className="text-emerald-400"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="15, 100"
              strokeDashoffset="-65"
              strokeWidth="3.8"
            ></path>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#111318] dark:text-white">
              12.3k
            </span>
            <span className="text-xs text-gray-500 font-medium">Lượt Truy Cập</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Trực tiếp
            </span>
          </div>
          <span className="text-sm font-bold text-[#111318] dark:text-white">
            40%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Mạng Xã Hội
            </span>
          </div>
          <span className="text-sm font-bold text-[#111318] dark:text-white">
            25%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Tự Nhiên
            </span>
          </div>
          <span className="text-sm font-bold text-[#111318] dark:text-white">
            15%
          </span>
        </div>
      </div>
    </div>
  );
}
