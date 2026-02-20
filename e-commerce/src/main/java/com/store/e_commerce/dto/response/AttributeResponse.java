package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AttributeResponse {
    private Integer id;
    private String name;
    private List<AttributeValueResponse> values;
}
