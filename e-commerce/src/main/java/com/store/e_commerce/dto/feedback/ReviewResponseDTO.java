package com.store.e_commerce.dto.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Integer reviewId;
    private String customerName;
    private String customerAvatar;
    private String productName;
    private String productImage;
    private String categoryName;
    private Integer rating;
    private String comment;
    private List<String> images;
    private LocalDateTime createdAt;
    private Boolean isApproved;
    private Boolean isActive;
}
