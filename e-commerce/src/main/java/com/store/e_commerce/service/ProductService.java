package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.ProductRequest;
import com.store.e_commerce.dto.response.ProductResponse;
import com.store.e_commerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request, MultipartFile thumbnail, List<MultipartFile> productImages, Map<String, List<MultipartFile>> variantImages);
    ProductResponse updateProduct(Integer id, ProductRequest request, MultipartFile thumbnail, List<MultipartFile> productImages, Map<String, List<MultipartFile>> variantImages);
    ProductResponse getProductById(Integer id);
    void deleteProduct(Integer id);
    Page<ProductResponse> getAllProducts(String search, Integer categoryId, Boolean isActive, BigDecimal minPrice, BigDecimal maxPrice, List<String> attributeValues, Pageable pageable);
    List<ProductResponse> getNewArrivals(int limit);
    List<ProductResponse> getBestSellers(int limit);
}
