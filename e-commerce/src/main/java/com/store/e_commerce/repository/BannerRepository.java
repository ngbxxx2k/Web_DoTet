package com.store.e_commerce.repository;

import com.store.e_commerce.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Banner> findByPositionTypeAndIsActiveTrueOrderByDisplayOrderAsc(Banner.BannerPositionType positionType);
}
