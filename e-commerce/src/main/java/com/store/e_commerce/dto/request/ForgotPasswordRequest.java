package com.store.e_commerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    // In a real flow, this would likely be an OTP request or similar.
    // However, the prompt asks for "forgot password UI".
    // I can also add new password fields if this is a password reset.
    // For now, I'll assume initiate reset request.
}
