package com.store.e_commerce.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private Integer id;
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name; // Mapped to title
    
    private String description;
    
    private Boolean isActive;
    
    @NotNull(message = "Danh mục không được để trống")
    private Integer categoryId;
    
    private String vendor;
    
    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0.0", message = "Giá không được nhỏ hơn 0")
    private BigDecimal basePrice;
    
    // Kept existing image URLs
    private List<String> images;
    
    // Kept existing thumbnail URL
    private String thumbnail;
    
    // Nested variants
    private List<ProductVariantRequest> variants;
}
