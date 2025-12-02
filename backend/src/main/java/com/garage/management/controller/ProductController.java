package com.garage.management.controller;

import com.garage.management.entity.Product;
import com.garage.management.entity.ProductPriceHistory;
import com.garage.management.entity.ProductBuyingPriceHistory;
import com.garage.management.repository.ProductRepository;
import com.garage.management.service.ProductPriceService;
import com.garage.management.service.StockService;
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

    @Autowired
    private StockService stockService;

    @GetMapping
    public List<Product> getAll() {
        return productRepository.findByActiveTrue();
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

    // Selling Price History Endpoints
    @GetMapping("/{id}/prices")
    public List<ProductPriceHistory> getPriceHistory(@PathVariable Long id) {
        return productPriceService.getSellingPriceHistory(id);
    }

    @GetMapping("/{id}/selling-prices")
    public List<ProductPriceHistory> getSellingPriceHistory(@PathVariable Long id) {
        return productPriceService.getSellingPriceHistory(id);
    }

    @GetMapping("/{id}/current-price")
    public ResponseEntity<BigDecimal> getCurrentPrice(@PathVariable Long id) {
        return productPriceService.getCurrentSellingPrice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/current-selling-price")
    public ResponseEntity<BigDecimal> getCurrentSellingPrice(@PathVariable Long id) {
        return productPriceService.getCurrentSellingPrice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/prices")
    public ResponseEntity<ProductPriceHistory> addPrice(@PathVariable Long id, @RequestBody PriceRequest request) {
        ProductPriceHistory history = productPriceService.addNewSellingPrice(id, request.price, request.startDate);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/{id}/selling-prices")
    public ResponseEntity<ProductPriceHistory> addSellingPrice(@PathVariable Long id, @RequestBody PriceRequest request) {
        ProductPriceHistory history = productPriceService.addNewSellingPrice(id, request.price, request.startDate);
        return ResponseEntity.ok(history);
    }

    // Buying Price History Endpoints
    @GetMapping("/{id}/buying-prices")
    public List<ProductBuyingPriceHistory> getBuyingPriceHistory(@PathVariable Long id) {
        return productPriceService.getBuyingPriceHistory(id);
    }

    @GetMapping("/{id}/current-buying-price")
    public ResponseEntity<BigDecimal> getCurrentBuyingPrice(@PathVariable Long id) {
        return productPriceService.getCurrentBuyingPrice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/buying-prices")
    public ResponseEntity<ProductBuyingPriceHistory> addBuyingPrice(@PathVariable Long id, @RequestBody PriceRequest request) {
        ProductBuyingPriceHistory history = productPriceService.addNewBuyingPrice(id, request.price, request.startDate);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}/computed-stock")
    public ResponseEntity<Integer> getComputedStock(@PathVariable Long id) {
        Integer stock = stockService.computeCurrentStock(id);
        return ResponseEntity.ok(stock);
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productRepository.saveAndFlush(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return productRepository.findById(id)
                .map(existing -> {
                    existing.setCode(product.getCode());
                    existing.setName(product.getName());
                    existing.setBarcode(product.getBarcode());
                    existing.setBrand(product.getBrand());
                    existing.setCategory(product.getCategory());
                    existing.setBuyingPrice(product.getBuyingPrice());
                    existing.setVehicleCompatibility(product.getVehicleCompatibility());
                    existing.setExpirationDate(product.getExpirationDate());
                    existing.setVolume(product.getVolume());
                    existing.setMinStock(product.getMinStock());
                    existing.setActive(product.getActive());
                    return ResponseEntity.ok(productRepository.saveAndFlush(existing));
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
