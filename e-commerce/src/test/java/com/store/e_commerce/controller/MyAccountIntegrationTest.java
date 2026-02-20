package com.store.e_commerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.e_commerce.dto.request.ChangePasswordRequest;
import com.store.e_commerce.dto.request.UserRequest;
import com.store.e_commerce.dto.response.OrderResponse;
import com.store.e_commerce.dto.response.UserResponse;
import com.store.e_commerce.service.OrderService;
import com.store.e_commerce.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MyAccountIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "testuser@example.com", roles = "USER")
    public void testGetProfile() throws Exception {
        UserResponse mockResponse = new UserResponse();
        mockResponse.setEmail("testuser@example.com");
        mockResponse.setFullName("Test User");

        when(userService.getProfile()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = "USER")
    public void testUpdateProfile() throws Exception {
        UserRequest request = new UserRequest();
        request.setFullName("Updated Name");

        UserResponse mockResponse = new UserResponse();
        mockResponse.setFullName("Updated Name");

        when(userService.updateProfile(any(UserRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/users/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = "USER")
    public void testChangePassword() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPass");
        request.setNewPassword("newPass");

        doNothing().when(userService).changePassword(any(ChangePasswordRequest.class));

        mockMvc.perform(put("/api/users/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = "USER")
    public void testUpdateAvatar() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "avatar.png", 
                "image/png", 
                "test-image-content".getBytes()
        );

        UserResponse mockResponse = new UserResponse();
        mockResponse.setAvatarUrl("http://example.com/avatar.png");

        when(userService.updateAvatar(any())).thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/users/avatar")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("http://example.com/avatar.png"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = "USER")
    public void testGetMyOrders() throws Exception {
        OrderResponse order = new OrderResponse();
        order.setOrderCode("ORD-123");
        List<OrderResponse> orders = Collections.singletonList(order);

        when(orderService.getMyOrders()).thenReturn(orders);

        mockMvc.perform(get("/api/orders/my-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderCode").value("ORD-123"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = "USER")
    public void testCancelOrder() throws Exception {
        Integer orderId = 123;
        doNothing().when(orderService).cancelOrder(eq(orderId));

        mockMvc.perform(put("/api/orders/{id}/cancel", orderId))
                .andExpect(status().isOk());
    }
}
