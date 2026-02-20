"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";

interface WishlistItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity?: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
}

export const useWishlist = (itemId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Check if item is in wishlist
  const isInWishlist = wishlistItems.some((item) => item.id === itemId);
  
  // Add to wishlist with animation
  const addToWishlist = useCallback((item: WishlistItem) => {
    if (isInWishlist) return; // Already in wishlist
    
    setIsAnimating(true);
    
    dispatch(
      addItemToWishlist({
        ...item,
        status: "available",
        quantity: 1,
      })
    );
    
    setShowToast(true);
    
    // Reset animation
    setTimeout(() => setIsAnimating(false), 600);
    
    // Hide toast
    setTimeout(() => setShowToast(false), 3000);
  }, [dispatch, isInWishlist]);
  
  return {
    isInWishlist,
    isAnimating,
    showToast,
    addToWishlist,
    wishlistCount: wishlistItems.length,
  };
};

// Heart Icon Component with wishlist state
export const WishlistHeartIcon = ({ 
  isInWishlist, 
  isAnimating 
}: { 
  isInWishlist: boolean; 
  isAnimating: boolean;
}) => {
  return (
    <svg
      className={`fill-current transition-all duration-300 ${isAnimating ? "scale-110" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isInWishlist ? (
        // Filled heart
        <path
          d="M8 14.5C7.83 14.5 7.67 14.44 7.54 14.33L2.78 10.15C1.05 8.55 0.5 7.18 0.5 5.91C0.5 4.08 1.97 2.5 3.91 2.5C5.15 2.5 6.32 3.18 7.07 4.27L8 5.55L8.93 4.27C9.68 3.18 10.85 2.5 12.09 2.5C14.03 2.5 15.5 4.08 15.5 5.91C15.5 7.18 14.95 8.55 13.22 10.15L8.46 14.33C8.33 14.44 8.17 14.5 8 14.5Z"
          fill="currentColor"
        />
      ) : (
        // Outline heart
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
          fill=""
        />
      )}
    </svg>
  );
};

// Toast Component
export const WishlistToast = ({ 
  show, 
  count 
}: { 
  show: boolean; 
  count: number;
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed top-20 right-4 z-[9999] animate-slideDown">
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Đã thêm vào yêu thích! ({count} sản phẩm)</span>
      </div>
    </div>
  );
};
