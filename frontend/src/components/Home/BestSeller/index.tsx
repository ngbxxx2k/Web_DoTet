"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { ProductService, ProductApiResponse } from "@/services/product.service";
import { Product } from "@/types/product";

// Map API response to frontend Product type
const mapToProduct = (item: ProductApiResponse): Product => {
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
  };
};

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getBestSellers(6);
        setProducts(data.map(mapToProduct));
      } catch (error) {
        console.error("Failed to fetch best sellers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Tháng Này
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Bán Chạy Nhất
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-blue border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {/* <!-- Best Sellers item --> */}
            {products.map((item, key) => (
              <SingleItem item={item} key={key} />
            ))}
          </div>
        )}

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            Xem Tất Cả
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
