package com.store.e_commerce.specification;

import com.store.e_commerce.entity.Category;
import com.store.e_commerce.entity.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> getSpecifications(String search, Integer categoryId, Boolean isActive, BigDecimal minPrice, BigDecimal maxPrice, List<String> attributeValues) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String likePattern = "%" + search.toLowerCase() + "%";
                // Join with variants to search by SKU
                var variantJoin = root.join("productVariants", jakarta.persistence.criteria.JoinType.LEFT);
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("slug")), likePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(variantJoin.get("sku")), likePattern)
                ));
            }

            if (categoryId != null) {
                Join<Product, Category> categoryJoin = root.join("category");
                predicates.add(criteriaBuilder.equal(categoryJoin.get("categoryId"), categoryId));
            }

            if (isActive != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), isActive));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            if (attributeValues != null && !attributeValues.isEmpty()) {
                // Filter products that have variants with ANY of the specified attribute values (OR logic within specific attribute type usually, but simplified here)
                // If the user selects "Size: M" and "Color: Red", they likely mean (M AND Red) or (M OR Red)?
                // Standard e-commerce usually does OR within an attribute group (M or L) and AND across groups ((M or L) AND (Red or Blue)).
                // However, input here is a simple list of strings. Let's assume broad OR or simple match for now.
                // Or better: Join Product -> Variant -> AttributeValues.
                
                var variantJoin = root.join("productVariants", jakarta.persistence.criteria.JoinType.INNER);
                var avJoin = variantJoin.join("attributeValues", jakarta.persistence.criteria.JoinType.INNER);
                
                predicates.add(avJoin.get("valueName").in(attributeValues));
            }
            
            if (query != null) {
                query.distinct(true); 
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
