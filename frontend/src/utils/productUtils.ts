import { ProductApiResponse } from "@/services/product.service";
import { Product } from "@/types/product";

export const mapToProduct = (item: ProductApiResponse): Product => {
  // Get the lowest price from variants, or use basePrice
  const variantPrices = item.variants?.map((v) => v.price) || [];
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : item.basePrice;
  
  // Robustly handle different field names and data types from the API
  const reviewsData = item.reviews as any;
  const isReviewsArray = Array.isArray(reviewsData);
  const reviewsCount = isReviewsArray 
    ? reviewsData.length 
    : (item.totalReviews || item.reviewsCount || (typeof reviewsData === 'number' ? reviewsData : 0));

  const averageRating = item.averageRating || item.rating || (isReviewsArray && reviewsCount > 0
    ? (reviewsData as any[]).reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviewsCount
    : 0);

  return {
    id: item.id,
    title: item.title || item.productName || "",
    reviews: reviewsCount,
    price: item.basePrice,
    discountedPrice: minPrice,
    rating: averageRating || 0,
    description: item.description || "",
    imgs: {
      thumbnails: item.thumbnail ? [item.thumbnail] : (item.images || ["/images/products/default.png"]),
      previews: item.thumbnail ? [item.thumbnail] : (item.images || ["/images/products/default.png"]),
    },
    variants: item.variants,
    status: item.isActive ? "In Stock" : "Out of Stock", // Added status mapping if needed
  };
};
