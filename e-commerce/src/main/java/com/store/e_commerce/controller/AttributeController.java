package com.store.e_commerce.controller;

import com.store.e_commerce.dto.request.AttributeRequest;
import com.store.e_commerce.dto.response.AttributeResponse;
import com.store.e_commerce.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attributes")
@RequiredArgsConstructor
public class AttributeController {

    private final AttributeService attributeService;

    @GetMapping
    public ResponseEntity<List<AttributeResponse>> getAllAttributes() {
        return ResponseEntity.ok(attributeService.getAllAttributes());
    }

    @PostMapping
    public ResponseEntity<AttributeResponse> createAttribute(@RequestBody AttributeRequest request) {
        return new ResponseEntity<>(attributeService.createAttribute(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttributeResponse> updateAttribute(@PathVariable Integer id, @RequestBody AttributeRequest request) {
        return ResponseEntity.ok(attributeService.updateAttribute(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttribute(@PathVariable Integer id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.noContent().build();
    }
}
