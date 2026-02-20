package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.UserRequest;
import com.store.e_commerce.dto.response.RoleResponse;
import com.store.e_commerce.dto.response.UserResponse;
import com.store.e_commerce.entity.Role;
import com.store.e_commerce.entity.User;
import com.store.e_commerce.entity.UserAddress;
import com.store.e_commerce.repository.RoleRepository;
import com.store.e_commerce.repository.UserAddressRepository;
import com.store.e_commerce.repository.UserRepository;
import com.store.e_commerce.service.UserService;
import com.store.e_commerce.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserAddressRepository userAddressRepository;
    private final com.store.e_commerce.service.FileUploadService fileUploadService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String search, Integer roleId, Boolean isActive, Pageable pageable) {
        Specification<User> spec = UserSpecification.getSpecifications(search, roleId, isActive);
        Page<User> users = userRepository.findAll(spec, pageable);
        return users.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .avatarUrl(request.getAvatarUrl())
                .role(role)
                .adminNotes(request.getAdminNotes())
                .build();
        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        user = userRepository.save(user);

        // Save address if provided
        if (request.getProvince() != null || request.getDistrict() != null || 
            request.getWard() != null || request.getAddressDetail() != null) {
            UserAddress address = UserAddress.builder()
                    .user(user)
                    .province(request.getProvince())
                    .district(request.getDistrict())
                    .ward(request.getWard())
                    .addressDetail(request.getAddressDetail() != null ? request.getAddressDetail() : "")
                    .isDefault(true)
                    .build();
            userAddressRepository.save(address);
        }

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Integer id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check email uniqueness if changed
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setRole(role);
        user.setIsActive(request.getIsActive());
        user.setAdminNotes(request.getAdminNotes());

        // Update password only if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);

        // Update address if provided
        if (request.getProvince() != null || request.getDistrict() != null || 
            request.getWard() != null || request.getAddressDetail() != null) {
            
            UserAddress address = userAddressRepository.findByUserUserIdAndIsDefaultTrue(user.getUserId())
                    .orElse(UserAddress.builder().user(user).isDefault(true).build());
            
            address.setProvince(request.getProvince());
            address.setDistrict(request.getDistrict());
            address.setWard(request.getWard());
            address.setAddressDetail(request.getAddressDetail() != null ? request.getAddressDetail() : "");
            
            userAddressRepository.save(address);
        }

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(role -> RoleResponse.builder()
                        .id(role.getRoleId())
                        .roleCode(role.getRoleCode())
                        .roleName(role.getRoleName())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public long getTotalUsers() {
        return userRepository.count();
    }

    @Override
    public long getActiveUsers() {
        return userRepository.count(UserSpecification.getSpecifications(null, null, true));
    }

    @Override
    public long getBlockedUsers() {
        return userRepository.count(UserSpecification.getSpecifications(null, null, false));
    }

    private UserResponse mapToResponse(User user) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .adminNotes(user.getAdminNotes())
                .roleId(user.getRole().getRoleId())
                .roleCode(user.getRole().getRoleCode())
                .roleName(user.getRole().getRoleName())
                .orderCount(0) // TODO: Calculate from orders
                .totalSpent(0.0) // TODO: Calculate from orders
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        // Add address details if available
        userAddressRepository.findByUserUserIdAndIsDefaultTrue(user.getUserId()).ifPresent(address -> {
            builder.province(address.getProvince())
                   .district(address.getDistrict())
                   .ward(address.getWard())
                   .addressDetail(address.getAddressDetail());
        });

        return builder.build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile() {
        String phoneNumber = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UserRequest request) {
        String phoneNumber = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("DEBUG: updateProfile Principal Name: " + phoneNumber);
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found: " + phoneNumber));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        // Email update is usually separate and requires verification, skipping for simplicity or allow if not taken
        
        user = userRepository.save(user);

        // Update address
        if (request.getProvince() != null || request.getDistrict() != null || 
            request.getWard() != null || request.getAddressDetail() != null) {
            
            UserAddress address = userAddressRepository.findByUserUserIdAndIsDefaultTrue(user.getUserId())
                    .orElse(UserAddress.builder().user(user).isDefault(true).build());
            
            if (request.getProvince() != null) address.setProvince(request.getProvince());
            if (request.getDistrict() != null) address.setDistrict(request.getDistrict());
            if (request.getWard() != null) address.setWard(request.getWard());
            if (request.getAddressDetail() != null) address.setAddressDetail(request.getAddressDetail());
            
            userAddressRepository.save(address);
        }

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(com.store.e_commerce.dto.request.ChangePasswordRequest request) {
        String phoneNumber = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse updateAvatar(org.springframework.web.multipart.MultipartFile file) {
        String phoneNumber = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            String avatarUrl = fileUploadService.uploadFile(file);
            user.setAvatarUrl(avatarUrl);
            user = userRepository.save(user);
            return mapToResponse(user);
        } catch (Exception e) {
             throw new RuntimeException("Failed to upload avatar: " + e.getMessage());
        }
    }
}
