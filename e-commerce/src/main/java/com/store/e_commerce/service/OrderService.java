package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.OrderRequest;
import com.store.e_commerce.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

import java.time.LocalDateTime;

public interface OrderService {
    Page<OrderResponse> getAllOrders(String search, Integer status, Integer paymentStatus, Integer paymentMethod, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    OrderResponse getOrderById(Integer id);
    OrderResponse createOrder(OrderRequest request);
    OrderResponse updateOrder(Integer id, OrderRequest request);
    void deleteOrder(Integer id);
    OrderResponse updateOrderStatus(Integer id, Integer status);
    OrderResponse updatePaymentStatus(Integer id, Integer paymentStatus);
    Map<String, Object> getOrderStats();
    boolean checkPurchased(Integer productId);
    
    // User Order Management
    java.util.List<OrderResponse> getMyOrders();
    void cancelOrder(Integer orderId);
}
