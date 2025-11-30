package com.garage.management.service;

import com.garage.management.entity.Product;
import com.garage.management.entity.StockMovement;
import com.garage.management.entity.SupplierOrder;
import com.garage.management.entity.SupplierOrderLine;
import com.garage.management.enums.OrderStatus;
import com.garage.management.enums.StockMovementType;
import com.garage.management.repository.ProductRepository;
import com.garage.management.repository.StockMovementRepository;
import com.garage.management.repository.SupplierOrderLineRepository;
import com.garage.management.repository.SupplierOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StockService {
    
    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final SupplierOrderRepository supplierOrderRepository;
    private final SupplierOrderLineRepository supplierOrderLineRepository;
    
    public StockService(StockMovementRepository stockMovementRepository,
                        ProductRepository productRepository,
                        SupplierOrderRepository supplierOrderRepository,
                        SupplierOrderLineRepository supplierOrderLineRepository) {
        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
        this.supplierOrderRepository = supplierOrderRepository;
        this.supplierOrderLineRepository = supplierOrderLineRepository;
    }
    
    public Integer computeCurrentStock(Long productId) {
        List<StockMovement> movements = stockMovementRepository.findByProductId(productId);
        return movements.stream()
                .mapToInt(StockMovement::getQuantityDelta)
                .sum();
    }
    
    public Map<Long, Integer> computeAllProductsStock() {
        List<StockMovement> allMovements = stockMovementRepository.findAll();
        Map<Long, Integer> stockMap = new HashMap<>();
        
        for (StockMovement movement : allMovements) {
            Long productId = movement.getProduct().getId();
            stockMap.merge(productId, movement.getQuantityDelta(), Integer::sum);
        }
        
        return stockMap;
    }
    
    @Transactional
    public void updateProductStocks() {
        Map<Long, Integer> stockMap = computeAllProductsStock();
        List<Product> products = productRepository.findAll();
        
        for (Product product : products) {
            Integer computedStock = stockMap.getOrDefault(product.getId(), 0);
            product.setCurrentStock(computedStock);
            productRepository.save(product);
        }
    }
    
    @Transactional
    public SupplierOrder markOrderAsReceived(Long orderId) {
        SupplierOrder order = supplierOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Supplier order not found"));
        
        if (order.getStatus() == OrderStatus.RECEIVED) {
            throw new RuntimeException("Order already marked as received");
        }
        
        List<SupplierOrderLine> lines = supplierOrderLineRepository.findBySupplierOrderId(orderId);
        
        for (SupplierOrderLine line : lines) {
            StockMovement movement = new StockMovement();
            movement.setProduct(line.getProduct());
            movement.setDate(LocalDateTime.now());
            movement.setQuantityDelta(line.getQuantity());
            movement.setType(StockMovementType.PURCHASE);
            movement.setReason("Supplier Order #" + orderId + " received");
            movement.setSourceType("SUPPLIER_ORDER");
            movement.setSourceId(orderId);
            stockMovementRepository.save(movement);
            
            Product product = line.getProduct();
            product.setCurrentStock(product.getCurrentStock() + line.getQuantity());
            productRepository.save(product);
        }
        
        order.setStatus(OrderStatus.RECEIVED);
        return supplierOrderRepository.save(order);
    }
    
    @Transactional
    public StockMovement addStockMovement(Long productId, Integer quantity, 
                                          StockMovementType type, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setDate(LocalDateTime.now());
        movement.setQuantityDelta(quantity);
        movement.setType(type);
        movement.setReason(reason);
        
        StockMovement saved = stockMovementRepository.save(movement);
        
        product.setCurrentStock(product.getCurrentStock() + quantity);
        productRepository.save(product);
        
        return saved;
    }
}
