"use client";

import Link from "next/link";
import FeedbackStats from "@/components/admin/feedbacks/FeedbackStats";
import FeedbackFilters from "@/components/admin/feedbacks/FeedbackFilters";
import FeedbackList from "@/components/admin/feedbacks/FeedbackList";
import { useFeedback } from "@/hooks/useFeedback";
import { toast } from "react-hot-toast";

export default function FeedbacksPage() {
  const { 
    reviews, 
    summary, 
    loading, 
    totalElements, 
    totalPages, 
    currentPage, 
    setCurrentPage,
    tab,
    setTab,
    rating,
    setRating,
    search,
    setSearch,
    approveReview,
    rejectReview,
    hideReview,
    deleteReview
  } = useFeedback();

  const handleApprove = async (id: number) => {
    const success = await approveReview(id);
    if (success) {
      toast.success("Đã duyệt đánh giá thành công");
    } else {
      toast.error("Lỗi khi duyệt đánh giá");
    }
  };

  const handleReject = async (id: number) => {
    const success = await rejectReview(id);
    if (success) {
      toast.success("Đã từ chối đánh giá");
    } else {
      toast.error("Lỗi khi từ chối đánh giá");
    }
  };

  const handleHide = async (id: number) => {
    const success = await hideReview(id);
    if (success) {
      toast.success("Đã ẩn đánh giá");
    } else {
      toast.error("Lỗi khi ẩn đánh giá");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không?")) {
      const success = await deleteReview(id);
      if (success) {
        toast.success("Đã xóa đánh giá vĩnh viễn");
      } else {
        toast.error("Lỗi khi xóa đánh giá");
      }
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Tổng quan
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Đánh Giá</span>
      </nav>

      <FeedbackStats summary={summary} loading={loading} />
      
      <div>
          <FeedbackFilters 
            tab={tab} 
            setTab={setTab} 
            rating={rating} 
            setRating={setRating} 
            search={search} 
            setSearch={setSearch}
            pendingCount={summary?.pendingApproval || 0}
          />
          <FeedbackList 
            reviews={reviews} 
            loading={loading}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            tab={tab}
            onApprove={handleApprove}
            onReject={handleReject}
            onHide={handleHide}
            onDelete={handleDelete}
          />
      </div>
    </div>
  );
}
