package com.garage.management.controller;

import com.garage.management.entity.SupplierOrder;
import com.garage.management.entity.SupplierOrderLine;
import com.garage.management.repository.SupplierOrderLineRepository;
import com.garage.management.repository.SupplierOrderRepository;
import com.garage.management.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-orders")
@CrossOrigin(origins = "*")
public class SupplierOrderController {

    @Autowired
    private SupplierOrderRepository supplierOrderRepository;

    @Autowired
    private SupplierOrderLineRepository supplierOrderLineRepository;

    @Autowired
    private StockService stockService;

    @GetMapping
    public List<SupplierOrder> getAll() {
        return supplierOrderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierOrder> getById(@PathVariable Long id) {
        return supplierOrderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/lines")
    public List<SupplierOrderLine> getLines(@PathVariable Long id) {
        return supplierOrderLineRepository.findBySupplierOrderId(id);
    }

    @PostMapping
    public SupplierOrder create(@RequestBody SupplierOrder order) {
        return supplierOrderRepository.save(order);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierOrder> update(@PathVariable Long id, @RequestBody SupplierOrder order) {
        return supplierOrderRepository.findById(id)
                .map(existing -> {
                    existing.setSupplier(order.getSupplier());
                    existing.setOrderDate(order.getOrderDate());
                    existing.setStatus(order.getStatus());
                    existing.setTotalAmount(order.getTotalAmount());
                    return ResponseEntity.ok(supplierOrderRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<SupplierOrder> markAsReceived(@PathVariable Long id) {
        try {
            SupplierOrder order = stockService.markOrderAsReceived(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return supplierOrderRepository.findById(id)
                .map(order -> {
                    supplierOrderRepository.delete(order);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/lines")
    public SupplierOrderLine addLine(@PathVariable Long id, @RequestBody SupplierOrderLine line) {
        return supplierOrderRepository.findById(id)
                .map(order -> {
                    line.setSupplierOrder(order);
                    return supplierOrderLineRepository.save(line);
                })
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @DeleteMapping("/lines/{lineId}")
    public ResponseEntity<Void> deleteLine(@PathVariable Long lineId) {
        return supplierOrderLineRepository.findById(lineId)
                .map(line -> {
                    supplierOrderLineRepository.delete(line);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
