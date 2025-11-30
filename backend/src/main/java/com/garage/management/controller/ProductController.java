package com.garage.management.controller;

import com.garage.management.entity.Product;
import com.garage.management.entity.ProductPriceHistory;
import com.garage.management.repository.ProductRepository;
import com.garage.management.service.ProductPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductPriceService productPriceService;

    @GetMapping
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStock() {
        return productRepository.findLowStockProducts();
    }

    @GetMapping("/{id}/prices")
    public List<ProductPriceHistory> getPriceHistory(@PathVariable Long id) {
        return productPriceService.getPriceHistory(id);
    }

    @GetMapping("/{id}/current-price")
    public ResponseEntity<BigDecimal> getCurrentPrice(@PathVariable Long id) {
        return productPriceService.getCurrentPrice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/prices")
    public ResponseEntity<ProductPriceHistory> addPrice(@PathVariable Long id, @RequestBody PriceRequest request) {
        ProductPriceHistory history = productPriceService.addNewPrice(id, request.price, request.startDate);
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return productRepository.findById(id)
                .map(existing -> {
                    existing.setCode(product.getCode());
                    existing.setName(product.getName());
                    existing.setCategory(product.getCategory());
                    existing.setSellingPrice(product.getSellingPrice());
                    existing.setMinStock(product.getMinStock());
                    existing.setCurrentStock(product.getCurrentStock());
                    existing.setActive(product.getActive());
                    return ResponseEntity.ok(productRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setActive(false);
                    productRepository.save(product);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class PriceRequest {
        public BigDecimal price;
        public LocalDate startDate;
    }
}
