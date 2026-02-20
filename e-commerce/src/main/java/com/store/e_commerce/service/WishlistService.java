package com.store.e_commerce.service;

import com.store.e_commerce.dto.response.WishlistItemResponse;

import java.util.List;

public interface WishlistService {
    List<WishlistItemResponse> getWishlistByUserId(Integer userId);
    
    WishlistItemResponse addToWishlist(Integer userId, Integer productId);
    
    void removeFromWishlist(Integer userId, Integer productId);
    
    void clearWishlist(Integer userId);
    
    boolean isProductInWishlist(Integer userId, Integer productId);
}
