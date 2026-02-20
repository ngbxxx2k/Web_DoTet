package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.CartItemRequest;
import com.store.e_commerce.dto.response.CartItemResponse;
import com.store.e_commerce.dto.response.CartResponse;
import com.store.e_commerce.entity.Cart;
import com.store.e_commerce.entity.CartItem;
import com.store.e_commerce.entity.ProductVariant;
import com.store.e_commerce.entity.User;
import com.store.e_commerce.repository.CartItemRepository;
import com.store.e_commerce.repository.CartRepository;
import com.store.e_commerce.repository.ProductVariantRepository;
import com.store.e_commerce.repository.UserRepository;
import com.store.e_commerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public CartResponse getCart(Integer userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(Integer userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        
        // Find existing item in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductVariant().getVariantId().equals(request.getProductVariantId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            // Optionally update price if needed, but usually we keep original or current? 
            // Let's update to current price
             ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("Product Variant not found"));
            item.setPrice(variant.getPrice());
            cartItemRepository.save(item);
        } else {
             ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("Product Variant not found"));
            
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .price(variant.getPrice())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        // Refresh cart to get updated items
        return mapToResponse(cartRepository.findById(cart.getCartId()).get());
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Integer userId, Integer cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            throw new RuntimeException("Item does not belong to user cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeFromCart(Integer userId, Integer cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            // Check via Cart ID match
             throw new RuntimeException("Item does not belong to user cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Integer userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
    
    @Override
    @Transactional
    public CartResponse mergeCart(Integer userId, List<CartItemRequest> items) {
        Cart cart = getOrCreateCart(userId);
        
        // Simple merge logic: iterate and add
        for (CartItemRequest req : items) {
            // We can reuse addToCart logic but optimized
             ProductVariant variant = productVariantRepository.findById(req.getProductVariantId())
                .orElse(null);
            
            if (variant == null) continue;

             Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductVariant().getVariantId().equals(variant.getVariantId()))
                .findFirst();
            
            if (existingItem.isPresent()) {
                // If exists, maybe we keep the max quantity or add? Usually allow user to decide, but auto-merge usually adds
                // Or allows local to override? Let's add for now.
                CartItem item = existingItem.get();
                // Ensure we don't double count if exact same sync happens multiple times?
                // Frontend should clear local cart after sync
                // For safety, let's assume we want to ensure at least this quantity or sum
                // Let's just Add.
                 item.setQuantity(item.getQuantity() + req.getQuantity());
                 cartItemRepository.save(item);
            } else {
                 CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(req.getQuantity())
                    .price(variant.getPrice())
                    .build();
                cart.getItems().add(newItem);
                cartItemRepository.save(newItem);
            }
        }
        
        return getCart(userId);
    }

    private Cart getOrCreateCart(Integer userId) {
        return cartRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Cart newCart = Cart.builder()
                        .user(user)
                        .items(new ArrayList<>())
                        .build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getTotalLinePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .items(itemResponses)
                .totalPrice(total)
                .build();
    }
    
    private CartItemResponse mapItemToResponse(CartItem item) {
          BigDecimal total = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
          
        return CartItemResponse.builder()
                .cartItemId(item.getCartItemId())
                .productVariantId(item.getProductVariant().getVariantId())
                .productId(item.getProductVariant().getProduct().getProductId())
                .title(item.getProductVariant().getProduct().getTitle()) 
                .sku(item.getProductVariant().getSku())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .totalLinePrice(total)
                .imageUrl(item.getProductVariant().getImageUrl() != null ? item.getProductVariant().getImageUrl() : item.getProductVariant().getProduct().getThumbnail())
                .build();
    }

    @Override
    @Transactional
    public CartResponse updateCartItemByVariant(Integer userId, Integer variantId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductVariant().getVariantId().equals(variantId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeFromCartByVariant(Integer userId, Integer variantId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductVariant().getVariantId().equals(variantId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return mapToResponse(cart);
    }
}
