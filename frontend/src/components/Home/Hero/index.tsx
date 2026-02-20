"use client";
import React, { useEffect, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import { BannerService, Banner } from "@/services/banner.service";

const Hero = () => {
  const [sideBanners, setSideBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchSideBanners = async () => {
      try {
        const data = await BannerService.getActiveBanners("SIDE_BANNER");
        setSideBanners(data);
      } catch (error) {
        console.error("Failed to fetch side banners", error);
      }
    };
    fetchSideBanners();
  }, []);

  // Fallback banners
  const defaultSide = [
    { imageUrl: "/images/hero/hero-02.png" },
    { imageUrl: "/images/hero/hero-01.png" },
  ];

  const sidesToRender = sideBanners.length > 0 ? sideBanners : defaultSide;

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {/* Side Banner 1 - Chỉ ảnh full khung */}
              <div className="w-full relative rounded-[10px] bg-white overflow-hidden" style={{ aspectRatio: '393/171' }}>
                <Image
                  src={sidesToRender[0]?.imageUrl || "/images/hero/hero-02.png"}
                  alt="Side Banner 1"
                  fill
                  sizes="(max-width: 768px) 100vw, 393px"
                  className="object-cover"
                />
              </div>

              {/* Side Banner 2 - Chỉ ảnh full khung */}
              <div className="w-full relative rounded-[10px] bg-white overflow-hidden" style={{ aspectRatio: '393/171' }}>
                <Image
                  src={sidesToRender[1]?.imageUrl || "/images/hero/hero-01.png"}
                  alt="Side Banner 2"
                  fill
                  sizes="(max-width: 768px) 100vw, 393px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero features */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
