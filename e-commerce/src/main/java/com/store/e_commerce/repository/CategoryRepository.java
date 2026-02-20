package com.store.e_commerce.repository;

import com.store.e_commerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    // Find all active categories
    List<Category> findByIsActiveTrue();

    // Check slug uniqueness
    boolean existsBySlug(String slug);
    boolean existsBySlugAndCategoryIdNot(String slug, Integer id);

    // Find children by parent
    List<Category> findByParentCategoryId(Integer parentId);

    @Query("SELECT c.categoryId, COUNT(p) FROM Category c LEFT JOIN Product p ON p.category = c AND p.deletedAt IS NULL AND p.isActive = true WHERE c.deletedAt IS NULL GROUP BY c.categoryId")
    List<Object[]> countProductsPerCategory();
}
