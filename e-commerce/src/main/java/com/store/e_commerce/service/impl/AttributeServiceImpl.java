package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.AttributeRequest;
import com.store.e_commerce.dto.request.AttributeValueRequest;
import com.store.e_commerce.dto.response.AttributeResponse;
import com.store.e_commerce.dto.response.AttributeValueResponse;
import com.store.e_commerce.entity.Attribute;
import com.store.e_commerce.entity.AttributeValue;
import com.store.e_commerce.repository.AttributeRepository;
import com.store.e_commerce.repository.AttributeValueRepository;
import com.store.e_commerce.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttributeServiceImpl implements AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;

    @Override
    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttributeResponse createAttribute(AttributeRequest request) {
        Attribute attribute = attributeRepository.save(
            Attribute.builder().attributeName(request.getAttributeName()).build()
        );

        if (request.getValues() != null) {
            for (AttributeValueRequest valReq : request.getValues()) {
                AttributeValue av = AttributeValue.builder()
                        .attribute(attribute)
                        .valueName(valReq.getValueName())
                        .colorCode(valReq.getColorCode())
                        .build();
                attributeValueRepository.save(av);
            }
        }

        return mapToResponse(attribute);
    }

    @Override
    @Transactional
    public AttributeResponse updateAttribute(Integer id, AttributeRequest request) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));

        attribute.setAttributeName(request.getAttributeName());
        attribute = attributeRepository.save(attribute);

        // Handle Values
        // Simple strategy: if request values are provided, update them.
        // For simplicity: delete removed, update existing, add new?
        // Or just appending for now? 
        // Let's implement full sync logic similar to products/variants but simpler.
        
        if (request.getValues() != null) {
            List<AttributeValue> existingValues = attributeValueRepository.findByAttribute_AttributeId(id)
                    .orElse(new ArrayList<>());
            List<Integer> keptIds = new ArrayList<>();

            for (AttributeValueRequest valReq : request.getValues()) {
                if (valReq.getId() != null) {
                    // Update
                    AttributeValue val = attributeValueRepository.findById(valReq.getId())
                            .orElse(null);
                    if (val != null) {
                        val.setValueName(valReq.getValueName());
                        val.setColorCode(valReq.getColorCode());
                        attributeValueRepository.save(val);
                        keptIds.add(val.getValueId());
                    }
                } else {
                    // Create
                    AttributeValue val = AttributeValue.builder()
                            .attribute(attribute)
                            .valueName(valReq.getValueName())
                            .colorCode(valReq.getColorCode())
                            .build();
                    val = attributeValueRepository.save(val);
                    keptIds.add(val.getValueId());
                }
            }
            
            // Delete removed
            for (AttributeValue existing : existingValues) {
                if (!keptIds.contains(existing.getValueId())) {
                    attributeValueRepository.delete(existing);
                }
            }
        }

        return mapToResponse(attribute);
    }

    @Override
    @Transactional
    public void deleteAttribute(Integer id) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));
        // Values usually cascade deleted by DB foreign key or we delete manually
        // Assuming cascade or manual:
        List<AttributeValue> values = attributeValueRepository.findByAttribute_AttributeId(id).orElse(new ArrayList<>());
        attributeValueRepository.deleteAll(values);
        
        attributeRepository.delete(attribute);
    }

    private AttributeResponse mapToResponse(Attribute attribute) {
        List<AttributeValue> values = attributeValueRepository.findByAttribute_AttributeId(attribute.getAttributeId())
                .orElse(new ArrayList<>());
        
        List<AttributeValueResponse> valueResponses = values.stream()
                .map(v -> AttributeValueResponse.builder()
                        .id(v.getValueId())
                        .value(v.getValueName())
                        .colorCode(v.getColorCode())
                        .build())
                .collect(Collectors.toList());

        return AttributeResponse.builder()
                .id(attribute.getAttributeId())
                .name(attribute.getAttributeName())
                .values(valueResponses)
                .build();
    }
}
