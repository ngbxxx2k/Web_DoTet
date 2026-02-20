package com.store.e_commerce.repository;

import com.store.e_commerce.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    List<ProductVariant> findByProduct_ProductId(Integer productId);
    Optional<ProductVariant> findBySku(String sku);
    boolean existsBySku(String sku);
}
