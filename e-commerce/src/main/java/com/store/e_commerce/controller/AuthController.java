package com.store.e_commerce.controller;

import com.store.e_commerce.dto.request.ForgotPasswordRequest;
import com.store.e_commerce.dto.request.LoginRequest;
import com.store.e_commerce.dto.request.RegisterRequest;
import com.store.e_commerce.dto.response.UserResponse;
import com.store.e_commerce.entity.User;
import com.store.e_commerce.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(mapToResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, 
                                   HttpServletRequest httpRequest, 
                                   HttpServletResponse httpResponse) {
        try {
            User user = authService.login(request);
            
            // Force session creation
            httpRequest.getSession(true);
            
            // Store SecurityContext in session (critical for session-based auth)
            SecurityContext context = SecurityContextHolder.getContext();
            new HttpSessionSecurityContextRepository().saveContext(context, httpRequest, httpResponse);
            
            return ResponseEntity.ok(mapToResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        // Always return success to prevent user enumeration
        return ResponseEntity.ok(Map.of("message", "Nếu tài khoản tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
        }
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        if (authentication != null) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);
        }
        return ResponseEntity.ok().build();
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roleCode(user.getRole().getRoleCode())
                .roleName(user.getRole().getRoleName())
                .roleId(user.getRole().getRoleId())
                .isActive(user.getIsActive())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
