package com.store.e_commerce.dto.request;

import lombok.Data;

@Data
public class AttributeValueRequest {
    private Integer id; // Optional for new values
    private String valueName;
    private String colorCode;
}
