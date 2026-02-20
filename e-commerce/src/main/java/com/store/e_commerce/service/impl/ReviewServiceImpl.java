package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.feedback.FeedbackSummaryResponse;
import com.store.e_commerce.dto.feedback.ReviewResponseDTO;
import com.store.e_commerce.entity.Review;
import com.store.e_commerce.repository.ReviewRepository;
import com.store.e_commerce.service.ReviewService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final com.store.e_commerce.repository.ProductRepository productRepository;
    private final com.store.e_commerce.repository.UserRepository userRepository;
    private final com.store.e_commerce.repository.OrderRepository orderRepository;

    @Override
    @Transactional
    public ReviewResponseDTO addReview(com.store.e_commerce.dto.feedback.ReviewRequestDTO request) {
        String phone = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (phone == null || "anonymousUser".equals(phone)) {
            throw new RuntimeException("Vui lòng đăng nhập để thực hiện đánh giá.");
        }

        com.store.e_commerce.entity.User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.store.e_commerce.entity.Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<com.store.e_commerce.entity.Order> orders = orderRepository.findCompletedOrdersByCustomerPhoneAndProductId(phone, request.getProductId());
        
        if (orders.isEmpty()) {
            throw new RuntimeException("Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành.");
        }
        
        com.store.e_commerce.entity.Order order = orders.get(0);

        Review review = Review.builder()
                .product(product)
                .user(user)
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(null) // Pending approval
                .build();
        
        review.setIsActive(true);
        review.setCreatedAt(java.time.LocalDateTime.now()); // Or let JPA handle it

        Review savedReview = reviewRepository.save(review);
        return mapToDTO(savedReview);
    }

    @Override
    public FeedbackSummaryResponse getFeedbackSummary() {
        Double avg = reviewRepository.getAverageRating();
        Long total = reviewRepository.countTotalApprovedReviews();
        Long pending = reviewRepository.countPendingApproval();

        return FeedbackSummaryResponse.builder()
                .averageRating(avg != null ? avg : 0.0)
                .totalReviews(total)
                .pendingApproval(pending)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviews(Integer rating, String search, Integer tab, Pageable pageable) {
        Specification<Review> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tab logic: 0=All(Approved), 1=Pending, 2=Hidden
            if (tab == 0) {
                predicates.add(cb.equal(root.get("approved"), true));
                predicates.add(cb.equal(root.get("isActive"), true));
            } else if (tab == 1) {
                predicates.add(cb.isNull(root.get("approved")));
                predicates.add(cb.equal(root.get("isActive"), true));
            } else if (tab == 2) {
                predicates.add(cb.equal(root.get("isActive"), false));
            }

            if (rating != null && rating > 0) {
                predicates.add(cb.equal(root.get("rating"), rating));
            }

            if (search != null && !search.isEmpty()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                Predicate customerName = cb.like(cb.lower(root.get("user").get("fullName")), searchLower);
                Predicate productName = cb.like(cb.lower(root.get("product").get("title")), searchLower);
                Predicate categoryName = cb.like(cb.lower(root.get("product").get("category").get("title")), searchLower);
                predicates.add(cb.or(customerName, productName, categoryName));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return reviewRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public void approveReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        review.setApproved(true);
        reviewRepository.save(review);
    }

    @Override
    @Transactional
    public void rejectReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        review.setApproved(false);
        review.setIsActive(false);
        reviewRepository.save(review);
    }

    @Override
    @Transactional
    public void hideReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        review.setIsActive(false);
        reviewRepository.save(review);
    }

    @Override
    @Transactional
    public void deleteReview(Integer reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getLatestReviews(int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit, org.springframework.data.domain.Sort.by("createdAt").descending());
        Specification<Review> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("approved"), true),
                cb.equal(root.get("isActive"), true)
        );
        return reviewRepository.findAll(spec, pageable).getContent().stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByProduct(Integer productId) {
        Specification<Review> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("product").get("productId"), productId));
            predicates.add(cb.equal(root.get("approved"), true));
            predicates.add(cb.equal(root.get("isActive"), true));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return reviewRepository.findAll(spec, org.springframework.data.domain.Sort.by("createdAt").descending())
                .stream().map(this::mapToDTO).collect(java.util.stream.Collectors.toList());
    }

    private ReviewResponseDTO mapToDTO(Review review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getReviewId())
                .customerName(review.getUser().getFullName())
                .customerAvatar(review.getUser().getAvatarUrl())
                .productName(review.getProduct().getTitle())
                .productImage(review.getProduct().getThumbnail())
                .categoryName(review.getProduct().getCategory() != null ? review.getProduct().getCategory().getTitle() : "Uncategorized")
                .rating(review.getRating())
                .comment(review.getComment())
                .images(review.getImages() != null ? Arrays.asList(review.getImages().split(",")) : new ArrayList<>())
                .createdAt(review.getCreatedAt())
                .isApproved(review.getApproved())
                .isActive(review.getIsActive())
                .build();
    }
}
