package com.store.e_commerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotNull(message = "Product Variant ID is required")
    private Integer productVariantId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
