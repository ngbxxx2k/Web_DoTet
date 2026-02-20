import { Review } from "@/hooks/useFeedback";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return Math.floor(seconds) + " giây trước";
}

interface FeedbackListProps {
  reviews: Review[];
  loading: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  tab: number;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onHide: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function FeedbackList({
  reviews,
  loading,
  totalElements,
  totalPages,
  currentPage,
  setCurrentPage,
  tab,
  onApprove,
  onReject,
  onHide,
  onDelete,
}: FeedbackListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">
          rate_review
        </span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Không tìm thấy đánh giá nào
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {reviews.map((review) => (
        <div key={review.reviewId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* User & Status */}
            <div className="flex flex-row md:flex-col gap-4 min-w-[200px]">
              <div className="flex items-center gap-3">
                {review.customerAvatar ? (
                    <img 
                        src={review.customerAvatar} 
                        alt={review.customerName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {review.customerName.charAt(0)}
                    </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {review.customerName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {timeAgo(review.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                {review.isApproved === null && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    Chờ Phê Duyệt
                  </span>
                )}
                {review.isApproved === true && review.isActive && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Đã Đăng
                  </span>
                )}
                {!review.isActive && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                    Đã Ẩn
                  </span>
                )}
                {review.isApproved === false && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Từ Chối
                    </span>
                )}
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-2">
                <img 
                    src={review.productImage || "/placeholder-product.png"} 
                    alt={review.productName}
                    className="w-12 h-12 rounded object-cover"
                />
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                    {review.categoryName}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary cursor-pointer">
                    {review.productName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined text-lg ${i <= review.rating ? "fill-1" : "text-slate-300 dark:text-slate-600"}`}
                  >
                    star
                  </span>
                ))}
                <span className="text-slate-900 dark:text-white font-bold ml-2 text-sm">
                  {review.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">
                "{review.comment}"
              </p>
              
              {/* Photos */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {review.images.map((img, idx) => (
                    <img 
                        key={idx}
                        src={img} 
                        className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-slate-200 dark:border-slate-800"
                        alt={`Review Image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {tab === 1 && (
                    <>
                        <button 
                            onClick={() => onApprove(review.reviewId)}
                            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Phê Duyệt
                        </button>
                        <button 
                            onClick={() => onReject(review.reviewId)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">cancel</span>
                            Từ Chối
                        </button>
                    </>
                )}
                {tab === 0 && (
                    <button 
                        onClick={() => onHide(review.reviewId)}
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">visibility_off</span>
                        Ẩn Đánh Giá
                    </button>
                )}
                {tab === 2 && (
                    <button 
                        onClick={() => onDelete(review.reviewId)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Xóa Vĩnh Viễn
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-2 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Hiển thị <span className="font-medium text-slate-900 dark:text-white">{currentPage * reviews.length + 1}</span> đến <span className="font-medium text-slate-900 dark:text-white">{Math.min((currentPage + 1) * reviews.length, totalElements)}</span> trên tổng số <span className="font-medium text-slate-900 dark:text-white">{totalElements}</span> kết quả
            </p>
            <div className="flex gap-2">
                <button 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >Trước</button>
                <button 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >Sau</button>
            </div>
        </div>
      )}
    </div>
  );
}
