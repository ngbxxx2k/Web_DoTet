package com.store.e_commerce.repository;

import com.store.e_commerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer>, JpaSpecificationExecutor<Review> {
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.approved = true AND r.isActive = true")
    Double getAverageRating();

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId AND r.approved = true AND r.isActive = true")
    Double getAverageRatingByProductId(Integer productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.approved = true AND r.isActive = true")
    Long countTotalApprovedReviews();

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.productId = :productId AND r.approved = true AND r.isActive = true")
    Long countTotalApprovedReviewsByProductId(Integer productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.approved IS NULL AND r.isActive = true")
    Long countPendingApproval();
}
