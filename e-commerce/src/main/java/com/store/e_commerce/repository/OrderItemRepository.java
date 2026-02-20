package com.store.e_commerce.repository;

import com.store.e_commerce.entity.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderOrderId(Integer orderId);
    void deleteByOrderOrderId(Integer orderId);

    @Query(value = "SELECT oi.productName, SUM(oi.quantity), SUM(oi.totalPrice), MAX(pv.product.thumbnail) " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.productVariant pv " +
           "WHERE o.isActive = true AND o.paymentStatus = 1 AND o.createdAt BETWEEN :start AND :end " +
           "GROUP BY oi.productName " +
           "ORDER BY SUM(oi.quantity) DESC",
           countQuery = "SELECT COUNT(DISTINCT oi.productName) FROM OrderItem oi JOIN oi.order o WHERE o.isActive = true AND o.paymentStatus = 1 AND o.createdAt BETWEEN :start AND :end")
    Page<Object[]> getTopSellingProducts(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);
}
