package com.store.e_commerce.dto.analytics;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class StatsSummaryResponse {
    private BigDecimal totalRevenue;
    private Long newOrders;
    private BigDecimal avgOrderValue;
    private Long totalCustomers;
    private Long totalProducts;
}
