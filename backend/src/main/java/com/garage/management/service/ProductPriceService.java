package com.garage.management.service;

import com.garage.management.entity.Product;
import com.garage.management.entity.ProductPriceHistory;
import com.garage.management.entity.ProductBuyingPriceHistory;
import com.garage.management.repository.ProductPriceHistoryRepository;
import com.garage.management.repository.ProductBuyingPriceHistoryRepository;
import com.garage.management.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProductPriceService {
    
    private final ProductPriceHistoryRepository sellingPriceHistoryRepository;
    private final ProductBuyingPriceHistoryRepository buyingPriceHistoryRepository;
    private final ProductRepository productRepository;
    
    public ProductPriceService(ProductPriceHistoryRepository sellingPriceHistoryRepository,
                               ProductBuyingPriceHistoryRepository buyingPriceHistoryRepository,
                               ProductRepository productRepository) {
        this.sellingPriceHistoryRepository = sellingPriceHistoryRepository;
        this.buyingPriceHistoryRepository = buyingPriceHistoryRepository;
        this.productRepository = productRepository;
    }
    
    // Selling Price History Methods
    public List<ProductPriceHistory> getSellingPriceHistory(Long productId) {
        return sellingPriceHistoryRepository.findByProductIdOrderByStartDateDesc(productId);
    }
    
    public Optional<BigDecimal> getCurrentSellingPrice(Long productId) {
        return sellingPriceHistoryRepository.findCurrentPriceForProduct(productId, LocalDate.now())
                .map(ProductPriceHistory::getPrice);
    }
    
    @Transactional
    public ProductPriceHistory addNewSellingPrice(Long productId, BigDecimal price, LocalDate startDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        final LocalDate effectiveStartDate = (startDate == null) ? LocalDate.now() : startDate;
        
        sellingPriceHistoryRepository.findActiveForProduct(productId)
                .ifPresent(activePrice -> {
                    activePrice.setEndDate(effectiveStartDate.minusDays(1));
                    sellingPriceHistoryRepository.save(activePrice);
                });
        
        ProductPriceHistory newPriceHistory = new ProductPriceHistory();
        newPriceHistory.setProduct(product);
        newPriceHistory.setPrice(price);
        newPriceHistory.setStartDate(effectiveStartDate);
        newPriceHistory.setEndDate(null);
        
        ProductPriceHistory saved = sellingPriceHistoryRepository.save(newPriceHistory);
        
        product.setSellingPrice(price);
        productRepository.save(product);
        
        return saved;
    }
    
    // Buying Price History Methods
    public List<ProductBuyingPriceHistory> getBuyingPriceHistory(Long productId) {
        return buyingPriceHistoryRepository.findByProductIdOrderByStartDateDesc(productId);
    }
    
    public Optional<BigDecimal> getCurrentBuyingPrice(Long productId) {
        return buyingPriceHistoryRepository.findCurrentPriceForProduct(productId, LocalDate.now())
                .map(ProductBuyingPriceHistory::getPrice);
    }
    
    @Transactional
    public ProductBuyingPriceHistory addNewBuyingPrice(Long productId, BigDecimal price, LocalDate startDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        final LocalDate effectiveStartDate = (startDate == null) ? LocalDate.now() : startDate;
        
        buyingPriceHistoryRepository.findActiveForProduct(productId)
                .ifPresent(activePrice -> {
                    activePrice.setEndDate(effectiveStartDate.minusDays(1));
                    buyingPriceHistoryRepository.save(activePrice);
                });
        
        ProductBuyingPriceHistory newPriceHistory = new ProductBuyingPriceHistory();
        newPriceHistory.setProduct(product);
        newPriceHistory.setPrice(price);
        newPriceHistory.setStartDate(effectiveStartDate);
        newPriceHistory.setEndDate(null);
        
        ProductBuyingPriceHistory saved = buyingPriceHistoryRepository.save(newPriceHistory);
        
        product.setBuyingPrice(price);
        productRepository.save(product);
        
        return saved;
    }
    
    // Legacy methods for backward compatibility
    public List<ProductPriceHistory> getPriceHistory(Long productId) {
        return getSellingPriceHistory(productId);
    }
    
    public Optional<BigDecimal> getCurrentPrice(Long productId) {
        return getCurrentSellingPrice(productId);
    }
    
    @Transactional
    public ProductPriceHistory addNewPrice(Long productId, BigDecimal price, LocalDate startDate) {
        return addNewSellingPrice(productId, price, startDate);
    }
}
