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
    
    public List<ProductPriceHistory> getPriceHistoryByType(Long productId, String priceType) {
        return priceHistoryRepository.findByProductIdAndPriceTypeOrderByStartDateDesc(productId, priceType);
    }
    
    public Optional<BigDecimal> getCurrentPrice(Long productId, String priceType) {
        return priceHistoryRepository.findCurrentPriceForProductByType(productId, LocalDate.now(), priceType)
                .map(ProductPriceHistory::getPrice);
    }
    
    @Transactional
    public ProductPriceHistory addNewPrice(Long productId, BigDecimal price, LocalDate startDate, String priceType) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        final LocalDate effectiveStartDate = (startDate == null) ? LocalDate.now() : startDate;
        
        priceHistoryRepository.findActiveForProductByType(productId, priceType)
                .ifPresent(activePrice -> {
                    activePrice.setEndDate(effectiveStartDate.minusDays(1));
                    priceHistoryRepository.save(activePrice);
                });
        
        ProductPriceHistory newPriceHistory = new ProductPriceHistory();
        newPriceHistory.setProduct(product);
        newPriceHistory.setPriceType(priceType);
        newPriceHistory.setPrice(price);
        newPriceHistory.setStartDate(effectiveStartDate);
        newPriceHistory.setEndDate(null);
        
        ProductPriceHistory saved = priceHistoryRepository.save(newPriceHistory);
        
        if ("SELLING".equals(priceType)) {
            product.setSellingPrice(price);
        } else if ("BUYING".equals(priceType)) {
            product.setBuyingPrice(price);
        }
        productRepository.save(product);
        
        return saved;
    }
}
