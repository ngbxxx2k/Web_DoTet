package com.store.e_commerce.service.impl;

import com.store.e_commerce.entity.Banner;
import com.store.e_commerce.repository.BannerRepository;
import com.store.e_commerce.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    public List<Banner> getActiveBanners(Banner.BannerPositionType type) {
        return bannerRepository.findByPositionTypeAndIsActiveTrueOrderByDisplayOrderAsc(type);
    }

    @Override
    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    @Override
    public Banner updateBanner(Integer id, Banner bannerDetails) {
        Banner banner = bannerRepository.findById(id).orElseThrow(() -> new RuntimeException("Banner not found"));
        banner.setImageUrl(bannerDetails.getImageUrl());
        banner.setDisplayOrder(bannerDetails.getDisplayOrder());
        banner.setPositionType(bannerDetails.getPositionType());
        banner.setIsActive(bannerDetails.getIsActive());
        return bannerRepository.save(banner);
    }

    @Override
    public void deleteBanner(Integer id) {
        bannerRepository.deleteById(id);
    }

    @Override
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }
}
