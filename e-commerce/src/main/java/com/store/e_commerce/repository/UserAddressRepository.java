package com.store.e_commerce.repository;

import com.store.e_commerce.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {
    List<UserAddress> findByUserUserId(Integer userId);
    java.util.Optional<UserAddress> findByUserUserIdAndIsDefaultTrue(Integer userId);
}
