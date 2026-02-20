package com.store.e_commerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    
    @NotBlank(message = "Tên danh mục không được để trống")
    private String title;
    
    @NotBlank(message = "Đường dẫn (slug) không được để trống")
    private String slug;
    
    private Integer parentId;
    
    private String description;
    
    private String imageUrl;
    
    @com.fasterxml.jackson.annotation.JsonProperty("active")
    private Boolean active = true;
    
    // Optional: for "Update sub-products" logic if handled by backend
    private Boolean updateSubProducts = false;
}
