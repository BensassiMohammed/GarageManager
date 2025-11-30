package com.garage.management.controller;

import com.garage.management.entity.StockMovement;
import com.garage.management.service.StockMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    @Autowired
    private StockMovementService stockMovementService;

    @GetMapping
    public List<StockMovement> getAll() {
        return stockMovementService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockMovement> getById(@PathVariable Long id) {
        return stockMovementService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public List<StockMovement> getByProduct(@PathVariable Long productId) {
        return stockMovementService.findByProductId(productId);
    }

    @PostMapping
    public StockMovement create(@RequestBody StockMovement movement) {
        return stockMovementService.createMovement(movement);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            stockMovementService.deleteMovement(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
