import { FeedbackSummary } from "@/hooks/useFeedback";
import { formatNumberVN } from "@/utils/format";

interface FeedbackStatsProps {
  summary: FeedbackSummary | null;
  loading: boolean;
}

export default function FeedbackStats({ summary, loading }: FeedbackStatsProps) {
  const skeleton = (
    <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Average Rating */}
      <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              Đánh Giá Trung Bình
            </p>
            <div className="flex items-baseline gap-2">
              {loading ? skeleton : (
                <>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {summary?.averageRating?.toFixed(1) || "0.0"}
                  </p>
                  <span className="flex text-amber-400 gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined fill-1 text-lg">
                        {i <= (summary?.averageRating || 0) ? "star" : i - 0.5 <= (summary?.averageRating || 0) ? "star_half" : "star_outline"}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </div>
          </div>
          <span className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
            <span className="material-symbols-outlined">hotel_class</span>
          </span>
        </div>
      </div>

      {/* Total Reviews */}
      <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              Tổng Số Đánh Giá
            </p>
            {loading ? skeleton : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumberVN(summary?.totalReviews)}
              </p>
            )}
          </div>
          <span className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <span className="material-symbols-outlined">rate_review</span>
          </span>
        </div>
      </div>

      {/* Pending Approval */}
      <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              Chờ Phê Duyệt
            </p>
            {loading ? skeleton : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {summary?.pendingApproval || "0"}
              </p>
            )}
          </div>
          <span className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
            <span className="material-symbols-outlined">hourglass_top</span>
          </span>
        </div>
        {!loading && (summary?.pendingApproval || 0) > 0 && (
           <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2 font-medium">
             <span className="material-symbols-outlined text-sm">warning</span>
             Cần xử lý
           </p>
        )}
      </div>
    </div>
  );
}
