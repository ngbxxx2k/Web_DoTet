package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class OrderResponse {
    private Integer id;
    private String orderCode;
    
    // Customer Info
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAvatar;
    
    // Shipping
    private String shippingAddress;
    private BigDecimal shippingFee;
    
    // Amounts
    private BigDecimal totalAmount;
    private BigDecimal finalAmount;
    
    // Status
    private Integer status;
    private String statusText;
    private Integer paymentStatus;
    private String paymentStatusText;
    private Integer paymentMethod;
    private String paymentMethodText;
    
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Order Items
    private List<OrderItemResponse> items;
    private int itemCount;
    
    @Data
    @Builder
    public static class OrderItemResponse {
        private Integer id;
        private Integer productVariantId;
        private Integer productId;
        private String productName;
        private String variantName;
        private String productImage;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
