"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useEffect, useState } from "react";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import { BannerService, Banner } from "@/services/banner.service";

const HeroCarousal = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await BannerService.getActiveBanners("MAIN_SLIDER");
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Fallback slides khi chưa có banner
  const defaultSlides = [
    { imageUrl: "/images/hero/hero-01.png" },
    { imageUrl: "/images/hero/hero-01.png" },
  ];

  const slidesToRender = banners.length > 0 ? banners : defaultSlides;

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {slidesToRender.map((banner, idx) => (
        <SwiperSlide key={idx}>
          <div className="relative w-full" style={{ paddingBottom: '47.29%' }}>
            <Image
              src={banner.imageUrl || "/images/hero/hero-01.png"}
              alt={`Banner ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 757px"
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
