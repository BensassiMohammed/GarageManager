package com.garage.management.repository;

import com.garage.management.entity.ProductBuyingPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductBuyingPriceHistoryRepository extends JpaRepository<ProductBuyingPriceHistory, Long> {
    List<ProductBuyingPriceHistory> findByProductIdOrderByStartDateDesc(Long productId);
    
    @Query("SELECT pbph FROM ProductBuyingPriceHistory pbph WHERE pbph.product.id = :productId " +
           "AND pbph.startDate <= :date AND (pbph.endDate IS NULL OR pbph.endDate >= :date) " +
           "ORDER BY pbph.startDate DESC")
    Optional<ProductBuyingPriceHistory> findCurrentPriceForProduct(@Param("productId") Long productId, @Param("date") LocalDate date);
    
    @Query("SELECT pbph FROM ProductBuyingPriceHistory pbph WHERE pbph.product.id = :productId " +
           "AND pbph.endDate IS NULL ORDER BY pbph.startDate DESC")
    Optional<ProductBuyingPriceHistory> findActiveForProduct(@Param("productId") Long productId);
}
