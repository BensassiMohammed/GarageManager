package com.garage.management.controller;

import com.garage.management.entity.StockMovement;
import com.garage.management.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @GetMapping
    public List<StockMovement> getAll() {
        return stockMovementRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockMovement> getById(@PathVariable Long id) {
        return stockMovementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public List<StockMovement> getByProduct(@PathVariable Long productId) {
        return stockMovementRepository.findByProductId(productId);
    }

    @PostMapping
    public StockMovement create(@RequestBody StockMovement movement) {
        return stockMovementRepository.save(movement);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return stockMovementRepository.findById(id)
                .map(movement -> {
                    stockMovementRepository.delete(movement);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
