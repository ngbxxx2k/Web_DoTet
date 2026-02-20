package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductVariantResponse {
    private Integer id;
    private String sku;
    private BigDecimal price;
    private Integer stock;
    private Integer stockQuantity;
    private String size; // Derived from attributes or simplified
    private String color; // Derived from attributes or simplified
    private String imageUrl; // Primary variant image
    private List<String> images; // Additional images if distinct from Product
    private List<AttributeInfo> attributes; // For order form variant selection

    @Data
    @Builder
    public static class AttributeInfo {
        private String name;
        private String value;
    }
}
