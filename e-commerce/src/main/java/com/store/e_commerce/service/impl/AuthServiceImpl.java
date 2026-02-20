package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.ForgotPasswordRequest;
import com.store.e_commerce.dto.request.LoginRequest;
import com.store.e_commerce.dto.request.RegisterRequest;
import com.store.e_commerce.entity.Role;
import com.store.e_commerce.entity.User;
import com.store.e_commerce.repository.RoleRepository;
import com.store.e_commerce.repository.UserRepository;
import com.store.e_commerce.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public User register(RegisterRequest request) {
        // Validate phone number format
        String phone = request.getPhoneNumber();
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }
        
        // Normalize phone number (remove spaces, dashes)
        phone = phone.replaceAll("[\\s\\-]", "");
        
        // Check if phone already registered
        if (userRepository.existsByPhoneNumber(phone)) {
            throw new RuntimeException("Số điện thoại đã được đăng ký");
        }
        
        // Check if email already registered
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được đăng ký");
        }

        Role customerRole = roleRepository.findByRoleCode("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Hệ thống chưa sẵn sàng. Vui lòng thử lại sau."));

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .phoneNumber(phone)
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(customerRole)
                .build();
        user.setIsActive(true);

        return userRepository.save(user);
    }

    @Override
    public User login(LoginRequest request) {
        // Normalize phone number
        String phone = request.getPhoneNumber();
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }
        phone = phone.replaceAll("[\\s\\-]", "");
        
        try {
            // Check if user exists and is active BEFORE authentication
            User user = userRepository.findByPhoneNumber(phone).orElse(null);
            System.out.println("DEBUG: Looking for user with phone: " + phone);
            System.out.println("DEBUG: User found: " + (user != null));
            
            if (user == null) {
                System.out.println("DEBUG: User not found!");
                throw new RuntimeException("Số điện thoại hoặc mật khẩu không đúng");
            }
            
            System.out.println("DEBUG: User isActive: " + user.getIsActive());
            
            // Check if account is disabled
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                throw new RuntimeException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.");
            }
            
            System.out.println("DEBUG: Attempting authentication...");
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(phone, request.getPassword())
            );
            System.out.println("DEBUG: Authentication successful!");

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            return user;
            
        } catch (DisabledException e) {
            System.out.println("DEBUG: DisabledException: " + e.getMessage());
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.");
        } catch (BadCredentialsException e) {
            System.out.println("DEBUG: BadCredentialsException: " + e.getMessage());
            throw new RuntimeException("Số điện thoại hoặc mật khẩu không đúng");
        } catch (AuthenticationException e) {
            throw new RuntimeException("Đăng nhập thất bại. Vui lòng thử lại.");
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        // Normalize phone number
        String phone = request.getPhoneNumber();
        if (phone != null) {
            phone = phone.replaceAll("[\\s\\-]", "");
        }
        
        // Don't reveal if user exists or not for security
        userRepository.findByPhoneNumber(phone).ifPresent(user -> {
            // TODO: Implement SMS/Email OTP sending
            // For now, just log or store the reset request
        });
    }

    @Override
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        
        String phoneNumber = auth.getName();
        return userRepository.findByPhoneNumber(phoneNumber).orElse(null);
    }
}
