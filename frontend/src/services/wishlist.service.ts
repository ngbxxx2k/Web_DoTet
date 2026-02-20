const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface WishlistItem {
  wishlistId: number;
  productId: number;
  title: string;
  slug: string;
  basePrice: number;
  discountedPrice: number;
  thumbnail: string;
  status: string;
  addedAt: string;
}

export const WishlistService = {
  // Get wishlist for logged-in user
  async getWishlist(userId: number): Promise<WishlistItem[]> {
    const res = await fetch(`${API_URL}/wishlist/${userId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  // Add item to wishlist for logged-in user
  async addToWishlist(userId: number, productId: number): Promise<WishlistItem | null> {
    try {
      const res = await fetch(`${API_URL}/wishlist/${userId}/add/${productId}`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // Remove item from wishlist for logged-in user
  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/wishlist/${userId}/remove/${productId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Clear all wishlist items for logged-in user
  async clearWishlist(userId: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/wishlist/${userId}/clear`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Check if product is in wishlist
  async isProductInWishlist(userId: number, productId: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/wishlist/${userId}/check/${productId}`, { cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      return data.inWishlist === true;
    } catch {
      return false;
    }
  },
};
