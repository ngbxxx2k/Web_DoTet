
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  stock: number;
  stockQuantity?: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  images?: string[];
}

export interface ProductApiResponse {
  id: number;
  title: string;
  productName?: string;
  slug: string;
  description?: string;
  basePrice: number;
  thumbnail?: string;
  isActive: boolean;
  vendor?: string;
  categoryId?: number;
  categoryName?: string;
  category?: {
    id: number;
    title: string;
    categoryName?: string;
  };
  images?: string[];
  variants?: ProductVariant[];
  reviews?: number;
  rating?: number;
  averageRating?: number;
  totalReviews?: number;
  reviewsCount?: number;
}

export interface ProductReview {
  reviewId: number;
  productId?: number;
  productName?: string;
  productImage?: string;
  categoryName?: string;
  customerId?: number;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  hasPurchased?: boolean;
  isApproved?: boolean;
  isActive?: boolean;
  images?: string[];
}

export const ProductService = {
  async getNewArrivals(limit: number = 8): Promise<ProductApiResponse[]> {
    const res = await fetch(`${API_URL}/products/new-arrivals?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch new arrivals");
    return res.json();
  },

  async getBestSellers(limit: number = 8): Promise<ProductApiResponse[]> {
    const res = await fetch(`${API_URL}/products/best-sellers?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch best sellers");
    return res.json();
  },

  async getById(id: number): Promise<ProductApiResponse> {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  },

  async getBySlug(slug: string): Promise<ProductApiResponse> {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  },

  async getByCategory(categoryId: number, limit: number = 8, excludeId?: number): Promise<ProductApiResponse[]> {
    let url = `${API_URL}/products/category/${categoryId}?limit=${limit}`;
    if (excludeId) url += `&excludeId=${excludeId}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch products by category");
    return res.json();
  },

  async getProductReviews(productId: number): Promise<ProductReview[]> {
    try {
      // Try both common patterns if one fails
      let url = `${API_URL}/reviews/product/${productId}`;
      let res = await fetch(url, { cache: 'no-store' });
      
      // If not found, try query parameter pattern
      if (!res.ok) {
        url = `${API_URL}/reviews?productId=${productId}`;
        res = await fetch(url, { cache: 'no-store' });
      }

      if (!res.ok) return [];
      const data = await res.json();
      
      // Handle Spring Boot Pageable response (.content) or direct array
      if (data.content && Array.isArray(data.content)) return data.content;
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      
      return [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  },

  async addProductReview(productId: number, rating: number, comment: string, token?: string | null): Promise<ProductReview> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token && token !== "session") {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers,
      credentials: 'include', // Important for session cookies
      body: JSON.stringify({ productId, rating, comment }),
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to add review");
    }
    return res.json();
  },

  async checkPurchased(productId: number, token?: string | null): Promise<boolean> {
    try {
      const headers: HeadersInit = {};
      if (token && token !== "session") {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/orders/check-purchased/${productId}`, {
        headers,
        credentials: 'include', // Important for session cookies
        cache: 'no-store'
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.purchased === true;
    } catch {
      return false;
    }
  },

  async getLatestReviews(limit: number = 6): Promise<ProductReview[]> {
    const res = await fetch(`${API_URL}/reviews/latest?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch latest reviews");
    return res.json();
  }
};
