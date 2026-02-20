package com.store.e_commerce.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CategoryResponse {
    private Integer id;
    private Integer parentId;
    private String title;
    private String categoryName; // Alias for title, for frontend compatibility
    private String slug;
    private String description;
    private String imageUrl;
    private Integer level;
    private Boolean isActive;
    
    // Include some basic counters or children if needed for tree
    private Long productCount; // Can be calculated or fetched
    private List<CategoryResponse> children;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
