package com.store.e_commerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "order_code", nullable = false, unique = true, length = 20)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    @ToString.Exclude
    private User customer;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "shipping_fee",  precision = 15, scale = 2, columnDefinition = "decimal(15,2) default 0")
    private BigDecimal shippingFee;

    @Column(name = "final_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal finalAmount;

    @Column(columnDefinition = "int default 0")
    private Integer status; // 0=Pending, 1=Confirmed, 2=Shipping, 3=Completed, 4=Cancelled, 5=Returned

    @Column(name = "payment_status", columnDefinition = "int default 0")
    private Integer paymentStatus; // 0=Unpaid, 1=Paid, 2=Refunded

    @Column(name = "payment_method")
    private Integer paymentMethod; // 0=COD, 1=Banking

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<OrderItem> items;

    @Column(name = "vnpay_txn_ref")
    private String vnPayTxnRef;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "paid_at")
    private java.time.LocalDateTime paidAt;
}
