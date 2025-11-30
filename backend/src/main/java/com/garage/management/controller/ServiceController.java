package com.garage.management.controller;

import com.garage.management.entity.ServiceEntity;
import com.garage.management.entity.ServicePriceHistory;
import com.garage.management.repository.ServiceRepository;
import com.garage.management.service.ServicePriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServicePriceService servicePriceService;

    @GetMapping
    public List<ServiceEntity> getAll() {
        return serviceRepository.findByActiveTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceEntity> getById(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/prices")
    public List<ServicePriceHistory> getPriceHistory(@PathVariable Long id) {
        return servicePriceService.getPriceHistory(id);
    }

    @GetMapping("/{id}/current-price")
    public ResponseEntity<BigDecimal> getCurrentPrice(@PathVariable Long id) {
        return servicePriceService.getCurrentPrice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/prices")
    public ResponseEntity<ServicePriceHistory> addPrice(@PathVariable Long id, @RequestBody PriceRequest request) {
        ServicePriceHistory history = servicePriceService.addNewPrice(id, request.price, request.startDate);
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ServiceEntity create(@RequestBody ServiceEntity service) {
        return serviceRepository.save(service);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceEntity> update(@PathVariable Long id, @RequestBody ServiceEntity service) {
        return serviceRepository.findById(id)
                .map(existing -> {
                    existing.setCode(service.getCode());
                    existing.setName(service.getName());
                    existing.setCategory(service.getCategory());
                    existing.setSellingPrice(service.getSellingPrice());
                    existing.setActive(service.getActive());
                    return ResponseEntity.ok(serviceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .map(service -> {
                    service.setActive(false);
                    serviceRepository.save(service);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class PriceRequest {
        public BigDecimal price;
        public LocalDate startDate;
    }
}
