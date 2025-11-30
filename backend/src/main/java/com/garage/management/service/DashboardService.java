package com.garage.management.service;

import com.garage.management.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class DashboardService {
    
    private final WorkOrderRepository workOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final ExpenseRepository expenseRepository;
    private final CompanyRepository companyRepository;
    private final ClientRepository clientRepository;
    private final VehicleRepository vehicleRepository;
    private final SupplierRepository supplierRepository;
    private final ServiceRepository serviceRepository;
    
    public DashboardService(WorkOrderRepository workOrderRepository,
                            InvoiceRepository invoiceRepository,
                            ProductRepository productRepository,
                            ExpenseRepository expenseRepository,
                            CompanyRepository companyRepository,
                            ClientRepository clientRepository,
                            VehicleRepository vehicleRepository,
                            SupplierRepository supplierRepository,
                            ServiceRepository serviceRepository) {
        this.workOrderRepository = workOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.productRepository = productRepository;
        this.expenseRepository = expenseRepository;
        this.companyRepository = companyRepository;
        this.clientRepository = clientRepository;
        this.vehicleRepository = vehicleRepository;
        this.supplierRepository = supplierRepository;
        this.serviceRepository = serviceRepository;
    }
    
    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats();
        
        stats.openWorkOrders = workOrderRepository.countOpenWorkOrders();
        if (stats.openWorkOrders == null) stats.openWorkOrders = 0L;
        
        stats.outstandingAmount = invoiceRepository.getTotalOutstandingAmount();
        if (stats.outstandingAmount == null) stats.outstandingAmount = BigDecimal.ZERO;
        
        stats.lowStockProducts = productRepository.countLowStockProducts();
        if (stats.lowStockProducts == null) stats.lowStockProducts = 0L;
        
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();
        stats.monthlyExpenses = expenseRepository.getTotalExpensesBetween(monthStart, monthEnd);
        if (stats.monthlyExpenses == null) stats.monthlyExpenses = BigDecimal.ZERO;
        
        stats.totalCompanies = companyRepository.count();
        stats.totalClients = clientRepository.count();
        stats.totalVehicles = vehicleRepository.count();
        stats.totalProducts = productRepository.count();
        stats.totalServices = serviceRepository.count();
        stats.totalSuppliers = supplierRepository.count();
        
        return stats;
    }
    
    public static class DashboardStats {
        public Long openWorkOrders;
        public BigDecimal outstandingAmount;
        public Long lowStockProducts;
        public BigDecimal monthlyExpenses;
        public Long totalCompanies;
        public Long totalClients;
        public Long totalVehicles;
        public Long totalProducts;
        public Long totalServices;
        public Long totalSuppliers;
    }
}
