import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addItemToCart, updateCartItemQuantity, removeItemFromCart, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { store } from "@/redux/store";
import toast from "react-hot-toast";

export const useCart = () => {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cartReducer.items);
    const [loading, setLoading] = useState(false);

    // Helper to get auth state at call time (avoids stale closure issue)
    const getAuthState = () => store.getState().authReducer;

    const addToCart = async (product: any, quantity: number = 1) => {
        setLoading(true);
        try {
            // 1. Optimistic Update Redux
            dispatch(addItemToCart({ ...product, quantity }));
            toast.success("Đã thêm vào giỏ hàng");

            // 2. Check if logged in using Redux state (get fresh value at call time)
            const { isAuthenticated } = getAuthState();
            if (isAuthenticated) {
                const response = await fetch("/api/cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Important: send session cookie
                    body: JSON.stringify({
                        productVariantId: product.id, 
                        quantity: quantity
                    })
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Failed to sync cart with server:", errorText);
                }
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
         dispatch(updateCartItemQuantity({ id: itemId, quantity }));
         
         const { isAuthenticated: isLoggedIn } = getAuthState();
         if (isLoggedIn) {
             try {
                 // itemId in redux corresponds to variantId
                 const response = await fetch(`/api/cart/variant/${itemId}?quantity=${quantity}`, {
                     method: "PUT",
                     headers: { "Content-Type": "application/json" },
                     credentials: "include"
                 });
                 if (!response.ok) {
                     const errorText = await response.text();
                     console.error("Failed to update quantity on server:", errorText);
                 }
             } catch (e) {
                 console.error("Update quantity error:", e);
             }
         }
    };

    const removeFromCartAction = async (itemId: number) => {
        dispatch(removeItemFromCart(itemId));
        
        const { isAuthenticated: isLoggedIn } = getAuthState();
        if (isLoggedIn) {
            try {
                // itemId in redux corresponds to variantId
                const response = await fetch(`/api/cart/variant/${itemId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    // Ignore "not found" errors as we already removed it locally
                    if (response.status === 404 || response.status === 400) {
                         console.warn("Server sync warning (likely already removed):", errorText);
                    } else if (response.status === 401) {
                         console.warn("Session expired/Unauthorized. Please login again.");
                    } else {
                        console.error("Failed to remove item from server:", errorText || `Status ${response.status}`);
                    }
                }
            } catch (e) {
                console.error("Remove from cart error:", e);
            }
        }
    }

    const clearCart = async () => {
        dispatch(removeAllItemsFromCart());
        const { isAuthenticated: isLoggedIn } = getAuthState();
        if (isLoggedIn) {
            try {
                const response = await fetch(`/api/cart`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
                if (!response.ok) {
                    console.error("Failed to clear cart on server");
                }
            } catch (e) {
                console.error("Clear cart error:", e);
            }
        }
    }

    const totalAmount = cartItems.reduce((acc, item) => acc + (item.discountedPrice || item.price) * item.quantity, 0);

    return {
        cartItems,
        totalAmount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart: removeFromCartAction,
        clearCart
    };
};
