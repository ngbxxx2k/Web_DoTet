package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttributeValueResponse {
    private Integer id;
    private String value;
    private String colorCode;
}
