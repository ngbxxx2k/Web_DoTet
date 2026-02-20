package com.store.e_commerce.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private Integer customerId; // Optional, can be null for guest orders
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String shippingAddress;
    private BigDecimal shippingFee;
    private Integer status; // 0=Pending, 1=Confirmed, etc.
    private Integer paymentStatus; // 0=Unpaid, 1=Paid, etc.
    private Integer paymentMethod; // 0=COD, 1=Banking
    private String note;
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Integer productVariantId;
        private Integer quantity;
    }
}
