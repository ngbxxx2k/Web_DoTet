package com.store.e_commerce.controller;

import com.store.e_commerce.dto.response.ResponseVnPayIpn;
import com.store.e_commerce.entity.Order;
import com.store.e_commerce.repository.OrderRepository;
import com.store.e_commerce.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    @GetMapping("/vnpay-create-url")
    public ResponseEntity<String> createPaymentUrl(
            @RequestParam Integer orderId,
            HttpServletRequest request
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        String url = paymentService.createPaymentUrl(order, request);
        return ResponseEntity.ok(url);
    }

    @GetMapping("/vnpay-ipn")
    public ResponseVnPayIpn paymentCallback(@RequestParam Map<String, String> params) {
        log.info("VNPAY IPN received: {}", params);
        return paymentService.processIpn(params);
    }

    // Optional: Return URL handler if needed for debugging or server-side rendering
    @GetMapping("/vnpay-return")
    public ResponseEntity<String> paymentReturn(@RequestParam Map<String, String> params) {
        log.info("VNPAY Return received: {}", params);
        // In a headless implementation, the frontend usually handles the return URL directly 
        // by parsing query params. This endpoint might not be strictly necessary 
        // if the redirect goes to the frontend URL.
        // However, if VNPAY requires a backend return URL, this would redirect to frontend.
        return ResponseEntity.ok("Payment processed. check frontend.");
    }
}
