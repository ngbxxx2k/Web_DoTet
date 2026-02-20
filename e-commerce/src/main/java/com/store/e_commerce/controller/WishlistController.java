package com.store.e_commerce.controller;

import com.store.e_commerce.dto.response.WishlistItemResponse;
import com.store.e_commerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<WishlistItemResponse>> getWishlist(@PathVariable Integer userId) {
        return ResponseEntity.ok(wishlistService.getWishlistByUserId(userId));
    }

    @PostMapping("/{userId}/add/{productId}")
    public ResponseEntity<WishlistItemResponse> addToWishlist(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(userId, productId));
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearWishlist(@PathVariable Integer userId) {
        wishlistService.clearWishlist(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkProductInWishlist(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {
        boolean inWishlist = wishlistService.isProductInWishlist(userId, productId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }
}
