package com.store.e_commerce.controller;

import com.store.e_commerce.dto.analytics.OrderStatusResponse;
import com.store.e_commerce.dto.analytics.RevenueDataResponse;
import com.store.e_commerce.dto.analytics.StatsSummaryResponse;
import com.store.e_commerce.dto.analytics.TopProductResponse;
import com.store.e_commerce.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<StatsSummaryResponse> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(analyticsService.getStatsSummary(startDate, endDate));
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<List<RevenueDataResponse>> getRevenueChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(analyticsService.getRevenueChartData(startDate, endDate));
    }

    @GetMapping("/top-products")
    public ResponseEntity<Page<TopProductResponse>> getTopProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(analyticsService.getTopSellingProducts(startDate, endDate, pageable));
    }

    @GetMapping("/order-status")
    public ResponseEntity<List<OrderStatusResponse>> getOrderStatusDistribution() {
        return ResponseEntity.ok(analyticsService.getOrderStatusDistribution());
    }
}
