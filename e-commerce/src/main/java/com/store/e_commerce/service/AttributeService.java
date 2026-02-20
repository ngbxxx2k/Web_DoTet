package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.AttributeRequest;
import com.store.e_commerce.dto.response.AttributeResponse;
import java.util.List;

public interface AttributeService {
    List<AttributeResponse> getAllAttributes();
    AttributeResponse createAttribute(AttributeRequest request);
    AttributeResponse updateAttribute(Integer id, AttributeRequest request);
    void deleteAttribute(Integer id);
}
