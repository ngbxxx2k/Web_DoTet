"use client";
import React from "react";
import ProductItem from "@/components/Common/ProductItem";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef } from "react";
import "swiper/css/navigation";
import "swiper/css";
import { ProductApiResponse } from "@/services/product.service";

interface RecentlyViewdItemsProps {
  products: ProductApiResponse[];
  title?: string;
}

const RecentlyViewdItems = ({ products, title = "Sản phẩm cùng danh mục" }: RecentlyViewdItemsProps) => {
  const sliderRef = useRef<any>(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="overflow-hidden pt-17.5 pb-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* <!-- section title --> */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <Image
                  src="/images/icons/icon-05.svg"
                  width={17}
                  height={17}
                  alt="icon"
                />
                Liên quan
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev} 
                className="swiper-button-prev relative !left-0 !right-0 !mt-0 !text-dark after:!text-sm w-9 h-9 rounded-full border border-gray-3 flex items-center justify-center hover:bg-blue hover:text-white hover:border-blue transition-all"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <button 
                onClick={handleNext} 
                className="swiper-button-next relative !left-0 !right-0 !mt-0 !text-dark after:!text-sm w-9 h-9 rounded-full border border-gray-3 flex items-center justify-center hover:bg-blue hover:text-white hover:border-blue transition-all"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
          >
            {products.map((item) => (
              <SwiperSlide key={item.id}>
                {/* Mapping ProductApiResponse to ProductItem format */}
                {(() => {
                  const reviewsData = item.reviews as any;
                  const isReviewsArray = Array.isArray(reviewsData);
                  const reviewsCount = isReviewsArray 
                    ? reviewsData.length 
                    : (item.totalReviews || item.reviewsCount || (typeof reviewsData === 'number' ? reviewsData : 0));

                  const averageRating = item.averageRating || item.rating || (isReviewsArray && reviewsCount > 0
                    ? (reviewsData as any[]).reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviewsCount
                    : 0);

                  return (
                    <ProductItem 
                      item={{
                        id: item.id,
                        title: item.title || item.productName || "",
                        price: item.basePrice,
                        discountedPrice: item.variants?.[0]?.price || item.basePrice,
                        reviews: reviewsCount,
                        imgs: {
                          thumbnails: item.images || [item.thumbnail].filter(Boolean) as string[],
                          previews: item.images || [item.thumbnail].filter(Boolean) as string[],
                        },
                        rating: averageRating || 0,
                        description: item.description || ""
                      }} 
                    />
                  );
                })()}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewdItems;
