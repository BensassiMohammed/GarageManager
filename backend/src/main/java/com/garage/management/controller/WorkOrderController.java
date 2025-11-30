package com.garage.management.controller;

import com.garage.management.entity.WorkOrder;
import com.garage.management.entity.WorkOrderProductLine;
import com.garage.management.entity.WorkOrderServiceLine;
import com.garage.management.repository.WorkOrderProductLineRepository;
import com.garage.management.repository.WorkOrderRepository;
import com.garage.management.repository.WorkOrderServiceLineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private WorkOrderServiceLineRepository serviceLineRepository;

    @Autowired
    private WorkOrderProductLineRepository productLineRepository;

    @GetMapping
    public List<WorkOrder> getAll() {
        return workOrderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrder> getById(@PathVariable Long id) {
        return workOrderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/service-lines")
    public List<WorkOrderServiceLine> getServiceLines(@PathVariable Long id) {
        return serviceLineRepository.findByWorkOrderId(id);
    }

    @GetMapping("/{id}/product-lines")
    public List<WorkOrderProductLine> getProductLines(@PathVariable Long id) {
        return productLineRepository.findByWorkOrderId(id);
    }

    @PostMapping
    public WorkOrder create(@RequestBody WorkOrder workOrder) {
        return workOrderRepository.save(workOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkOrder> update(@PathVariable Long id, @RequestBody WorkOrder workOrder) {
        return workOrderRepository.findById(id)
                .map(existing -> {
                    existing.setClient(workOrder.getClient());
                    existing.setVehicle(workOrder.getVehicle());
                    existing.setDate(workOrder.getDate());
                    existing.setStatus(workOrder.getStatus());
                    existing.setTotalAmount(workOrder.getTotalAmount());
                    existing.setDescription(workOrder.getDescription());
                    return ResponseEntity.ok(workOrderRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return workOrderRepository.findById(id)
                .map(order -> {
                    workOrderRepository.delete(order);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/service-lines")
    public WorkOrderServiceLine addServiceLine(@PathVariable Long id, @RequestBody WorkOrderServiceLine line) {
        return workOrderRepository.findById(id)
                .map(order -> {
                    line.setWorkOrder(order);
                    return serviceLineRepository.save(line);
                })
                .orElseThrow(() -> new RuntimeException("Work order not found"));
    }

    @PostMapping("/{id}/product-lines")
    public WorkOrderProductLine addProductLine(@PathVariable Long id, @RequestBody WorkOrderProductLine line) {
        return workOrderRepository.findById(id)
                .map(order -> {
                    line.setWorkOrder(order);
                    return productLineRepository.save(line);
                })
                .orElseThrow(() -> new RuntimeException("Work order not found"));
    }

    @DeleteMapping("/service-lines/{lineId}")
    public ResponseEntity<Void> deleteServiceLine(@PathVariable Long lineId) {
        return serviceLineRepository.findById(lineId)
                .map(line -> {
                    serviceLineRepository.delete(line);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/product-lines/{lineId}")
    public ResponseEntity<Void> deleteProductLine(@PathVariable Long lineId) {
        return productLineRepository.findById(lineId)
                .map(line -> {
                    productLineRepository.delete(line);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
