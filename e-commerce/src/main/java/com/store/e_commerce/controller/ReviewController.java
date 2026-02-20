package com.store.e_commerce.controller;

import com.store.e_commerce.dto.feedback.FeedbackSummaryResponse;
import com.store.e_commerce.dto.feedback.ReviewResponseDTO;
import com.store.e_commerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/summary")
    public ResponseEntity<FeedbackSummaryResponse> getSummary() {
        return ResponseEntity.ok(reviewService.getFeedbackSummary());
    }

    @GetMapping("/latest")
    public ResponseEntity<java.util.List<ReviewResponseDTO>> getLatestReviews(@RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(reviewService.getLatestReviews(limit));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<java.util.List<ReviewResponseDTO>> getReviewsByProduct(@PathVariable Integer productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @GetMapping
    public ResponseEntity<Page<ReviewResponseDTO>> getReviews(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") Integer tab,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reviewService.getReviews(rating, search, tab, pageable));
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> addReview(@RequestBody com.store.e_commerce.dto.feedback.ReviewRequestDTO request) {
        return ResponseEntity.ok(reviewService.addReview(request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable Integer id) {
        reviewService.approveReview(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Integer id) {
        reviewService.rejectReview(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/hide")
    public ResponseEntity<Void> hide(@PathVariable Integer id) {
        reviewService.hideReview(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
}
