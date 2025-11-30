package com.garage.management.controller;

import com.garage.management.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    @GetMapping("/stats")
    public ResponseEntity<DashboardService.DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}
