package com.garage.management.service;

import com.garage.management.entity.*;
import com.garage.management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class WorkOrderService {
    
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderProductLineRepository productLineRepository;
    private final WorkOrderServiceLineRepository serviceLineRepository;
    private final ProductRepository productRepository;
    private final ProductPriceHistoryRepository productPriceHistoryRepository;
    private final ServiceRepository serviceRepository;
    private final ServicePriceHistoryRepository servicePriceHistoryRepository;
    
    public WorkOrderService(WorkOrderRepository workOrderRepository,
                            WorkOrderProductLineRepository productLineRepository,
                            WorkOrderServiceLineRepository serviceLineRepository,
                            ProductRepository productRepository,
                            ProductPriceHistoryRepository productPriceHistoryRepository,
                            ServiceRepository serviceRepository,
                            ServicePriceHistoryRepository servicePriceHistoryRepository) {
        this.workOrderRepository = workOrderRepository;
        this.productLineRepository = productLineRepository;
        this.serviceLineRepository = serviceLineRepository;
        this.productRepository = productRepository;
        this.productPriceHistoryRepository = productPriceHistoryRepository;
        this.serviceRepository = serviceRepository;
        this.servicePriceHistoryRepository = servicePriceHistoryRepository;
    }
    
    @Transactional
    public WorkOrderProductLine addProductLine(Long workOrderId, Long productId, 
                                                Integer quantity, BigDecimal discountPercent) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        BigDecimal standardPrice = productPriceHistoryRepository
                .findCurrentPriceForProduct(productId, LocalDate.now())
                .map(pph -> pph.getPrice())
                .orElse(product.getSellingPrice() != null ? product.getSellingPrice() : BigDecimal.ZERO);
        
        BigDecimal finalUnitPrice;
        if (discountPercent != null && discountPercent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountFactor = BigDecimal.ONE.subtract(
                    discountPercent.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
            );
            finalUnitPrice = standardPrice.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);
        } else {
            finalUnitPrice = standardPrice;
            discountPercent = BigDecimal.ZERO;
        }
        
        BigDecimal lineTotal = finalUnitPrice.multiply(new BigDecimal(quantity)).setScale(2, RoundingMode.HALF_UP);
        
        WorkOrderProductLine line = new WorkOrderProductLine();
        line.setWorkOrder(workOrder);
        line.setProduct(product);
        line.setQuantity(quantity);
        line.setStandardPrice(standardPrice);
        line.setDiscountPercent(discountPercent);
        line.setFinalUnitPrice(finalUnitPrice);
        line.setLineTotal(lineTotal);
        
        WorkOrderProductLine saved = productLineRepository.save(line);
        
        recalculateWorkOrderTotal(workOrderId);
        
        return saved;
    }
    
    @Transactional
    public WorkOrderServiceLine addServiceLine(Long workOrderId, Long serviceId, 
                                                Integer quantity) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        BigDecimal unitPrice = servicePriceHistoryRepository
                .findCurrentPriceForService(serviceId, LocalDate.now())
                .map(sph -> sph.getPrice())
                .orElse(service.getSellingPrice() != null ? service.getSellingPrice() : BigDecimal.ZERO);
        
        BigDecimal lineTotal = unitPrice.multiply(new BigDecimal(quantity)).setScale(2, RoundingMode.HALF_UP);
        
        WorkOrderServiceLine line = new WorkOrderServiceLine();
        line.setWorkOrder(workOrder);
        line.setService(service);
        line.setQuantity(quantity);
        line.setUnitPrice(unitPrice);
        line.setLineTotal(lineTotal);
        
        WorkOrderServiceLine saved = serviceLineRepository.save(line);
        
        recalculateWorkOrderTotal(workOrderId);
        
        return saved;
    }
    
    @Transactional
    public void recalculateWorkOrderTotal(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        
        List<WorkOrderProductLine> productLines = productLineRepository.findByWorkOrderId(workOrderId);
        List<WorkOrderServiceLine> serviceLines = serviceLineRepository.findByWorkOrderId(workOrderId);
        
        BigDecimal productTotal = productLines.stream()
                .map(WorkOrderProductLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal serviceTotal = serviceLines.stream()
                .map(WorkOrderServiceLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        workOrder.setTotalAmount(productTotal.add(serviceTotal));
        workOrderRepository.save(workOrder);
    }
    
    public WorkOrderTotals getWorkOrderTotals(Long workOrderId) {
        List<WorkOrderProductLine> productLines = productLineRepository.findByWorkOrderId(workOrderId);
        List<WorkOrderServiceLine> serviceLines = serviceLineRepository.findByWorkOrderId(workOrderId);
        
        BigDecimal servicesSubtotal = serviceLines.stream()
                .map(WorkOrderServiceLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal productsBeforeDiscount = productLines.stream()
                .map(line -> line.getStandardPrice().multiply(new BigDecimal(line.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal productsAfterDiscount = productLines.stream()
                .map(WorkOrderProductLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal productsDiscountTotal = productsBeforeDiscount.subtract(productsAfterDiscount);
        
        BigDecimal grandTotal = servicesSubtotal.add(productsAfterDiscount);
        
        return new WorkOrderTotals(servicesSubtotal, productsBeforeDiscount, 
                productsDiscountTotal, productsAfterDiscount, grandTotal);
    }
    
    public static class WorkOrderTotals {
        public BigDecimal servicesSubtotal;
        public BigDecimal productsBeforeDiscount;
        public BigDecimal productsDiscountTotal;
        public BigDecimal productsAfterDiscount;
        public BigDecimal grandTotal;
        
        public WorkOrderTotals(BigDecimal servicesSubtotal, BigDecimal productsBeforeDiscount,
                               BigDecimal productsDiscountTotal, BigDecimal productsAfterDiscount,
                               BigDecimal grandTotal) {
            this.servicesSubtotal = servicesSubtotal;
            this.productsBeforeDiscount = productsBeforeDiscount;
            this.productsDiscountTotal = productsDiscountTotal;
            this.productsAfterDiscount = productsAfterDiscount;
            this.grandTotal = grandTotal;
        }
    }
}
