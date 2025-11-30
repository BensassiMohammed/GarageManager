package com.garage.management.repository;

import com.garage.management.entity.WorkOrderProductLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderProductLineRepository extends JpaRepository<WorkOrderProductLine, Long> {
    List<WorkOrderProductLine> findByWorkOrderId(Long workOrderId);
}
