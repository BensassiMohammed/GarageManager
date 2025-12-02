package com.garage.management.controller;

import com.garage.management.entity.Vehicle;
import com.garage.management.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping
    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Long id) {
        return vehicleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        return vehicleRepository.findById(id)
                .map(existing -> {
                    existing.setRegistrationNumber(vehicle.getRegistrationNumber());
                    existing.setBrand(vehicle.getBrand());
                    existing.setModel(vehicle.getModel());
                    existing.setType(vehicle.getType());
                    existing.setYear(vehicle.getYear());
                    existing.setMileage(vehicle.getMileage());
                    existing.setColor(vehicle.getColor());
                    existing.setCurrentOwner(vehicle.getCurrentOwner());
                    existing.setStatus(vehicle.getStatus());
                    return ResponseEntity.ok(vehicleRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return vehicleRepository.findById(id)
                .map(vehicle -> {
                    vehicleRepository.delete(vehicle);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
