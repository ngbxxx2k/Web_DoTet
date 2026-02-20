package com.store.e_commerce.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class AttributeRequest {
    private String attributeName;
    private List<AttributeValueRequest> values;
}
