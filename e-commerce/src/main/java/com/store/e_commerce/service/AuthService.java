package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.LoginRequest;
import com.store.e_commerce.dto.request.RegisterRequest;
import com.store.e_commerce.dto.request.ForgotPasswordRequest;
import com.store.e_commerce.entity.User;

public interface AuthService {
    User register(RegisterRequest request);
    User login(LoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    User getCurrentUser();
}
