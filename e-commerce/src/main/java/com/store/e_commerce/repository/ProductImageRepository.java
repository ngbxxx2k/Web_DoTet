package com.store.e_commerce.repository;

import com.store.e_commerce.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    List<ProductImage> findByProduct_ProductId(Integer productId);
    List<ProductImage> findByVariant_VariantId(Integer variantId);
    void deleteByProduct_ProductId(Integer productId);
}
