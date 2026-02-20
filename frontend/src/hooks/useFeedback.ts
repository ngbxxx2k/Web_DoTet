"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const API_BASE_URL = `${API_URL}/reviews`;

export interface Review {
  reviewId: number;
  customerName: string;
  customerAvatar: string;
  productName: string;
  productImage: string;
  categoryName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  isApproved: boolean | null;
  isActive: boolean;
}

export interface FeedbackSummary {
  averageRating: number;
  totalReviews: number;
  pendingApproval: number;
}

export const useFeedback = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [tab, setTab] = useState(0); // 0: All, 1: Pending, 2: Hidden
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Reset page on tab or rating change
  useEffect(() => {
    setCurrentPage(0);
  }, [tab, rating]);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        tab: tab.toString(),
      });
      if (rating) queryParams.append("rating", rating.toString());
      if (debouncedSearch) queryParams.append("search", debouncedSearch);

      const response = await fetch(`${API_BASE_URL}?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, tab, rating, debouncedSearch]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approveReview = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/approve`, { method: "POST" });
      if (response.ok) {
        fetchReviews();
        fetchSummary();
        return true;
      }
    } catch (error) {
      console.error("Error approving review:", error);
    }
    return false;
  };

  const rejectReview = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/reject`, { method: "POST" });
      if (response.ok) {
        fetchReviews();
        fetchSummary();
        return true;
      }
    } catch (error) {
      console.error("Error rejecting review:", error);
    }
    return false;
  };

  const hideReview = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/hide`, { method: "POST" });
      if (response.ok) {
        fetchReviews();
        fetchSummary();
        return true;
      }
    } catch (error) {
      console.error("Error hiding review:", error);
    }
    return false;
  };

  const deleteReview = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchReviews();
        fetchSummary();
        return true;
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
    return false;
  };

  return {
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
    deleteReview,
    refresh: fetchReviews
  };
};
