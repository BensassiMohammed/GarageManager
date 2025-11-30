package com.garage.management.repository;

import com.garage.management.entity.WorkOrderServiceLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderServiceLineRepository extends JpaRepository<WorkOrderServiceLine, Long> {
    List<WorkOrderServiceLine> findByWorkOrderId(Long workOrderId);
}
