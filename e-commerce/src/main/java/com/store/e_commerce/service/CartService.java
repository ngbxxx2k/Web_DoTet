package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.CartItemRequest;
import com.store.e_commerce.dto.response.CartResponse;

import java.util.List;

public interface CartService {
    CartResponse getCart(Integer userId);
    CartResponse addToCart(Integer userId, CartItemRequest request);
    CartResponse updateCartItem(Integer userId, Integer cartItemId, Integer quantity);
    CartResponse removeFromCart(Integer userId, Integer cartItemId);
    void clearCart(Integer userId);
    CartResponse mergeCart(Integer userId, List<CartItemRequest> items);
    CartResponse updateCartItemByVariant(Integer userId, Integer variantId, Integer quantity);
    CartResponse removeFromCartByVariant(Integer userId, Integer variantId);
}
