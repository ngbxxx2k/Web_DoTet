package com.store.e_commerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class UserRequest {
    private Integer id;
    
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
    
    private String password;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    
    private String avatarUrl;
    private Integer roleId;
    private Boolean isActive;
    private String adminNotes;
    
    // Address fields
    private String province;
    private String district;
    private String ward;
    private String addressDetail;
}
