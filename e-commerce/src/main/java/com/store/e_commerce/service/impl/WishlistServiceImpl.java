package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.response.WishlistItemResponse;
import com.store.e_commerce.entity.Product;
import com.store.e_commerce.entity.ProductVariant;
import com.store.e_commerce.entity.User;
import com.store.e_commerce.entity.Wishlist;
import com.store.e_commerce.repository.ProductRepository;
import com.store.e_commerce.repository.ProductVariantRepository;
import com.store.e_commerce.repository.UserRepository;
import com.store.e_commerce.repository.WishlistRepository;
import com.store.e_commerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlistByUserId(Integer userId) {
        List<Wishlist> items = wishlistRepository.findByUser_UserIdAndIsActiveTrue(userId);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WishlistItemResponse addToWishlist(Integer userId, Integer productId) {
        // Check if already exists
        if (wishlistRepository.existsByUser_UserIdAndProduct_ProductId(userId, productId)) {
            Wishlist existing = wishlistRepository.findByUser_UserIdAndProduct_ProductId(userId, productId)
                    .orElseThrow();
            return mapToResponse(existing);
        }

        if (userId == null || productId == null) {
            throw new IllegalArgumentException("User ID and Product ID must not be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        wishlist.setIsActive(true);

        Wishlist saved = wishlistRepository.save(wishlist);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Integer userId, Integer productId) {
        wishlistRepository.deleteByUser_UserIdAndProduct_ProductId(userId, productId);
    }

    @Override
    @Transactional
    public void clearWishlist(Integer userId) {
        wishlistRepository.deleteByUser_UserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isProductInWishlist(Integer userId, Integer productId) {
        return wishlistRepository.existsByUser_UserIdAndProduct_ProductId(userId, productId);
    }

    private WishlistItemResponse mapToResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        
        // Get min price from variants
        List<ProductVariant> variants = productVariantRepository.findByProduct_ProductId(product.getProductId());
        BigDecimal discountedPrice = product.getBasePrice();
        if (!variants.isEmpty()) {
            discountedPrice = variants.stream()
                    .map(ProductVariant::getPrice)
                    .min(BigDecimal::compareTo)
                    .orElse(product.getBasePrice());
        }

        // Calculate stock status
        int totalStock = variants.stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();
        String status = totalStock > 0 ? "In Stock" : "Out of Stock";

        return WishlistItemResponse.builder()
                .wishlistId(wishlist.getWishlistId())
                .productId(product.getProductId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .basePrice(product.getBasePrice())
                .discountedPrice(discountedPrice)
                .thumbnail(product.getThumbnail())
                .status(status)
                .addedAt(wishlist.getCreatedAt())
                .build();
    }
}
