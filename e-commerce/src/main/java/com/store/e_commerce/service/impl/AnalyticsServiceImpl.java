package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.analytics.OrderStatusResponse;
import com.store.e_commerce.dto.analytics.RevenueDataResponse;
import com.store.e_commerce.dto.analytics.StatsSummaryResponse;
import com.store.e_commerce.dto.analytics.TopProductResponse;
import com.store.e_commerce.entity.Order;
import com.store.e_commerce.repository.OrderItemRepository;
import com.store.e_commerce.repository.OrderRepository;
import com.store.e_commerce.repository.UserRepository;
import com.store.e_commerce.repository.ProductRepository;
import com.store.e_commerce.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository; // Added

    private static final String[] STATUS_TEXTS = {"Pending", "Confirmed", "Shipping", "Completed", "Cancelled", "Returned"};
    private static final String[] STATUS_COLORS = {"#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#64748b"}; // Pending, Confirmed, Shipping, Success, Danger, Slate

    @Override
    public StatsSummaryResponse getStatsSummary(LocalDateTime startDate, LocalDateTime endDate) {
        Long totalOrders = orderRepository.countOrdersInRange(startDate, endDate);
        BigDecimal totalRevenue = orderRepository.sumRevenueInRange(startDate, endDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (totalOrders != null && totalOrders > 0) {
            avgOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }

        Long totalCustomers = userRepository.countCustomers();
        Long totalProducts = productRepository.countByIsActiveTrue();

        return StatsSummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .newOrders(totalOrders)
                .avgOrderValue(avgOrderValue)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .build();
    }

    @Override
    public List<RevenueDataResponse> getRevenueChartData(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findPaidOrdersInRange(startDate, endDate);
        
        Map<String, BigDecimal> dailyMap = new TreeMap<>(); // Use TreeMap to keep dates sorted
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Order order : orders) {
            String date = order.getCreatedAt().format(formatter);
            dailyMap.put(date, dailyMap.getOrDefault(date, BigDecimal.ZERO).add(order.getFinalAmount()));
        }

        List<RevenueDataResponse> result = new ArrayList<>();
        dailyMap.forEach((date, amount) -> result.add(new RevenueDataResponse(date, amount)));
        
        return result;
    }

    @Override
    public Page<TopProductResponse> getTopSellingProducts(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<Object[]> results = orderItemRepository.getTopSellingProducts(startDate, endDate, pageable);
        return results.map(row -> new TopProductResponse(
                (String) row[0],
                ((Number) row[1]).longValue(),
                (BigDecimal) row[2],
                (String) row[3]
        ));
    }

    @Override
    public List<OrderStatusResponse> getOrderStatusDistribution() {
        List<Object[]> results = orderRepository.countOrdersByStatus();
        List<OrderStatusResponse> distribution = new ArrayList<>();
        
        for (Object[] row : results) {
            Integer status = (Integer) row[0];
            Long count = (Long) row[1];
            if (status != null && status >= 0 && status < STATUS_TEXTS.length) {
                distribution.add(new OrderStatusResponse(STATUS_TEXTS[status], count, STATUS_COLORS[status]));
            }
        }
        
        return distribution;
    }
}
