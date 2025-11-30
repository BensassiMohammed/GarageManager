package com.garage.management.repository;

import com.garage.management.entity.WorkOrder;
import com.garage.management.enums.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByClientId(Long clientId);
    List<WorkOrder> findByVehicleId(Long vehicleId);
    List<WorkOrder> findByStatus(WorkOrderStatus status);
    
    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status = 'OPEN' OR w.status = 'IN_PROGRESS'")
    Long countOpenWorkOrders();
}
