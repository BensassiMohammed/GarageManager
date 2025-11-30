package com.garage.management.repository;

import com.garage.management.entity.ProductPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, Long> {
    List<ProductPriceHistory> findByProductIdOrderByStartDateDesc(Long productId);
    
    @Query("SELECT pph FROM ProductPriceHistory pph WHERE pph.product.id = :productId " +
           "AND pph.startDate <= :date AND (pph.endDate IS NULL OR pph.endDate >= :date) " +
           "ORDER BY pph.startDate DESC")
    Optional<ProductPriceHistory> findCurrentPriceForProduct(@Param("productId") Long productId, @Param("date") LocalDate date);
    
    @Query("SELECT pph FROM ProductPriceHistory pph WHERE pph.product.id = :productId " +
           "AND pph.endDate IS NULL ORDER BY pph.startDate DESC")
    Optional<ProductPriceHistory> findActiveForProduct(@Param("productId") Long productId);
}
