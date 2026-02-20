package com.store.e_commerce.specification;

import com.store.e_commerce.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> getSpecifications(String search, Integer roleId, Boolean isActive) {
        return Specification.where(searchFilter(search))
                .and(roleFilter(roleId))
                .and(statusFilter(isActive));
    }

    private static Specification<User> searchFilter(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phoneNumber")), pattern)
            );
        };
    }

    private static Specification<User> roleFilter(Integer roleId) {
        return (root, query, cb) -> {
            if (roleId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("role").get("roleId"), roleId);
        };
    }

    private static Specification<User> statusFilter(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("isActive"), isActive);
        };
    }
}
