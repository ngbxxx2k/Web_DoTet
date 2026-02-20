package com.store.e_commerce.service;

import com.store.e_commerce.dto.analytics.OrderStatusResponse;
import com.store.e_commerce.dto.analytics.RevenueDataResponse;
import com.store.e_commerce.dto.analytics.StatsSummaryResponse;
import com.store.e_commerce.dto.analytics.TopProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsService {
    StatsSummaryResponse getStatsSummary(LocalDateTime startDate, LocalDateTime endDate);
    List<RevenueDataResponse> getRevenueChartData(LocalDateTime startDate, LocalDateTime endDate);
    Page<TopProductResponse> getTopSellingProducts(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    List<OrderStatusResponse> getOrderStatusDistribution();
}
