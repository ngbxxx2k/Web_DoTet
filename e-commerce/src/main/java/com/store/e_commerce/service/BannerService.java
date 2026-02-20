package com.store.e_commerce.service;

import com.store.e_commerce.entity.Banner;
import java.util.List;

public interface BannerService {
    List<Banner> getActiveBanners(Banner.BannerPositionType type);
    Banner createBanner(Banner banner);
    Banner updateBanner(Integer id, Banner banner);
    void deleteBanner(Integer id);
    List<Banner> getAllBanners();
}
