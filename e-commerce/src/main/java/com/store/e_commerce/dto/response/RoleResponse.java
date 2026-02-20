package com.store.e_commerce.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleResponse {
    private Integer id;
    private String roleCode;
    private String roleName;
}
