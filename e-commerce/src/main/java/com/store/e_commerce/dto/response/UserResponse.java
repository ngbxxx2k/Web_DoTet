package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class UserResponse {
    private Integer id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String avatarUrl;
    private Boolean isActive;
    private String adminNotes;
    
    // Role info
    private Integer roleId;
    private String roleCode;
    private String roleName;
    
    // Address info
    private String province;
    private String district;
    private String ward;
    private String addressDetail;
    
    // Stats (can be calculated)
    private Integer orderCount;
    private Double totalSpent;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
