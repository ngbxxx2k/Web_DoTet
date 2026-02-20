package com.store.e_commerce.service;

import com.store.e_commerce.dto.feedback.FeedbackSummaryResponse;
import com.store.e_commerce.dto.feedback.ReviewResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    FeedbackSummaryResponse getFeedbackSummary();
    Page<ReviewResponseDTO> getReviews(Integer rating, String search, Integer tab, Pageable pageable);
    void approveReview(Integer reviewId);
    void rejectReview(Integer reviewId);
    void hideReview(Integer reviewId);
    void deleteReview(Integer reviewId);
    java.util.List<ReviewResponseDTO> getLatestReviews(int limit);
    java.util.List<ReviewResponseDTO> getReviewsByProduct(Integer productId);
    ReviewResponseDTO addReview(com.store.e_commerce.dto.feedback.ReviewRequestDTO request);
}
