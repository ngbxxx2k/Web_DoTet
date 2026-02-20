package com.store.e_commerce.repository;

import com.store.e_commerce.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Integer> {
    Optional<AttributeValue> findByAttribute_AttributeIdAndValueName(Integer attributeId, String valueName);
    Optional<java.util.List<AttributeValue>> findByAttribute_AttributeId(Integer attributeId);
}
