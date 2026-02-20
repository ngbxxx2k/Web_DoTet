package com.store.e_commerce.controller;

import com.store.e_commerce.dto.request.CartItemRequest;
import com.store.e_commerce.dto.response.CartResponse;
import com.store.e_commerce.security.UserDetailsImpl;
import com.store.e_commerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.getCart(userDetails.getUser().getUserId()));
    }

    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                  @RequestBody CartItemRequest request) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.addToCart(userDetails.getUser().getUserId(), request));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                       @PathVariable Integer cartItemId,
                                                       @RequestParam Integer quantity) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.updateCartItem(userDetails.getUser().getUserId(), cartItemId, quantity));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<CartResponse> removeFromCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                       @PathVariable Integer cartItemId) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.removeFromCart(userDetails.getUser().getUserId(), cartItemId));
    }

    @PutMapping("/variant/{variantId}")
    public ResponseEntity<CartResponse> updateCartItemByVariant(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                       @PathVariable Integer variantId,
                                                       @RequestParam Integer quantity) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.updateCartItemByVariant(userDetails.getUser().getUserId(), variantId, quantity));
    }

    @DeleteMapping("/variant/{variantId}")
    public ResponseEntity<CartResponse> removeFromCartByVariant(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                       @PathVariable Integer variantId) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.removeFromCartByVariant(userDetails.getUser().getUserId(), variantId));
    }

    @PostMapping("/sync")
    public ResponseEntity<CartResponse> syncCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                 @RequestBody List<CartItemRequest> items) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.mergeCart(userDetails.getUser().getUserId(), items));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        cartService.clearCart(userDetails.getUser().getUserId());
        return ResponseEntity.ok().build();
    }
}
