package com.garage.management.repository;

import com.garage.management.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByProductId(Long productId);
    
    @Query("SELECT sm FROM StockMovement sm WHERE sm.product.category.id = :categoryId ORDER BY sm.date DESC")
    List<StockMovement> findByCategoryId(@Param("categoryId") Long categoryId);
    
    List<StockMovement> findAllByOrderByDateDesc();
}
