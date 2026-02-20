package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.ProductRequest;
import com.store.e_commerce.dto.request.ProductVariantRequest;
import com.store.e_commerce.dto.response.CategoryResponse;
import com.store.e_commerce.dto.response.ProductResponse;
import com.store.e_commerce.dto.response.ProductVariantResponse;
import com.store.e_commerce.entity.*;
import com.store.e_commerce.repository.*;
import com.store.e_commerce.service.FileUploadService;
import com.store.e_commerce.service.ProductService;
import com.store.e_commerce.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final ReviewRepository reviewRepository;
    private final FileUploadService fileUploadService;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile thumbnail, List<MultipartFile> productImages, Map<String, List<MultipartFile>> variantImages) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        String slug = generateSlug(request.getName());

        Product product = Product.builder()
                .title(request.getName())
                .description(request.getDescription())
                .category(category)
                .basePrice(request.getBasePrice())
                .slug(slug)
                .build();
        product.setIsActive(request.getIsActive());
        product.setVendor(request.getVendor());
        
        // Handle thumbnail logic
        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                String thumbUrl = fileUploadService.uploadFile(thumbnail);
                product.setThumbnail(thumbUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload thumbnail", e);
            }
        }
        
        product = productRepository.save(product);

        // Product Images
        handleImages(product, null, request.getImages(), productImages);

        // Variants
        if (request.getVariants() != null) {
            for (ProductVariantRequest variantRequest : request.getVariants()) {
                createVariant(variantRequest, product, variantImages.get(variantRequest.getSku()));
            }
        }

        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Integer id, ProductRequest request, MultipartFile thumbnail, List<MultipartFile> productImages, Map<String, List<MultipartFile>> variantImages) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setTitle(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBasePrice(request.getBasePrice());
        product.setIsActive(request.getIsActive());
        product.setVendor(request.getVendor());
        
        // Update Thumbnail
        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                String thumbUrl = fileUploadService.uploadFile(thumbnail);
                product.setThumbnail(thumbUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload thumbnail", e);
            }
        } else if (request.getThumbnail() == null) {
            // If request thumbnail is null string (deleted), clear it.
            // But usually standard is: if new file exists, replace. If no new file, keep old unless explicitly deleted.
            // In typical FormData, if "thumbnail" is missing, we might assume keep.
            // But let's assume if request.getThumbnail() is null string from JSON, we clear it? 
            // Or usually we don't clear unless explicitly asked. 
            // Let's implement logic: if request.getThumbnail() is passed (the string url), we set it.
            // But MultipartFile takes precedence.
            if (request.getThumbnail() == null) {
                 product.setThumbnail(null);
            }
        }    
        
        // Update basic info
        product = productRepository.save(product);

        // Update Product Images
        handleImages(product, null, request.getImages(), productImages);

        // Update Variants
        // 1. Get existing variants
        List<ProductVariant> existingVariants = variantRepository.findByProduct_ProductId(id);
        List<Integer> keptVariantIds = new ArrayList<>();

        if (request.getVariants() != null) {
            for (ProductVariantRequest vReq : request.getVariants()) {
                if (vReq.getId() != null) {
                    // Update existing
                    updateVariant(vReq, product, variantImages.get(vReq.getSku()));
                    keptVariantIds.add(vReq.getId());
                } else {
                    // Create new
                    createVariant(vReq, product, variantImages.get(vReq.getSku()));
                }
            }
        }

        // 2. Delete removed variants
        for (ProductVariant existing : existingVariants) {
            if (!keptVariantIds.contains(existing.getVariantId())) {
                variantRepository.delete(existing);
            }
        }

        return mapToResponse(product);
    }

    private void createVariant(ProductVariantRequest request, Product product, List<MultipartFile> newImages) {
        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku())
                .price(request.getPrice())
                .stockQuantity(request.getStock())
                .attributeValues(new HashSet<>())
                .build();
        
        saveVariantAttributes(variant, request);
        variant = variantRepository.save(variant);

        handleImages(product, variant, request.getImages(), newImages);
        updateVariantThumbnail(variant);
    }

    private void updateVariant(ProductVariantRequest request, Product product, List<MultipartFile> newImages) {
        ProductVariant variant = variantRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Variant not found: " + request.getId()));
        
        variant.setSku(request.getSku());
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStock());
        
        saveVariantAttributes(variant, request);
        variant = variantRepository.save(variant);

        handleImages(product, variant, request.getImages(), newImages);
        updateVariantThumbnail(variant);
    }
    
    // Logic to sync attributes
    private void saveVariantAttributes(ProductVariant variant, ProductVariantRequest request) {
        variant.getAttributeValues().clear();
        if (request.getSize() != null && !request.getSize().isEmpty()) {
            variant.getAttributeValues().add(getOrCreateAttributeValue("Size", request.getSize()));
        }
        if (request.getColor() != null && !request.getColor().isEmpty()) {
            variant.getAttributeValues().add(getOrCreateAttributeValue("Color", request.getColor()));
        }
    }
    
    private void updateVariantThumbnail(ProductVariant variant) {
        List<ProductImage> images = imageRepository.findByVariant_VariantId(variant.getVariantId());
        if (!images.isEmpty()) {
            variant.setImageUrl(images.get(0).getImageUrl());
        } else {
            variant.setImageUrl(null);
        }
        variantRepository.save(variant);
    }

    private void handleImages(Product product, ProductVariant variant, List<String> keptUrls, List<MultipartFile> newFiles) {
        // 1. Fetch current images for this scope (Product only OR Variant only)
        List<ProductImage> currentImages;
        if (variant == null) {
             currentImages = imageRepository.findByProduct_ProductId(product.getProductId()).stream()
                     .filter(i -> i.getVariant() == null)
                     .collect(Collectors.toList());
        } else {
             currentImages = imageRepository.findByVariant_VariantId(variant.getVariantId());
        }

        List<String> validUrls = keptUrls == null ? new ArrayList<>() : keptUrls;

        // 2. Delete images not in keptUrls
        for (ProductImage img : currentImages) {
            if (!validUrls.contains(img.getImageUrl())) {
                imageRepository.delete(img);
                // Optionally delete from Cloudinary here
            }
        }

        // 3. Add new images
        if (newFiles != null) {
            for (MultipartFile file : newFiles) {
                saveImage(file, product, variant);
            }
        }
    }


    private ProductImage saveImage(MultipartFile file, Product product, ProductVariant variant) {
        try {
            String url = fileUploadService.uploadFile(file);
            return saveImageUrl(url, product, variant);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    private ProductImage saveImageUrl(String url, Product product, ProductVariant variant) {
        ProductImage image = ProductImage.builder()
                .product(product)
                .variant(variant)
                .imageUrl(url)
                .displayOrder(0)
                .build();
        return imageRepository.save(image);
    }

    private AttributeValue getOrCreateAttributeValue(String attributeName, String value) {
        Attribute attribute = attributeRepository.findByAttributeName(attributeName)
                .orElseGet(() -> attributeRepository.save(Attribute.builder().attributeName(attributeName).build()));
        
        return attributeValueRepository.findByAttribute_AttributeIdAndValueName(attribute.getAttributeId(), value)
                .orElseGet(() -> attributeValueRepository.save(AttributeValue.builder()
                        .attribute(attribute)
                        .valueName(value)
                        .build()));
    }

    private String generateSlug(String title) {
        String slug = toSlug(title);
        if (productRepository.existsBySlug(slug)) {
            slug += "-" + System.currentTimeMillis();
        }
        return slug;
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("[\\s]").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    @Override
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(String search, Integer categoryId, Boolean isActive, BigDecimal minPrice, BigDecimal maxPrice, List<String> attributeValues, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.getSpecifications(search, categoryId, isActive, minPrice, maxPrice, attributeValues);
        Page<Product> products = productRepository.findAll(spec, pageable);
        return products.map(this::mapToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals(int limit) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit, org.springframework.data.domain.Sort.by("createdAt").descending());
        return productRepository.findByIsActiveTrue(pageable).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getBestSellers(int limit) {
        // For now, return newest products. Can enhance with sales tracking later.
        Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit, org.springframework.data.domain.Sort.by("createdAt").descending());
        return productRepository.findByIsActiveTrue(pageable).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse mapToResponse(Product product) {
        CategoryResponse catResp = new CategoryResponse();
        if (product.getCategory() != null) {
            catResp.setId(product.getCategory().getCategoryId());
            catResp.setTitle(product.getCategory().getTitle());
            catResp.setCategoryName(product.getCategory().getTitle()); // Alias for frontend
        }

        List<ProductImage> pImages = imageRepository.findByProduct_ProductId(product.getProductId());
        
        List<String> productImageUrlList = pImages.stream()
                .filter(img -> img.getVariant() == null)
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());

        List<ProductVariant> variants = variantRepository.findByProduct_ProductId(product.getProductId());
        List<ProductVariantResponse> variantResponses = variants.stream().map(v -> {
            
            String size = v.getAttributeValues().stream()
                    .filter(av -> "Size".equalsIgnoreCase(av.getAttribute().getAttributeName()))
                    .map(AttributeValue::getValueName).findFirst().orElse(null);
            
            String color = v.getAttributeValues().stream()
                    .filter(av -> "Color".equalsIgnoreCase(av.getAttribute().getAttributeName()))
                    .map(AttributeValue::getValueName).findFirst().orElse(null);
            
            List<String> vImgUrls = pImages.stream()
                    .filter(img -> img.getVariant() != null && img.getVariant().getVariantId().equals(v.getVariantId()))
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());

            // Build attribute list for order form
            List<ProductVariantResponse.AttributeInfo> attrInfoList = v.getAttributeValues().stream()
                    .map(av -> ProductVariantResponse.AttributeInfo.builder()
                            .name(av.getAttribute().getAttributeName())
                            .value(av.getValueName())
                            .build())
                    .collect(Collectors.toList());

            return ProductVariantResponse.builder()
                    .id(v.getVariantId())
                    .sku(v.getSku())
                    .price(v.getPrice())
                    .stock(v.getStockQuantity())
                    .stockQuantity(v.getStockQuantity())
                    .size(size)
                    .color(color)
                    .imageUrl(v.getImageUrl())
                    .images(vImgUrls)
                    .attributes(attrInfoList)
                    .build();

        }).collect(Collectors.toList());

        int totalStock = variantResponses.stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();
        String stockStatus = totalStock > 0 ? "In Stock" : "Out of Stock";

        return ProductResponse.builder()
                .id(product.getProductId())
                .title(product.getTitle())
                .productName(product.getTitle()) // Alias for frontend
                .slug(product.getSlug())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .thumbnail(product.getThumbnail())
                .isActive(product.getIsActive())
                .vendor(product.getVendor())
                .category(catResp)
                .categoryName(product.getCategory() != null ? product.getCategory().getTitle() : null)
                .images(productImageUrlList)
                .variants(variantResponses)
                .rating(reviewRepository.getAverageRatingByProductId(product.getProductId()) != null ? reviewRepository.getAverageRatingByProductId(product.getProductId()) : 0.0)
                .reviews(reviewRepository.countTotalApprovedReviewsByProductId(product.getProductId()))
                .totalStock(totalStock)
                .stockStatus(stockStatus)
                .build();

    }
}
