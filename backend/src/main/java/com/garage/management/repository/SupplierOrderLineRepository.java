package com.garage.management.repository;

import com.garage.management.entity.SupplierOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierOrderLineRepository extends JpaRepository<SupplierOrderLine, Long> {
    List<SupplierOrderLine> findBySupplierOrderId(Long orderId);
}
