package com.store.e_commerce.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductResponse {
    private String productName;
    private Long quantitySold;
    private BigDecimal totalRevenue;
    private String productImage;
}
