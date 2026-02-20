package com.store.e_commerce.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusResponse {
    private String status;
    private Long count;
    private String color;
}
