package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.OrderRequest;
import com.store.e_commerce.dto.response.OrderResponse;
import com.store.e_commerce.entity.*;
import com.store.e_commerce.repository.*;
import com.store.e_commerce.service.OrderService;
import com.store.e_commerce.specification.OrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;

    private static final String[] STATUS_TEXTS = {"PENDING", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED", "RETURNED"};
    private static final String[] PAYMENT_STATUS_TEXTS = {"Unpaid", "Paid", "Refunded"};
    private static final String[] PAYMENT_METHOD_TEXTS = {"COD", "Banking"};

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(String search, Integer status, Integer paymentStatus, Integer paymentMethod, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Specification<Order> spec = OrderSpecification.getSpecifications(search, status, paymentStatus, paymentMethod, startDate, endDate);
        return orderRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));
        return mapToResponseWithItems(order);
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        String orderCode = generateOrderCode();

        User customer = null;
        if (request.getCustomerId() != null) {
            customer = userRepository.findById(request.getCustomerId()).orElse(null);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        if (request.getItems() != null) {
            for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                ProductVariant variant = productVariantRepository.findById(itemRequest.getProductVariantId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm: " + itemRequest.getProductVariantId()));
                
                if (variant.getStockQuantity() < itemRequest.getQuantity()) {
                    throw new RuntimeException("Sản phẩm đã hết hàng hoặc không đủ số lượng cho biến thể: " + variant.getSku());
                }

                variant.setStockQuantity(variant.getStockQuantity() - itemRequest.getQuantity());
                productVariantRepository.save(variant);

                BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
                totalAmount = totalAmount.add(itemTotal);

                OrderItem orderItem = OrderItem.builder()
                        .productVariant(variant)
                        .productName(variant.getProduct().getTitle())
                        .variantName(buildVariantName(variant))
                        .quantity(itemRequest.getQuantity())
                        .unitPrice(variant.getPrice())
                        .totalPrice(itemTotal)
                        .build();
                orderItems.add(orderItem);
            }
        }

        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.add(shippingFee);

        Order order = Order.builder()
                .orderCode(orderCode)
                .customer(customer)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone().replaceAll("[\\s\\-]", "") : null)
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .finalAmount(finalAmount)
                .status(request.getStatus() != null ? request.getStatus() : 0)
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : 0)
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            savedOrder.getItems().add(item);
        }
        
        return mapToResponseWithItems(orderRepository.save(savedOrder));
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Integer id, OrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));

        // 1. Restore stock of current items
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getProductVariant();
                if (variant != null) {
                    variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                    productVariantRepository.save(variant);
                }
            }
            // 2. Clear current items collection to trigger orphan removal
            order.getItems().clear();
            orderRepository.saveAndFlush(order);
        }

        // 3. Update customer info & basic fields
        if (request.getCustomerId() != null) {
            User customer = userRepository.findById(request.getCustomerId()).orElse(null);
            order.setCustomer(customer);
        }

        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone().replaceAll("[\\s\\-]", "") : null);
        order.setCustomerEmail(request.getCustomerEmail());
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());
        order.setShippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO);
        
        if (request.getStatus() != null) order.setStatus(request.getStatus());
        if (request.getPaymentStatus() != null) order.setPaymentStatus(request.getPaymentStatus());
        if (request.getPaymentMethod() != null) order.setPaymentMethod(request.getPaymentMethod());

        // 4. Process new items
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (request.getItems() != null) {
            if (order.getItems() == null) order.setItems(new ArrayList<>());
            
            for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                ProductVariant variant = productVariantRepository.findById(itemRequest.getProductVariantId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));
                
                if (variant.getStockQuantity() < itemRequest.getQuantity()) {
                    throw new RuntimeException("Sản phẩm đã hết hàng hoặc không đủ số lượng cho biến thể: " + variant.getSku());
                }

                variant.setStockQuantity(variant.getStockQuantity() - itemRequest.getQuantity());
                productVariantRepository.save(variant);

                BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
                totalAmount = totalAmount.add(itemTotal);

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .productVariant(variant)
                        .productName(variant.getProduct().getTitle())
                        .variantName(buildVariantName(variant))
                        .quantity(itemRequest.getQuantity())
                        .unitPrice(variant.getPrice())
                        .totalPrice(itemTotal)
                        .build();
                order.getItems().add(orderItem);
            }
        }

        order.setTotalAmount(totalAmount);
        order.setFinalAmount(totalAmount.add(order.getShippingFee()));

        return mapToResponseWithItems(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void deleteOrder(Integer id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null && order.getIsActive()) {
            // Restore stock if not Cancelled
            if (order.getStatus() != 4 && order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    ProductVariant variant = item.getProductVariant();
                    if (variant != null) {
                        variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                        productVariantRepository.save(variant);
                    }
                }
            }
            // Soft delete
            order.setIsActive(false);
            order.setDeletedAt(LocalDateTime.now());
            orderRepository.save(order);
        }
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Integer id, Integer status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));
        
        if (!order.getIsActive()) {
            throw new RuntimeException("Không thể cập nhật trạng thái đơn hàng đã bị xóa");
        }

        Integer oldStatus = order.getStatus();
        order.setStatus(status);

        if (oldStatus != 4 && status == 4) { // Active to Cancelled
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    ProductVariant variant = item.getProductVariant();
                    if (variant != null) {
                        variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                        productVariantRepository.save(variant);
                    }
                }
            }
        }
        return mapToResponseWithItems(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updatePaymentStatus(Integer id, Integer paymentStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));
        
        if (!order.getIsActive()) {
            throw new RuntimeException("Không thể cập nhật trạng thái thanh toán đơn hàng đã bị xóa");
        }

        order.setPaymentStatus(paymentStatus);
        return mapToResponseWithItems(orderRepository.save(order));
    }

    @Override
    public Map<String, Object> getOrderStats() {
        long total = orderRepository.count((root, query, cb) -> cb.equal(root.get("isActive"), true));
        long pending = orderRepository.count((root, query, cb) -> 
            cb.and(cb.equal(root.get("isActive"), true), cb.equal(root.get("status"), 0)));
        long completed = orderRepository.count((root, query, cb) -> 
            cb.and(cb.equal(root.get("isActive"), true), cb.equal(root.get("status"), 3)));
        long cancelled = orderRepository.count((root, query, cb) -> 
            cb.and(cb.equal(root.get("isActive"), true), cb.equal(root.get("status"), 4)));
        
        // Calculate Revenue (Sum of finalAmount where paymentStatus is Paid (1))
        BigDecimal totalRevenue = orderRepository.findAll((root, query, cb) -> 
            cb.and(cb.equal(root.get("isActive"), true), cb.equal(root.get("paymentStatus"), 1))
        ).stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Daily Revenue
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        BigDecimal todayRevenue = orderRepository.findAll((root, query, cb) -> 
            cb.and(
                cb.equal(root.get("isActive"), true),
                cb.equal(root.get("paymentStatus"), 1),
                cb.greaterThanOrEqualTo(root.get("createdAt"), todayStart)
            )
        ).stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("completed", completed);
        stats.put("cancelled", cancelled);
        stats.put("totalRevenue", totalRevenue);
        stats.put("todayRevenue", todayRevenue);
        return stats;
    }

    @Override
    public boolean checkPurchased(Integer productId) {
        String phone = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (phone == null || "anonymousUser".equals(phone)) {
            return false;
        }
        return orderRepository.existsByCustomerPhoneAndProductIdAndStatusCompleted(phone, productId);
    }

    private String generateOrderCode() {
        String prefix = "ORD";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return prefix + dateStr + random;
    }

    private String buildVariantName(ProductVariant variant) {
        if (variant.getAttributeValues() == null || variant.getAttributeValues().isEmpty()) {
            return "";
        }
        return variant.getAttributeValues().stream()
                .map(av -> av.getAttribute().getAttributeName() + ": " + av.getValueName())
                .collect(Collectors.joining(", "));
    }

    private OrderResponse mapToResponse(Order order) {
        // Just use the entity if items are already loaded, or default to 0
        int count = order.getItems() != null ? order.getItems().size() : 0;
        
        return OrderResponse.builder()
                .id(order.getOrderId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomer() != null ? order.getCustomer().getUserId() : null)
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerEmail(order.getCustomerEmail())
                .customerAvatar(order.getCustomer() != null ? order.getCustomer().getAvatarUrl() : null)
                .shippingAddress(order.getShippingAddress())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .statusText(getStatusText(order.getStatus()))
                .paymentStatus(order.getPaymentStatus())
                .paymentStatusText(getPaymentStatusText(order.getPaymentStatus()))
                .paymentMethod(order.getPaymentMethod())
                .paymentMethodText(getPaymentMethodText(order.getPaymentMethod()))
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .itemCount(count)
                .build();
    }

    private OrderResponse mapToResponseWithItems(Order order) {
        List<OrderItem> items = order.getItems() != null ? order.getItems() : new ArrayList<>();
        
        List<OrderResponse.OrderItemResponse> itemResponses = items.stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getOrderItemId())
                        .productVariantId(item.getProductVariant() != null ? item.getProductVariant().getVariantId() : null)
                        .productId(item.getProductVariant() != null && item.getProductVariant().getProduct() != null ? item.getProductVariant().getProduct().getProductId() : null)
                        .productName(item.getProductName())
                        .variantName(item.getVariantName())
                        .productImage(item.getProductVariant() != null && item.getProductVariant().getImageUrl() != null 
                                ? item.getProductVariant().getImageUrl() 
                                : (item.getProductVariant() != null && item.getProductVariant().getProduct() != null ? item.getProductVariant().getProduct().getThumbnail() : null))
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        OrderResponse response = mapToResponse(order);
        response.setItems(itemResponses);
        return response;
    }

    private String getStatusText(Integer status) {
        if (status == null || status < 0 || status >= STATUS_TEXTS.length) return "Unknown";
        return STATUS_TEXTS[status];
    }

    private String getPaymentStatusText(Integer paymentStatus) {
        if (paymentStatus == null || paymentStatus < 0 || paymentStatus >= PAYMENT_STATUS_TEXTS.length) return "Unknown";
        return PAYMENT_STATUS_TEXTS[paymentStatus];
    }

    private String getPaymentMethodText(Integer paymentMethod) {
        if (paymentMethod == null || paymentMethod < 0 || paymentMethod >= PAYMENT_METHOD_TEXTS.length) return "Unknown";
        return PAYMENT_METHOD_TEXTS[paymentMethod];
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        String phoneNumber = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("DEBUG: getMyOrders Principal Name: " + phoneNumber);
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + phoneNumber));
        
        List<Order> orders = orderRepository.findByCustomer_UserIdOrderByCreatedAtDesc(user.getUserId());
        return orders.stream().map(this::mapToResponseWithItems).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelOrder(Integer orderId) {
        String phoneNumber = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        // Only allow cancel if pending (0) or confirmed/processing (1) - frontend said "Pending or Processing"
        // Backend Status: 0=Pending, 1=Confirmed, 2=Shipping, 3=Completed, 4=Cancelled, 5=Returned
        // Assuming "Processing" maps to Confirmed (1).
        if (order.getStatus() != 0 && order.getStatus() != 1) {
             throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái hiện tại");
        }

        order.setStatus(4); // Cancelled

        // Restore stock
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getProductVariant();
                if (variant != null) {
                    variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                    productVariantRepository.save(variant);
                }
            }
        }
        
        orderRepository.save(order);
    }
}
