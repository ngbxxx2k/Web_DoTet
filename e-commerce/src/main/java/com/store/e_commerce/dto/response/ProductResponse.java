package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Integer id;
    private String title;
    private String productName; // Alias for title, for frontend compatibility
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private CategoryResponse category;
    private String categoryName; // Direct access for frontend
    private Boolean isActive;
    private String vendor;
    
    private String thumbnail;
    
    private List<String> images;
    private List<ProductVariantResponse> variants;
    
    private Double rating;
    private Long reviews;
    
    private Integer totalStock;
    private String stockStatus;
}
