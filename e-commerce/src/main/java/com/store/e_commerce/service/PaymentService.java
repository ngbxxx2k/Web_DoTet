package com.store.e_commerce.service;

import com.store.e_commerce.dto.response.ResponseVnPayIpn;
import com.store.e_commerce.entity.Order;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {
    String createPaymentUrl(Order order, HttpServletRequest req);
    ResponseVnPayIpn processIpn(Map<String, String> ipnParams);
}
