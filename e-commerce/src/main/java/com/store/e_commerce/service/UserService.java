package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.UserRequest;
import com.store.e_commerce.dto.response.UserResponse;
import com.store.e_commerce.dto.response.RoleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    Page<UserResponse> getAllUsers(String search, Integer roleId, Boolean isActive, Pageable pageable);
    UserResponse getUserById(Integer id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(Integer id, UserRequest request);
    void deleteUser(Integer id);
    UserResponse toggleUserStatus(Integer id);
    List<RoleResponse> getAllRoles();
    
    // Stats
    long getTotalUsers();
    long getActiveUsers();
    long getBlockedUsers();

    // Profile Management
    UserResponse getProfile();
    UserResponse updateProfile(UserRequest request);
    void changePassword(com.store.e_commerce.dto.request.ChangePasswordRequest request);
    UserResponse updateAvatar(org.springframework.web.multipart.MultipartFile file);
}
