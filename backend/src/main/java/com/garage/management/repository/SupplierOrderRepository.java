package com.garage.management.repository;

import com.garage.management.entity.SupplierOrder;
import com.garage.management.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierOrderRepository extends JpaRepository<SupplierOrder, Long> {
    List<SupplierOrder> findBySupplierId(Long supplierId);
    List<SupplierOrder> findByStatus(OrderStatus status);
}
