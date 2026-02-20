package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WishlistItemResponse {
    private Integer wishlistId;
    private Integer productId;
    private String title;
    private String slug;
    private BigDecimal basePrice;
    private BigDecimal discountedPrice;
    private String thumbnail;
    private String status;
    private LocalDateTime addedAt;
}
