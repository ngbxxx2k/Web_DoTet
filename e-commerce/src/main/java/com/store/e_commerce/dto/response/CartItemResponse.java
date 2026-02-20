package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Integer cartItemId;
    private Integer productVariantId;
    private Integer productId;
    private String title;
    private String sku;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalLinePrice;
    private String imageUrl;
}
