package com.store.e_commerce.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductVariantRequest {
    private Integer id;
    private String size;
    private String color;
    private String sku;
    private Integer stock; // Mapped to stockQuantity
    private BigDecimal price;
    private List<String> images; // Kept URLs
}
