package com.store.e_commerce.repository;

import com.store.e_commerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByOrderCode(String orderCode);
    boolean existsByOrderCode(String orderCode);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.isActive = true AND o.createdAt BETWEEN :start AND :end")
    Long countOrdersInRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.isActive = true AND o.paymentStatus = 1 AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumRevenueInRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.isActive = true GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    @Query("SELECT o FROM Order o WHERE o.isActive = true AND o.paymentStatus = 1 AND o.createdAt BETWEEN :start AND :end ORDER BY o.createdAt ASC")
    List<Order> findPaidOrdersInRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o LEFT JOIN o.customer c JOIN o.items i JOIN i.productVariant v JOIN v.product p " +
            "WHERE (c.phoneNumber = :phone OR o.customerPhone = :phone) AND p.productId = :productId AND o.status = 3")
    boolean existsByCustomerPhoneAndProductIdAndStatusCompleted(@Param("phone") String phone, @Param("productId") Integer productId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.customer c JOIN o.items i JOIN i.productVariant v JOIN v.product p " +
            "WHERE (c.phoneNumber = :phone OR o.customerPhone = :phone) AND p.productId = :productId AND o.status = 3 ORDER BY o.createdAt DESC")
    List<Order> findCompletedOrdersByCustomerPhoneAndProductId(@Param("phone") String phone, @Param("productId") Integer productId);

    List<Order> findByCustomer_UserIdOrderByCreatedAtDesc(Integer userId);
}
