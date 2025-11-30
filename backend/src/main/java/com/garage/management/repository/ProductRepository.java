package com.garage.management.repository;

import com.garage.management.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    Optional<Product> findByCode(String code);
    List<Product> findByCategoryId(Long categoryId);
    
    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.minStock AND p.active = true")
    List<Product> findLowStockProducts();
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.currentStock <= p.minStock AND p.active = true")
    Long countLowStockProducts();
}
