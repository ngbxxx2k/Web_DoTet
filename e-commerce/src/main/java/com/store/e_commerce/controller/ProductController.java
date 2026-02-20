package com.store.e_commerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.e_commerce.dto.request.ProductRequest;
import com.store.e_commerce.dto.response.ProductResponse;
import com.store.e_commerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
            @RequestParam("data") String productRequestJson,
            MultipartHttpServletRequest request) throws IOException {

        ProductRequest productRequest = objectMapper.readValue(productRequestJson, ProductRequest.class);
        List<MultipartFile> productImages = request.getFiles("product_new_images[]");
        MultipartFile thumbnail = request.getFile("thumbnail");
        Map<String, List<MultipartFile>> variantImages = extractVariantImages(request);

        ProductResponse response = productService.createProduct(productRequest, thumbnail, productImages, variantImages);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Integer id,
            @RequestParam("data") String productRequestJson,
            MultipartHttpServletRequest request) throws IOException {

        ProductRequest productRequest = objectMapper.readValue(productRequestJson, ProductRequest.class);
        List<MultipartFile> productImages = request.getFiles("product_new_images[]");
        MultipartFile thumbnail = request.getFile("thumbnail");
        Map<String, List<MultipartFile>> variantImages = extractVariantImages(request);

        ProductResponse response = productService.updateProduct(id, productRequest, thumbnail, productImages, variantImages);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> attributeValues,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(productService.getAllProducts(search, categoryId, isActive, minPrice, maxPrice, attributeValues, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/new-arrivals")
    public ResponseEntity<List<ProductResponse>> getNewArrivals(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getNewArrivals(limit));
    }
    
    @GetMapping("/best-sellers")
    public ResponseEntity<List<ProductResponse>> getBestSellers(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getBestSellers(limit));
    }
    
    private Map<String, List<MultipartFile>> extractVariantImages(MultipartHttpServletRequest request) {
        Map<String, List<MultipartFile>> variantImages = new HashMap<>();
        request.getFileMap().forEach((key, file) -> {
            if (key.startsWith("variant_new_images_")) {
                String temp = key.substring("variant_new_images_".length());
                if (temp.endsWith("[]")) {
                    temp = temp.substring(0, temp.length() - 2);
                }
                String sku = temp;
                List<MultipartFile> files = request.getFiles(key);
                variantImages.put(sku, files);
            }
        });
        return variantImages;
    }
}
