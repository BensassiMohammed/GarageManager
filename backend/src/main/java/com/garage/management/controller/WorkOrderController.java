package com.garage.management.controller;

import com.garage.management.entity.WorkOrder;
import com.garage.management.entity.WorkOrderProductLine;
import com.garage.management.entity.WorkOrderServiceLine;
import com.garage.management.enums.WorkOrderStatus;
import com.garage.management.repository.WorkOrderProductLineRepository;
import com.garage.management.repository.WorkOrderRepository;
import com.garage.management.repository.WorkOrderServiceLineRepository;
import com.garage.management.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@CrossOrigin(origins = "*")
public class WorkOrderController {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private WorkOrderServiceLineRepository serviceLineRepository;

    @Autowired
    private WorkOrderProductLineRepository productLineRepository;

    @Autowired
    private WorkOrderService workOrderService;

    @GetMapping
    public List<WorkOrder> getAll() {
        return workOrderRepository.findAll();
    }

    @GetMapping("/open")
    public List<WorkOrder> getOpen() {
        List<WorkOrder> openOrders = workOrderRepository.findByStatus(WorkOrderStatus.OPEN);
        openOrders.addAll(workOrderRepository.findByStatus(WorkOrderStatus.IN_PROGRESS));
        return openOrders;
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

    @GetMapping("/{id}/totals")
    public ResponseEntity<WorkOrderService.WorkOrderTotals> getTotals(@PathVariable Long id) {
        try {
            WorkOrderService.WorkOrderTotals totals = workOrderService.getWorkOrderTotals(id);
            return ResponseEntity.ok(totals);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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
    public ResponseEntity<WorkOrderServiceLine> addServiceLine(@PathVariable Long id, @RequestBody AddServiceLineRequest request) {
        try {
            WorkOrderServiceLine line = workOrderService.addServiceLine(id, request.serviceId, request.quantity, request.discountPercent);
            return ResponseEntity.ok(line);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/product-lines")
    public ResponseEntity<WorkOrderProductLine> addProductLine(@PathVariable Long id, @RequestBody AddProductLineRequest request) {
        try {
            WorkOrderProductLine line = workOrderService.addProductLine(id, request.productId, request.quantity, request.discountPercent);
            return ResponseEntity.ok(line);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/service-lines/{lineId}")
    public ResponseEntity<Void> deleteServiceLine(@PathVariable Long lineId) {
        return serviceLineRepository.findById(lineId)
                .map(line -> {
                    Long workOrderId = line.getWorkOrder().getId();
                    serviceLineRepository.delete(line);
                    workOrderService.recalculateWorkOrderTotal(workOrderId);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/product-lines/{lineId}")
    public ResponseEntity<Void> deleteProductLine(@PathVariable Long lineId) {
        return productLineRepository.findById(lineId)
                .map(line -> {
                    Long workOrderId = line.getWorkOrder().getId();
                    productLineRepository.delete(line);
                    workOrderService.recalculateWorkOrderTotal(workOrderId);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/recalculate-all")
    public ResponseEntity<String> recalculateAllTotals() {
        List<WorkOrder> allOrders = workOrderRepository.findAll();
        int count = 0;
        for (WorkOrder order : allOrders) {
            workOrderService.recalculateWorkOrderTotal(order.getId());
            count++;
        }
        return ResponseEntity.ok("Recalculated totals for " + count + " work orders");
    }

    public static class AddServiceLineRequest {
        public Long serviceId;
        public Integer quantity;
        public BigDecimal discountPercent;
    }

    public static class AddProductLineRequest {
        public Long productId;
        public Integer quantity;
        public BigDecimal discountPercent;
    }
}
