package com.garage.management.service;

import com.garage.management.entity.Product;
import com.garage.management.entity.ProductPriceHistory;
import com.garage.management.repository.ProductPriceHistoryRepository;
import com.garage.management.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProductPriceService {
    
    private final ProductPriceHistoryRepository priceHistoryRepository;
    private final ProductRepository productRepository;
    
    public ProductPriceService(ProductPriceHistoryRepository priceHistoryRepository,
                               ProductRepository productRepository) {
        this.priceHistoryRepository = priceHistoryRepository;
        this.productRepository = productRepository;
    }
    
    public List<ProductPriceHistory> getPriceHistory(Long productId) {
        return priceHistoryRepository.findByProductIdOrderByStartDateDesc(productId);
    }
    
    public Optional<BigDecimal> getCurrentPrice(Long productId) {
        return priceHistoryRepository.findCurrentPriceForProduct(productId, LocalDate.now())
                .map(ProductPriceHistory::getPrice);
    }
    
    @Transactional
    public ProductPriceHistory addNewPrice(Long productId, BigDecimal price, LocalDate startDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        final LocalDate effectiveStartDate = (startDate == null) ? LocalDate.now() : startDate;
        
        priceHistoryRepository.findActiveForProduct(productId)
                .ifPresent(activePrice -> {
                    activePrice.setEndDate(effectiveStartDate.minusDays(1));
                    priceHistoryRepository.save(activePrice);
                });
        
        ProductPriceHistory newPriceHistory = new ProductPriceHistory();
        newPriceHistory.setProduct(product);
        newPriceHistory.setPrice(price);
        newPriceHistory.setStartDate(effectiveStartDate);
        newPriceHistory.setEndDate(null);
        
        ProductPriceHistory saved = priceHistoryRepository.save(newPriceHistory);
        
        product.setSellingPrice(price);
        productRepository.save(product);
        
        return saved;
    }
}
